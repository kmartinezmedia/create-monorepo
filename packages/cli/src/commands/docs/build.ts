import { watch as fsWatch } from 'node:fs';
import path from 'node:path';
import { Props } from 'bluebun';
import { Project } from 'ts-morph';
import { getDocgenParser } from '../../utils/getDocgenParser';

interface BuildProps extends Props {
  options: {
    typesFile?: string;
    entrypoints: string;
    outDir: string;
    watch?: boolean;
    watchDir?: string;
    clean?: boolean;
  };
}

export default {
  name: 'build',
  description: '🚀 Build',
  run: async (props: BuildProps) => {
    const {
      outDir,
      clean,
      watch,
      entrypoints: entrypointsString,
      watchDir = 'src',
      typesFile = `${watchDir}/types.ts`,
    } = props.options;

    const WORKSPACE_DIR = Bun.env.PWD ?? '';
    const entrypoints = entrypointsString.split(',');

    const tsconfigFile = path.resolve(WORKSPACE_DIR, 'tsconfig.json');

    // Clean old dist directory
    if (clean) {
      const rmProcess = Bun.spawn(['rm', '-rf', outDir]);
      await rmProcess.exited;
    }

    async function build() {
      console.log('Building...');
      try {
        const tsConfigParser = getDocgenParser(tsconfigFile);
        const tsMorphProject = new Project();
        const rootTypesFile = path.resolve(WORKSPACE_DIR, typesFile);
        const tsMorphTypes = tsMorphProject.addSourceFileAtPath(rootTypesFile);
        const tsMorphAliasMap = new Map<string, string>();

        for (const filePath of entrypoints) {
          const docData = tsConfigParser.parse(filePath);
          const { dir, ext } = path.parse(filePath);
          const docDest = filePath.replace(dir, outDir).replace(ext, '.md');

          const docFile = Bun.file(docDest);
          const writer = docFile.writer();
          for (const component of docData) {
            const example = component.tags?.example;
            writer.write(`## ${component.displayName}\n\n`);

            if (component.description) {
              writer.write(`${component.description}\n\n`);
            }

            if (example) {
              writer.write('### Example\n\n');
              writer.write(example);
              writer.write('\n\n');
              writer.flush();
            }

            if (component.props) {
              writer.write('### Props\n\n');
              writer.write('| Prop Name | Type | Description |\n');
              writer.write('| --- | --- | --- |\n');

              for (const propName of Object.keys(component.props)) {
                const prop = component.props[propName];

                let propValue = prop.type.name;
                if (propValue.includes('|')) {
                  propValue = propValue.replace(/\|/g, '\\|'); // Escape '|' characters
                } else {
                  // Expand type aliases to their union types
                  const typeAliasFromCache = tsMorphAliasMap.get(
                    prop.type.name,
                  );
                  if (typeAliasFromCache) {
                    propValue = typeAliasFromCache;
                  } else {
                    const typeAliasMatch = tsMorphTypes
                      .getTypeAlias(propValue)
                      ?.getType();
                    if (typeAliasMatch) {
                      // @ts-expect-error compilerType.types returns an array of objects. https://ts-ast-viewer.com/
                      propValue = typeAliasMatch.compilerType.types
                        .map((item: { value: string }) => `"${item.value}"`)
                        .filter(Boolean)
                        .join(' \\| ');
                      tsMorphAliasMap.set(prop.type.name, propValue);
                    }
                  }
                }

                writer.write(
                  `| \`${propName}\` | \`${propValue}\` | ${
                    prop.description || 'No description available'
                  } |\n`,
                );
              }

              writer.write('\n\n');
              writer.flush();
            }
          }
          writer.end();
        }

        console.log('Build complete');
      } catch (err) {
        console.log(err);
      }
    }

    if (props.options.watch) {
      console.log('Watching for changes...');
    }

    await build();

    if (props.options.watch) {
      const watcher = fsWatch(
        watchDir,
        { recursive: true },
        async (event, filename) => {
          console.log(`Detected ${event} in ${filename}`);
          await build();
        },
      );

      process.on('SIGINT', () => {
        // close watcher when Ctrl-C is pressed
        console.log('Closing watcher...');
        watcher.close();
        process.exit(0);
      });
    }
  },
};

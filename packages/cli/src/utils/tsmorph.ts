import { Project } from 'ts-morph';

interface ParserOptions {
  /** Absolute path of tsconfig.json file to use for parsing types */
  tsConfigFilePath: string;
}

function createParser({ tsConfigFilePath }: ParserOptions) {
  const project = new Project({
    tsConfigFilePath,
  });
  const sourceFiles = project.getSourceFiles();
  console.log(sourceFiles);
}

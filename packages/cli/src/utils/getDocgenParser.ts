import { type PropItem, withCustomConfig } from 'react-docgen-typescript';

export function getDocgenParser(tsconfigFile: string) {
  return withCustomConfig(tsconfigFile, {
    skipChildrenPropWithoutDoc: false,
    shouldRemoveUndefinedFromOptional: true,
    propFilter: ({ declarations, name }: PropItem) => {
      if (declarations) {
        const fromNodeModules = Boolean(
          declarations.find(({ fileName }) =>
            fileName.includes('node_modules'),
          ),
        );
        // Filter out props from node modules. Keep children prop even though it's in @types/react.
        return name === 'children' || !fromNodeModules;
      }
      return true;
    },
  });
}

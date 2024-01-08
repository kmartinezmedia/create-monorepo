import { type ComponentDoc } from 'react-docgen-typescript';

export function generateMarkdownDoc(componentData: ComponentDoc[]): string {
  let markdown = '';

  for (const component of componentData) {
    markdown += `## ${component.displayName}\n\n`;

    if (component.description) {
      markdown += `${component.description}\n\n`;
    }

    if (component.props) {
      markdown += '### Props\n\n';
      markdown += '| Prop Name | Type | Description |\n';
      markdown += '| --- | --- | --- |\n';

      for (const propName of Object.keys(component.props)) {
        const prop = component.props[propName];
        markdown += `| \`${propName}\` | \`${prop.type.name}\` | ${
          prop.description || 'No description available'
        } |\n`;
      }

      markdown += '\n\n';
    }
  }

  return markdown;
}

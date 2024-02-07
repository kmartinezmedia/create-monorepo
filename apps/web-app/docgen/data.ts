import { DocgenSource, DocgenSourceList } from './types';

export const data = {
  name: 'Components',
  description: 'Components are the building blocks of the design system.',
  _data: new Map<string, DocgenSource>([
    [
      'avatar',
      {
        examples: [''],
        description: 'An graphical representation of a user or entity.',
        name: 'Avatar',
        slug: 'avatar',
        properties: [
          {
            name: 'src',
            description: 'The source of the image.',
            value: { type: 'string', value: 'string' },
          },
        ],
      },
    ],
  ]),
  get sources() {
    return [...this._data.values()];
  },
  get(val: string) {
    return this._data.get(val);
  },
} satisfies DocgenSourceList;
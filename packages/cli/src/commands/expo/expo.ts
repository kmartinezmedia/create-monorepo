import { type Props, commandHelp, print } from 'bluebun';

export default {
  name: 'expo',
  description: '',
  run: async (props: Props) => {
    print(await commandHelp(props));
  },
};

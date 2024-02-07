import { type Props } from 'bluebun';
import { getCommandHelp } from '../../utils/getCommandHelp';

export default {
  name: 'expo',
  description: '',
  run: async (props: Props) => {
    switch (props?.first) {
      case 'build':
        return require('./build').default.run(props);
      case 'dev':
        return require('./dev').default.run(props);
      case 'launch':
        return require('./launch').default.run(props);
      case 'update':
        return require('./update').default.run(props);
      default: {
        await getCommandHelp(props);
        break;
      }
    }
  },
};

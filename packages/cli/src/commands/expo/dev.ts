import { Props } from 'bluebun';
import { $ } from 'zx';
import type { MobileProps } from './_setup';
import { setup } from './_setup';

interface MobileStartProps extends Props {
  options: MobileProps['options'] & {
    // Clear the cache when starting dev server
    clear?: boolean;
  };
}

export default {
  name: 'dev',
  description: '🚧 Dev',
  run: async (props: MobileStartProps) => {
    console.log('running dev');
    const { platform, scheme, output } = await setup({
      props,
    });

    $.prefix += `export EXPO_USE_METRO_WORKSPACE_ROOT='1';`;

    const simExists = await $`xcode-select -p`;
    if (typeof simExists.stdout === 'string') {
      await $`open -a simulator`;
    }

    await $`eas build:run --platform ${platform} --path ${output.launchFile}`;

    const extraArgs = [];

    if (props.options.clear) {
      extraArgs.push('--clear');
    }

    await $`expo start --${platform} --dev-client --localhost --scheme ${scheme} ${extraArgs}`;
  },
};

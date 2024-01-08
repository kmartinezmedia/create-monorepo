import { $ } from 'zx';
import type { MobileProps } from './_setup';
import { setup } from './_setup';

export default {
  name: 'build',
  description: '🚀 Build',
  run: async (props: MobileProps) => {
    const { platform, profile, output } = await setup({
      props,
    });

    // Remove old tarball app
    await $`rm -rf ${output.artifact}`;

    await $`eas build --local --non-interactive --json --clear-cache --platform ${platform} --profile ${profile} --output ${output.artifact}`;
  },
};

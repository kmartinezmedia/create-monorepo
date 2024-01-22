import { $ } from 'bun';
import type { MobileProps } from './_setup';
import { setup } from './_setup';

export default {
  name: 'build',
  description: '🚀 Build',
  run: async (props: MobileProps) => {
    const { platform, profile, output, easCliVersion } = await setup({
      props,
    });

    // Remove old tarball app
    await $`rm -rf ${output.artifact}`;

    await $`bunx eas-cli@${easCliVersion} build --local --non-interactive --json --clear-cache --platform ${platform} --profile ${profile} --output ${output.artifact}`;
  },
};

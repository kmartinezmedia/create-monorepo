import { $ } from 'bun';
import type { MobileProps } from './_setup';
import { setup } from './_setup';

export default {
  name: 'launch',
  description: '🚀 Launch',
  run: async (props: MobileProps) => {
    const { platform, output, easCliVersion } = await setup({
      props,
    });

    await $`bunx eas-cli@${easCliVersion} build:run --platform ${platform} --path ${output.launchFile}`;
  },
};

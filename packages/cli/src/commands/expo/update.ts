import { $ } from 'bun';
import type { MobileProps } from './_setup';
import { setup } from './_setup';

export default {
  name: 'update',
  description: '🚀 Update',
  run: async (props: MobileProps) => {
    const { channel, easCliVersion } = await setup({
      props,
    });

    await $`bunx eas-cli@${easCliVersion} update --auto --channel ${channel}`;
    await $`rm -rf dist`;
  },
};

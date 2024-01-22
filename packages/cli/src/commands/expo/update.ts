import { $ } from 'bun';
import type { MobileProps } from './_setup';
import { setup } from './_setup';

export default {
  name: 'update',
  description: '🚀 Update',
  run: async (props: MobileProps) => {
    const { channel, easBin } = await setup({
      props,
    });

    await $`bun --bun ${easBin} update --auto --channel ${channel}`;
    await $`rm -rf dist`;
  },
};

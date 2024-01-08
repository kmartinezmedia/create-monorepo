import { $, cd } from 'zx';

export default {
  name: 'typecheck',
  description: '🧹 Typecheck',
  run: async () => {
    cd(Bun.env.PWD);
    await $`bun --bun tsc --noEmit`;
  },
};

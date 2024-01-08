import { $, cd } from 'zx';

export default {
  name: 'clean',
  description: '🧹 Clean',
  run: async () => {
    cd(Bun.env.PWD);

    await $`rm -rf .turbo && rm -rf dist && rm -rf node_modules && rm -rf .next`;
  },
};

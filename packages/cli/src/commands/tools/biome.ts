import { $, cd } from 'zx';

export default {
  name: 'biome',
  description: '',
  run: async () => {
    cd(Bun.env.PWD);
    await $`biome ci .`;
  },
};

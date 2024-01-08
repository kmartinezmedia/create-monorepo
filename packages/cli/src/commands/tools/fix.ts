import { $, cd } from 'zx';

export default {
  name: 'fix',
  description: '',
  run: async () => {
    cd(Bun.env.PWD);
    await $`biome check --apply .`;
  },
};

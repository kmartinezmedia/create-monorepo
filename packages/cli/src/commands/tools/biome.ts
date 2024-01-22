import { $ } from 'bun';

export default {
  name: 'biome',
  description: '',
  run: async () => {
    await $`biome ci .`;
  },
};

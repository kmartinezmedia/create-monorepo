import fs from 'node:fs';
import path from 'node:path';
import { $, cd } from 'zx';
import type { MobileProps } from './_setup';
import { setup } from './_setup';

export default {
  name: 'patch',
  description: '🚀 Patch',
  run: async (props: MobileProps) => {
    const { platform, profile, output, appDirectory } = await setup({
      props,
    });

    $.prefix += `export EXPO_BUNDLE_APP='1';`;

    // Remove old unzipped app
    await $`rm -rf ${output.app}`;
    // cd into the prebuilds/output directory
    cd(output.dir);
    // Unzip the generated tarball
    await $`tar -xf ./${output.name}.tar.gz`;
    // Get the name of the app
    const unzippedName =
      await $`ls -lt | grep .app | head -1 | awk '{print $9}'`;
    const { name, ext } = path.parse(output.app);

    // Go back to the original directory
    cd(appDirectory);

    if (!fs.existsSync(output.app)) {
      fs.renameSync(`${output.dir}/${unzippedName}`, output.app);
    }

    await $`npx expo export:embed --platform ${platform} --dev ${
      profile.includes('debug') ? 'true' : 'false'
    } --entry-file ./index.js  --bundle-output ${
      output.app
    }/main.jsbundle --assets-dest ${output.app}`;

    // cd into the prebuilds/output directory
    cd(output.dir);
    // Zip the generated app with new Javascript
    await $`tar -zcvf ${output.name}.tar.gz ${output.name}.app`;
    // Go back to the original directory
    cd(appDirectory);
    // Remove the unzipped app since it can't be used directly. We need to use the tarball
    // await $`rm -rf ${output.app}`;
  },
};

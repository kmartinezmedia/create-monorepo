import { EasJsonAccessor, EasJsonUtils, Platform } from '@expo/eas-json';
import { type Props, print } from 'bluebun';
import { $ } from 'bun';

export interface MobileProps extends Props {
  options: {
    profile: string;
    platform: Platform.IOS | Platform.ANDROID;
    jsEngine?: 'hermes' | 'jsc';
    debug?: boolean;
  };
}

export async function setup({
  props,
  env: envOpts,
}: { props: MobileProps; env?: Partial<typeof Bun.env> }) {
  const {
    profile,
    platform,
    jsEngine = 'hermes',
    debug = false,
  } = props.options;

  const appDirectory = Bun.env.PWD ?? '';
  const easJsonAccessor = EasJsonAccessor.fromProjectPath(appDirectory);

  const easProfiles =
    await EasJsonUtils.getBuildProfileNamesAsync(easJsonAccessor);

  if (!easProfiles.includes(profile)) {
    const profileNames = easProfiles.join(', ');
    const suggestion = `Please add one or use ${profileNames}.`;

    if (!profile) {
      print(`No profile name was provided. ${suggestion}`);
    } else {
      print(
        `A profile with name ${profile} does not exist as a key in eas.json > build object.\n${suggestion}`,
      );
    }
    process.exit(0);
  }

  const easJsonConfig = await EasJsonUtils.getBuildProfileAsync(
    easJsonAccessor,
    platform,
    profile,
  );

  const easCliConfig = await EasJsonUtils.getCliConfigAsync(easJsonAccessor);
  const easCliVersion = easCliConfig?.version ?? 'latest';

  const {
    APP_BUNDLE_IDENTIFIER,
    APP_ANDROID_BUNDLE_IDENTIFIER: androidId = APP_BUNDLE_IDENTIFIER as string,
    APP_APPLE_BUNDLE_IDENTIFIER: appleId = APP_BUNDLE_IDENTIFIER as string,
  } = easJsonConfig.env ?? {};

  // TODO: Add additional checks for ensuring this value adheres to Android formatting specs
  if (platform === Platform.ANDROID && !androidId) {
    throw new Error(`
      APP_ANDROID_BUNDLE_IDENTIFIER must be defined in eas.json within the ${profile} > env config.
      See https://docs.expo.dev/build-reference/variables/#setting-plaintext-environment-variables-in-easjson for information about env variables in eas.json

      This env variable is used to populate the package key in your app.config.(js|ts) > android
      The format of this env variable must use DNS notation unique name for your app, which is a valid  Android Application ID.

      For example you could use, com.company.app, where com.company is our domain and app is our app.

      We recommend having the release build use the simplest identifier such as com.company.app and your debug variants
      adding additional context such as com.company.app_debug. When publishing, the release identifier must be unique on the Play Store.

      The name may only contain lowercase and uppercase letters (a-z, A-Z), numbers (0-9) and underscores (_),
      separated by periods (.). Each component of the name should start with a lowercase letter.

      These formatting rules only applies to Android. iOS has different requirements.

      See https://docs.expo.dev/versions/latest/config/app/#package for more details on formatting.
      See https://docs.expo.dev/build-reference/variants/ for information about build variants.
      `);
  }

  // TODO: Add additional checks for ensuring this value adheres to Uniform Type Identifier
  if (platform === Platform.IOS && !appleId) {
    throw new Error(`
      APP_APPLE_BUNDLE_IDENTIFIER must be defined in eas.json within the ${profile} > env config.
      See https://docs.expo.dev/build-reference/variables/#setting-plaintext-environment-variables-in-easjson for information about env variables in eas.json

      This env variable is used to populate the package key in your app.config.(js|ts) > ios
      The format of this env variable must use DNS notation unique name for your app, which is a valid Android Application ID.

      For example you could use, com.company.app, where com.company is our domain and app is our app.

      We recommend having the release build use the simplest identifier such as com.company.app and your debug variants
      adding additional context such as com.company.app-debug. When publishing, the release identifier must be unique to the App Store.

      The string format should be Uniform Type Identifier(UTI), which is alphanumeric characters (A-Z,a-z,0-9), hyphen (-), and period (.)

      These formatting rules only applies to iOS. Android has different requirements.

      See https://docs.expo.dev/versions/latest/config/app/#bundleidentifier for more details on formatting.
      See https://docs.expo.dev/build-reference/variants/ for information about build variants.
      `);
  }

  const outputName = `${platform}-${profile}-${jsEngine}`;
  // TODO: make this configurable
  const prebuildsDir = `${appDirectory}/prebuilds`;
  const outputDir = `${prebuildsDir}/${outputName}`;
  const outputFileBase = `${outputDir}/${outputName}`;

  let envVars = Bun.env;

  envVars = {
    ...envVars,
    APP_ANDROID_BUNDLE_IDENTIFIER: androidId,
    APP_APPLE_BUNDLE_IDENTIFIER: appleId,
    RCT_NO_LAUNCH_PACKAGER: '1',
    EXPO_NO_TELEMETRY: '1',
    EXPO_NO_WEB_SETUP: '1',
  };

  if (debug) {
    envVars = {
      ...envVars,
      DEBUG: '*',
      EAS_LOCAL_BUILD_SKIP_CLEANUP: '1',
      EXPO_PROFILE: '1',
    };
  }

  if (envOpts) {
    envVars = { ...envVars, ...envOpts };
  }

  $.env(envVars);

  const output = {
    name: outputName,
    dir: outputDir,
    prebuildsDir: prebuildsDir,
    fileBase: outputFileBase,
    artifact:
      platform === 'ios' ? `${outputFileBase}.tar.gz` : `${outputFileBase}.zip`,
    app: platform === 'ios' ? `${outputFileBase}.app` : 'todo fix android',
    get launchFile() {
      return platform === 'ios' ? this.artifact : this.apk.signed;
    },
    apk: {
      contents: `${outputFileBase}/build`,
      rebuilt: `${outputFileBase}/binary-rebuilt.apk`,
      rebuiltAligned: `${outputFileBase}/binary-rebuilt-aligned.apk`,
      signed: `${outputFileBase}/binary.apk`,
      test: `${outputFileBase}/testBinary.apk`,
    },
  };

  return {
    scheme: platform === 'ios' ? appleId : androidId,
    channel: easJsonConfig.channel,
    debug,
    profile,
    platform,
    jsEngine,
    appDirectory,
    output,
    easCliVersion,
  };
}

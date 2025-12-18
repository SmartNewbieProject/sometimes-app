const { withDangerousMod, IOSConfig } = require('@expo/config-plugins');
const { mergeContents } = require('@expo/config-plugins/build/utils/generateCode');
const fs = require('fs');
const path = require('path');

const IOS_DEPLOYMENT_TARGET = '16.0';

function modifyPodfile(podfileContents) {
  const postInstallCode = `
    # Force iOS ${IOS_DEPLOYMENT_TARGET} deployment target for all pods (required by expo-iap StoreKit 2 APIs)
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        current_target = config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
        if current_target.nil? || Gem::Version.new(current_target) < Gem::Version.new('${IOS_DEPLOYMENT_TARGET}')
          config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${IOS_DEPLOYMENT_TARGET}'
        end
      end
    end`;

  const result = mergeContents({
    tag: 'expo-iap-ios16-deployment-target',
    src: podfileContents,
    newSrc: postInstallCode,
    anchor: /react_native_post_install\(/,
    offset: 0,
    comment: '#',
  });

  if (!result.didMerge) {
    const postInstallMatch = podfileContents.match(/post_install\s+do\s+\|installer\|/);
    if (postInstallMatch) {
      const insertPosition = podfileContents.indexOf('post_install do |installer|') + 'post_install do |installer|'.length;
      return (
        podfileContents.slice(0, insertPosition) +
        '\n' +
        postInstallCode +
        '\n' +
        podfileContents.slice(insertPosition)
      );
    }
  }

  return result.contents;
}

const withIOS16DeploymentTarget = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');

      if (fs.existsSync(podfilePath)) {
        let podfileContents = fs.readFileSync(podfilePath, 'utf8');
        podfileContents = modifyPodfile(podfileContents);
        fs.writeFileSync(podfilePath, podfileContents);
        console.log(`[withIOS16DeploymentTarget] Modified Podfile to enforce iOS ${IOS_DEPLOYMENT_TARGET} deployment target for all pods`);
      }

      return config;
    },
  ]);
};

module.exports = withIOS16DeploymentTarget;

/**
 * Xcode 27 / SDK iOS 27 refusent de lancer une app qui n'adopte pas le cycle
 * de vie UIScene : l'app s'installe mais se ferme immediatement avec
 * « UIScene life cycle is required ». Expo prebuild ne genere pas encore le
 * manifeste ni le scene delegate, et ios/ est dans .gitignore : ce plugin
 * rejoue donc le correctif a chaque prebuild.
 */
const { withInfoPlist, withAppDelegate } = require('expo/config-plugins');

const SCENE_DELEGATE = 'EXExpoAppSceneDelegate';
const PROVIDER = 'ExpoReactNativeFactoryProvider';

/** Declare la scene par defaut et le delegate fourni par expo-modules-core. */
function withSceneManifest(config) {
  return withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: SCENE_DELEGATE,
          },
        ],
      },
    };
    return cfg;
  });
}

/**
 * Le delegate de scene va chercher la factory React via ce protocole. Sans lui
 * la scene s'ouvre sur une fenetre vide. La fenetre manuelle doit disparaitre :
 * c'est desormais UIKit qui la cree, et en garder une seconde masque la vraie.
 */
function withFactoryProvider(config) {
  return withAppDelegate(config, (cfg) => {
    let src = cfg.modResults.contents;

    if (!src.includes(PROVIDER)) {
      src = src.replace(
        /class AppDelegate: ExpoAppDelegate\b/,
        `class AppDelegate: ExpoAppDelegate, ${PROVIDER}`
      );
    }

    // Retire le bloc `window = UIWindow(...)` + startReactNative(in: window).
    src = src.replace(
      /#if os\(iOS\) \|\| os\(tvOS\)\s*\n\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\s*\n\s*factory\.startReactNative\([\s\S]*?\)\s*\n#endif\s*\n/,
      ''
    );

    if (src.includes(PROVIDER) === false) {
      throw new Error('with-uiscene : impossible de declarer ' + PROVIDER);
    }

    cfg.modResults.contents = src;
    return cfg;
  });
}

module.exports = (config) => withFactoryProvider(withSceneManifest(config));

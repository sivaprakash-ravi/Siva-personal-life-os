const fs = require('fs');
const path = require('path');

const {
  withAndroidManifest,
  withAndroidStyles,
  withDangerousMod,
  AndroidConfig,
} = require('expo/config-plugins');

const SPLASH_SOURCE = 'assets/branding/splash/siva-os-launch.png';
const SPLASH_ART_FILENAME = 'splash_artwork.png';
const SPLASH_ACTIVITY_NAME = '.SplashActivity';
const LAUNCH_THEME = 'Theme.App.SplashSIVALaunch';

function androidMainDir(projectRoot) {
  return path.join(projectRoot, 'android', 'app', 'src', 'main');
}

function withSivaLaunchScreen(config) {
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const mainDir = androidMainDir(projectRoot);

      // 1. Reuse the EXACT approved artwork (byte-for-byte copy, no processing).
      const resDir = path.join(mainDir, 'res');
      fs.mkdirSync(path.join(resDir, 'drawable-nodpi'), { recursive: true });
      fs.copyFileSync(
        path.join(projectRoot, SPLASH_SOURCE),
        path.join(resDir, 'drawable-nodpi', SPLASH_ART_FILENAME)
      );

      // 2. Blank (transparent) platform splash icon so Android 12+/<12 shows
      //    only the brand background before the artwork renders.
      const drawableDir = path.join(resDir, 'drawable');
      fs.mkdirSync(drawableDir, { recursive: true });
      fs.writeFileSync(
        path.join(drawableDir, 'splash_blank.xml'),
        [
          '<?xml version="1.0" encoding="utf-8"?>',
          '<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">',
          '  <solid android:color="#00000000"/>',
          '  <size android:width="1dp" android:height="1dp"/>',
          '</shape>',
          '',
        ].join('\n')
      );

      // 3. Full-window artwork layout (fitCenter keeps the whole artwork
      //    visible on the brand background without cropping or distortion).
      const layoutDir = path.join(resDir, 'layout');
      fs.mkdirSync(layoutDir, { recursive: true });
      fs.writeFileSync(
        path.join(layoutDir, 'activity_splash.xml'),
        [
          '<?xml version="1.0" encoding="utf-8"?>',
          '<ImageView xmlns:android="http://schemas.android.com/apk/res/android"',
          '    android:id="@+id/splashArtwork"',
          '    android:layout_width="match_parent"',
          '    android:layout_height="match_parent"',
          '    android:background="@color/splashscreen_background"',
          '    android:contentDescription="@string/app_name"',
          '    android:scaleType="fitCenter"',
          '    android:src="@drawable/splash_artwork" />',
          '',
        ].join('\n')
      );

      // 4. SplashActivity that shows the artwork and hands off to MainActivity.
      const packageName =
        config.android?.package || config.android?.namespace || 'com.sivaprakashravi.sivaos';
      const packageDir = packageName.split('.').join(path.sep);
      const javaDir = path.join(mainDir, 'java', packageDir);
      fs.mkdirSync(javaDir, { recursive: true });
      fs.writeFileSync(
        path.join(javaDir, 'SplashActivity.kt'),
        [
          `package ${packageName}`,
          '',
          'import android.content.Intent',
          'import android.os.Bundle',
          'import android.os.Handler',
          'import android.os.Looper',
          'import androidx.appcompat.app.AppCompatActivity',
          '',
          'class SplashActivity : AppCompatActivity() {',
          '    override fun onCreate(savedInstanceState: Bundle?) {',
          '        super.onCreate(savedInstanceState)',
          '        setContentView(R.layout.activity_splash)',
          '',
          '        Handler(Looper.getMainLooper()).postDelayed({',
          '            if (!isFinishing) {',
          '                startActivity(',
          '                    Intent(this, MainActivity::class.java)',
          '                        .addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION)',
          '                )',
          '                finish()',
          '                overridePendingTransition(0, 0)',
          '            }',
          '        }, 800)',
          '    }',
          '}',
          '',
        ].join('\n')
      );

      return config;
    },
  ]);

  config = withAndroidStyles(config, (config) => {
    const styles = config.modResults;
    if (!styles.resources.style) {
      styles.resources.style = [];
    }

    // Launch theme: brand background, no icon flash, seamless into AppTheme.
    let launchStyle = styles.resources.style.find(
      (s) => s.$.name === LAUNCH_THEME
    );
    if (!launchStyle) {
      launchStyle = { $: { name: LAUNCH_THEME, parent: 'Theme.SplashScreen' }, item: [] };
      styles.resources.style.push(launchStyle);
    }
    const launchItems = [
      { $: { name: 'windowSplashScreenBackground' }, _: '@color/splashscreen_background' },
      { $: { name: 'windowSplashScreenAnimatedIcon' }, _: '@drawable/splash_blank' },
      { $: { name: 'postSplashScreenTheme' }, _: '@style/AppTheme' },
    ];
    for (const item of launchItems) {
      if (!launchStyle.item.some((i) => i.$.name === item.$.name)) {
        launchStyle.item.push(item);
      }
    }

    // Brand-blue window background while React Native boots (no white flash).
    let appTheme = styles.resources.style.find((s) => s.$.name === 'AppTheme');
    if (appTheme) {
      if (!appTheme.item.some((i) => i.$.name === 'android:windowBackground')) {
        appTheme.item.push({
          $: { name: 'android:windowBackground' },
          _: '@color/splashscreen_background',
        });
      }
    }

    return config;
  });

  config = withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    const activities = application.activity || [];

    const isLauncherFilter = (filter) => {
      const actions = Array.isArray(filter.action) ? filter.action : [filter.action];
      const cats = Array.isArray(filter.category) ? filter.category : [filter.category];
      return (
        actions.some((a) => a && a.$ && a.$['android:name'] === 'android.intent.action.MAIN') &&
        cats.some((c) => c && c.$ && c.$['android:name'] === 'android.intent.category.LAUNCHER')
      );
    };

    const mainActivity = activities.find((a) => a.$['android:name'] === '.MainActivity');
    if (mainActivity) {
      mainActivity['intent-filter'] = (mainActivity['intent-filter'] || []).filter(
        (filter) => !isLauncherFilter(filter)
      );
    }

    if (!activities.some((a) => a.$['android:name'] === SPLASH_ACTIVITY_NAME)) {
      activities.push({
        $: {
          'android:name': SPLASH_ACTIVITY_NAME,
          'android:exported': 'true',
          'android:launchMode': 'singleTask',
          'android:screenOrientation': 'portrait',
          'android:theme': `@style/${LAUNCH_THEME}`,
          'android:configChanges':
            'keyboard|keyboardHidden|orientation|screenSize|screenLayout|uiMode|smallestScreenSize|assetsPaths',
          'android:windowSoftInputMode': 'adjustResize',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
            category: [{ $: { 'android:name': 'android.intent.category.LAUNCHER' } }],
          },
        ],
      });
    }

    return config;
  });

  return config;
}

module.exports = withSivaLaunchScreen;
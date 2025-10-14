/* eslint-env node */

const { configure } = require('quasar/wrappers')

module.exports = configure(() => {
  return {
    boot: [],

    css: ['app.scss'],

    extras: [
      'roboto-font',
      'material-icons'
    ],

    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node18'
      },
      vueRouterMode: 'hash',
      publicPath: process.env.NODE_ENV === 'production' ? '/knote/' : '/',
      vitePlugins: [
        [
          'vite-plugin-checker',
          { eslint: { lintCommand: 'eslint "./**/*.{js,vue}"' } },
          { server: false }
        ]
      ]
    },

    devServer: {
      open: true
    },

    framework: {
      config: {},
      plugins: ['Notify']
    },

    animations: [],

    ssr: {
      pwa: true,
      prodPort: 3000,
      middlewares: ['render']
    },

    pwa: {
      workboxMode: 'generateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      extendManifestJson(json) {
        Object.assign(json, {
          name: 'knote',
          short_name: 'knote',
          description: 'A simple app to take organized notes.',
          display: 'standalone',
          start_url: './',
          theme_color: '#1976D2',
          background_color: '#ffffff',
          icons: [
            { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
          ]
        })
      }
    },

    capacitor: { hideSplashscreen: true }
  }
})

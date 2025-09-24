// babel.config.mjs

module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current',
      },
    }],
  ],
  sourceMaps: 'inline', // Correct way to enable inline source maps
  retainLines: true, // Correct way to retain line numbers
  plugins: [
    '@babel/plugin-transform-modules-commonjs',
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './src',
          '@docker': './docker',
          '@config': './src/config/config.mjs',
          '@constants': './src/config/constants.mjs',
          '@manifest': './src/config/manifest.mjs',
          '@configFolder': './src/config/',
          '@contexts': './src/contexts',
          '@data': './src/data',
          '@handlers': './src/handlers',
          '@utils': './src/utils',
          '@listeners': './src/listeners',
          '@maps': './src/maps',
          '@helpers': './src/helpers',
          '@configHelpers': './src/config/helpers',
          '@validator': './src/utils/static/validator.mjs',
          '@integrationTests': './tests/integration',
          '@mocks': './tests/mocks',
          '@module': './module.json',
        },
      },
    ],
  ],
  parserOpts: {
    plugins: ['importAttributes']
  },
};
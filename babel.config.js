// babel.config.js

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
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './src',
          '@config': './src/config',
          '@constants': './src/constants/constants.js',
          '@constantsFolder': './src/constants/',
          '@contexts': './src/contexts',
          '@data': './src/data',
          '@handlers': './src/handlers',
          '@utils': './src/utils',
          '@listeners': './src/listeners',
          '@maps': './src/maps',
          '@helpers': './src/helpers',
          '@constantsHelpers': './src/constants/helpers',
          '@validator': './src/utils/static/validator.js',
          '@integrationTests': './tests/integration',
          '@mocks': './tests/mocks',
          '@manifest': './module.json',
        },
      },
    ],
  ],
};
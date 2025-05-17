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
          '@baseClasses': './src/baseClasses',
          '@config': './src/config',
          '@contexts': './src/contexts',
          '@data': './src/data',
          '@handlers': './src/handlers',
          '@utils': './src/utils',
          '@listeners': './src/listeners',
          '@integrationTests': './tests/integration',
          '@mocks': './tests/mocks',
          '@scripts': './scripts',
          '@manifest': './module.json',
          '@helpers': './src/helpers',
          '@constants': './src/constants/constants.js',
        },
      },
    ],
  ],
};
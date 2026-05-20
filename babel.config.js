module.exports = {
  presets: ['babel-preset-granite'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          '@app': './src/app',
          '@api': './src/api',
          '@features': './src/features',
          '@platform': './src/platform',
          '@shared': './src/shared',
        },
      },
    ],
  ],
};

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
          '@shared': './src/shared',
        },
      },
    ],
  ],
};

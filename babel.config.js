module.exports = function (api) {
  // env 바뀌면 캐시 무효
  if (api?.cache?.using) {
    api.cache.using(() => process.env.EXPO_PUBLIC_API_BASE_URL ?? '');
  }

  // .env를 Metro/Babel 프로세스에 로드 (gitignore)
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq < 0) continue;
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim();
        if (process.env[key] == null || process.env[key] === '') {
          process.env[key] = value;
        }
      }
    }
  } catch {
    // ignore
  }

  const expoPublic = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('EXPO_PUBLIC_') && typeof value === 'string') {
      expoPublic[key] = value;
    }
  }

  return {
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
      function inlineExpoPublicEnv({ types: t }) {
        function expoPublicName(path) {
          if (!path.get('object').matchesPattern('process.env')) {
            return null;
          }
          const prop = path.node.property;
          const name = path.node.computed
            ? t.isStringLiteral(prop)
              ? prop.value
              : null
            : t.isIdentifier(prop)
              ? prop.name
              : null;
          if (name == null || !name.startsWith('EXPO_PUBLIC_')) {
            return null;
          }
          return name;
        }
        function inlineEnv(path) {
          const name = expoPublicName(path);
          if (name == null) {
            return;
          }
          const value = expoPublic[name];
          path.replaceWith(t.stringLiteral(value ?? ''));
        }
        return {
          visitor: {
            MemberExpression: inlineEnv,
            OptionalMemberExpression: inlineEnv,
          },
        };
      },
    ],
  };
};

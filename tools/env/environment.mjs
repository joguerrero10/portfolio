export const FIREBASE_VARIABLES = [
  { key: 'apiKey', name: 'FIREBASE_API_KEY', required: true },
  { key: 'authDomain', name: 'FIREBASE_AUTH_DOMAIN', required: true },
  { key: 'projectId', name: 'FIREBASE_PROJECT_ID', required: true },
  { key: 'storageBucket', name: 'FIREBASE_STORAGE_BUCKET', required: true },
  {
    key: 'messagingSenderId',
    name: 'FIREBASE_MESSAGING_SENDER_ID',
    required: true,
  },
  { key: 'appId', name: 'FIREBASE_APP_ID', required: true },
  { key: 'measurementId', name: 'FIREBASE_MEASUREMENT_ID', required: false },
];

export function firebaseConfig(env, { strict }) {
  const missing = [];
  const config = {};
  for (const { key, name, required } of FIREBASE_VARIABLES) {
    const value = env[name]?.trim() ?? '';
    if (/[\u0000-\u001f\u007f]/.test(value)) {
      throw new Error(`${name} contains control characters.`);
    }
    if (!value && required) missing.push(name);
    config[key] = value;
  }
  if (missing.length && strict) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}.`);
  }
  return { config, missing };
}

function quote(value) {
  return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;
}

export function environmentSource(config, { production }) {
  const entries = FIREBASE_VARIABLES.map(({ key }) => `    ${key}: ${quote(config[key])},`).join(
    '\n',
  );
  return `export const environment = {
  production: ${production},
  firebaseConfig: {
${entries}
  },
};
`;
}

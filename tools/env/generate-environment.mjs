import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { environmentSource, firebaseConfig } from './environment.mjs';

const directory = 'src/environments';
const strict = process.argv.includes('--require');

if (existsSync('.env')) process.loadEnvFile('.env');

let result;
try {
  result = firebaseConfig(process.env, { strict });
} catch (error) {
  console.error(`Environment not generated: ${error.message}`);
  console.error('Define them as GitHub secrets in CI, or copy .env.example to .env locally.');
  process.exit(1);
}

await fs.mkdir(directory, { recursive: true });
await fs.writeFile(
  `${directory}/environment.ts`,
  environmentSource(result.config, { production: true }),
);
await fs.writeFile(
  `${directory}/environment.development.ts`,
  environmentSource(result.config, { production: false }),
);

if (result.missing.length) {
  console.warn(
    `Environment written with empty values for: ${result.missing.join(', ')}. Firebase will not work until they are defined.`,
  );
} else {
  console.log(`Environment written to ${directory} from environment variables.`);
}

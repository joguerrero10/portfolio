import test from 'node:test';
import assert from 'node:assert/strict';
import { environmentSource, firebaseConfig } from './environment.mjs';

const complete = {
  FIREBASE_API_KEY: 'key',
  FIREBASE_AUTH_DOMAIN: 'demo.firebaseapp.com',
  FIREBASE_PROJECT_ID: 'demo',
  FIREBASE_STORAGE_BUCKET: 'demo.firebasestorage.app',
  FIREBASE_MESSAGING_SENDER_ID: '123',
  FIREBASE_APP_ID: '1:123:web:abc',
};

test('maps the variables to the Firebase config', () => {
  const { config, missing } = firebaseConfig(complete, { strict: true });
  assert.deepEqual(missing, []);
  assert.equal(config.apiKey, 'key');
  assert.equal(config.projectId, 'demo');
  assert.equal(config.measurementId, '');
});

test('fails in strict mode when a required variable is missing', () => {
  const { FIREBASE_API_KEY, ...rest } = complete;
  assert.throws(() => firebaseConfig(rest, { strict: true }), /FIREBASE_API_KEY/);
});

test('reports missing variables without failing outside strict mode', () => {
  const { missing } = firebaseConfig({}, { strict: false });
  assert.ok(missing.includes('FIREBASE_APP_ID'));
  assert.ok(!missing.includes('FIREBASE_MEASUREMENT_ID'));
});

test('rejects control characters', () => {
  assert.throws(
    () => firebaseConfig({ ...complete, FIREBASE_APP_ID: "a\n'b" }, { strict: true }),
    /control characters/,
  );
});

test('escapes quotes in the generated source', () => {
  const { config } = firebaseConfig({ ...complete, FIREBASE_API_KEY: "a'b\\c" }, { strict: true });
  const source = environmentSource(config, { production: true });
  assert.match(source, /apiKey: 'a\\'b\\\\c',/);
  assert.match(source, /production: true,/);
});

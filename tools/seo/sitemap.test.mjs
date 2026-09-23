import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveOrigin, robotsTxt, sitemapXml } from './sitemap.mjs';

test('keeps the origin unset until it is configured', () => {
  assert.equal(resolveOrigin({ origin: null, firebaseProjectId: null }), null);
});

test('derives the origin from the Firebase project id', () => {
  assert.equal(
    resolveOrigin({ origin: null, firebaseProjectId: 'joel-portfolio' }),
    'https://joel-portfolio.web.app',
  );
});

test('prefers an explicit HTTPS origin', () => {
  assert.equal(
    resolveOrigin({ origin: 'https://joelguerrero.dev/', firebaseProjectId: 'ignored' }),
    'https://joelguerrero.dev',
  );
});

test('rejects insecure origins and invalid project ids', () => {
  assert.throws(() =>
    resolveOrigin({ origin: 'http://joelguerrero.dev', firebaseProjectId: null }),
  );
  assert.throws(() => resolveOrigin({ origin: null, firebaseProjectId: 'Bad Id' }));
});

test('writes absolute sitemap URLs', () => {
  const xml = sitemapXml('https://example.web.app', ['/es', '/es/projects/smartpos-pty']);
  assert.match(xml, /<loc>https:\/\/example\.web\.app\/es<\/loc>/);
  assert.match(xml, /<loc>https:\/\/example\.web\.app\/es\/projects\/smartpos-pty<\/loc>/);
  assert.equal(xml.includes('not-found'), false);
});

test('only announces the sitemap when there is an origin', () => {
  assert.equal(robotsTxt(null).includes('Sitemap:'), false);
  assert.match(
    robotsTxt('https://example.web.app'),
    /Sitemap: https:\/\/example\.web\.app\/sitemap\.xml/,
  );
});

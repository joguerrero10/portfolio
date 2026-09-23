export interface SiteConfig {
  readonly origin: string | null;
  readonly firebaseProjectId: string | null;
}

export function resolveOrigin(config: {
  origin: string | null;
  firebaseProjectId: string | null;
}): string | null {
  if (config.origin) {
    const url = new URL(config.origin);
    if (url.protocol !== 'https:') throw new Error('The public origin must use HTTPS.');
    return url.origin;
  }
  if (config.firebaseProjectId) {
    if (!/^[a-z0-9-]+$/.test(config.firebaseProjectId)) {
      throw new Error(`Invalid Firebase project id: ${config.firebaseProjectId}`);
    }
    return `https://${config.firebaseProjectId}.web.app`;
  }
  return null;
}

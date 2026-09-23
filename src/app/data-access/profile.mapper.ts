import { isLocale } from '../domain/locale';
import { Profile, ProjectStatus } from '../domain/portfolio.models';

type ProfileSource = Omit<Profile, 'cv' | 'projects'> & {
  cv: { path: string; locale: string; bytes: number };
  projects: readonly (Omit<Profile['projects'][number], 'status'> & { status: string })[];
};

function confirmedUrl(value: string | null): string | null {
  if (value === null) return null;
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('Public links must be HTTPS URLs without credentials.');
  }
  return value;
}

function assetPath(value: string): string {
  if (!/^\/assets\/[a-zA-Z0-9_./-]+$/.test(value) || value.includes('..')) {
    throw new Error(`Invalid local asset path: ${value}`);
  }
  return value;
}

function projectStatus(value: string): ProjectStatus {
  if (value === 'published' || value === 'in-development') return value;
  throw new Error(`Unknown project status: ${value}`);
}

export function mapProfile(source: ProfileSource): Profile {
  if (!isLocale(source.cv.locale)) throw new Error('Unsupported CV language.');
  if (!Number.isInteger(source.cv.bytes) || source.cv.bytes <= 0) {
    throw new Error('The CV size must be the real byte count of the published file.');
  }
  const slugs = new Set<string>();
  const ids = new Set<string>();
  return {
    ...source,
    cv: { path: assetPath(source.cv.path), locale: source.cv.locale, bytes: source.cv.bytes },
    socials: {
      linkedin: confirmedUrl(source.socials.linkedin),
      github: confirmedUrl(source.socials.github),
      instagram: confirmedUrl(source.socials.instagram),
    },
    projects: source.projects.map((project) => {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug) || slugs.has(project.slug)) {
        throw new Error(`Invalid or duplicate project slug: ${project.slug}`);
      }
      if (!project.id || ids.has(project.id)) throw new Error('Invalid or duplicate project ID.');
      slugs.add(project.slug);
      ids.add(project.id);
      return {
        ...project,
        status: projectStatus(project.status),
        image: assetPath(project.image),
        demoUrl: confirmedUrl(project.demoUrl),
        repositoryUrl: confirmedUrl(project.repositoryUrl),
      };
    }),
  };
}

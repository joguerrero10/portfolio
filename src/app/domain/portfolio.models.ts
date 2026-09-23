import { Locale } from './locale';

export type SocialPlatform = 'linkedin' | 'github' | 'instagram';

export interface SocialLink {
  readonly platform: SocialPlatform;
  readonly url: string | null;
}

export type ProjectStatus = 'published' | 'in-development';

export interface Project {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly status: ProjectStatus;
  readonly brand: string;
  readonly role: string;
  readonly image: string;
  readonly demoUrl: string | null;
  readonly repositoryUrl: string | null;
  readonly summary: string;
  readonly technicalDetailsConfirmed?: boolean;
  readonly technologies?: readonly string[];
  readonly architecture?: readonly string[];
}

export interface Profile {
  readonly name: string;
  readonly role: string;
  readonly location: string;
  readonly email: string;
  readonly yearsExperienceLabel: string;
  readonly socials: Readonly<Record<SocialPlatform, string | null>>;
  readonly cv: { readonly path: string; readonly locale: Locale; readonly bytes: number };
  readonly projects: readonly Project[];
  readonly sourceNote: string;
}

export interface ExperienceRole {
  readonly role: string;
  readonly period: string;
}

export interface Experience {
  readonly role: string;
  readonly employer: string;
  readonly location: string;
  readonly period: string;
  readonly summary: string;
  readonly roles: readonly ExperienceRole[];
}

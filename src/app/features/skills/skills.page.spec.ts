import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { providePortfolioI18n } from '../../core/i18n.providers';
import { MissionProgress, PROGRESS_STORAGE_KEY } from '../../core/mission-progress';
import { StaticPortfolioRepository } from '../../data-access/static-portfolio.repository';
import { LOCALES } from '../../domain/locale';
import { PortfolioRepository } from '../../domain/portfolio.repository';

function submitCommand(root: HTMLElement, command: string) {
  const field = root.querySelector<HTMLInputElement>('#terminal-command')!;
  field.value = command;
  root
    .querySelector('form.terminal-form')!
    .dispatchEvent(new Event('submit', { cancelable: true }));
}

describe('Skills, missions and terminal', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        providePortfolioI18n(),
        { provide: PortfolioRepository, useExisting: StaticPortfolioRepository },
      ],
    });
  });

  afterEach(() => {
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
    vi.restoreAllMocks();
  });

  for (const locale of LOCALES) {
    it(`lists the ${locale} skill groups as plain chips, without invented levels`, async () => {
      const harness = await RouterTestingHarness.create(`/${locale}/skills`);
      const root = harness.routeNativeElement!;
      const repository = TestBed.inject(PortfolioRepository);
      const copy = repository.getCopy(locale);
      const groups = repository.getSkills();

      expect(root.querySelector('h1')?.textContent).toContain(copy.skillsTitle);
      const sections = [...root.querySelectorAll('.skill-group')];
      expect(sections.map((section) => section.querySelector('h2')?.textContent?.trim())).toEqual([
        ...copy.skillLabels,
      ]);
      expect(
        sections.map((section) =>
          [...section.querySelectorAll('.skill-chip')].map((chip) => chip.textContent?.trim()),
        ),
      ).toEqual(groups.map((group) => [...group]));
      expect(root.textContent).not.toMatch(/\d{1,3}\s?%|\b[1-5]\s?\/\s?5\b/);
    });
  }

  it('counts only visited sections and never locks content', async () => {
    const harness = await RouterTestingHarness.create('/es/skills');
    const progress = TestBed.inject(MissionProgress);
    expect(progress.visited()).toEqual(['skills']);
    expect(harness.routeNativeElement?.querySelector('.progress-count')?.textContent?.trim()).toBe(
      `1 / ${progress.total}`,
    );

    await harness.navigateByUrl('/es/projects/smartpos-pty');
    await harness.navigateByUrl('/es/experience');
    await harness.navigateByUrl('/es/skills');
    expect(progress.visited()).toEqual(['skills', 'projects', 'experience']);
    expect(harness.routeNativeElement?.querySelector('.progress-count')?.textContent?.trim()).toBe(
      '3 / 6',
    );
    expect(localStorage.getItem(PROGRESS_STORAGE_KEY)).toBe('skills,projects,experience');
    await harness.navigateByUrl('/es');
    expect(harness.routeNativeElement?.querySelector('a[download]')).not.toBeNull();
  });

  it('keeps working when storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const harness = await RouterTestingHarness.create('/pt/skills');
    expect(TestBed.inject(MissionProgress).visited()).toEqual(['skills']);
    expect(harness.routeNativeElement?.querySelector('.progress-count')?.textContent?.trim()).toBe(
      '1 / 6',
    );
    expect(harness.routeNativeElement?.querySelector('#terminal-command')).not.toBeNull();
  });

  it('answers help, clear and unknown commands without navigating', async () => {
    const harness = await RouterTestingHarness.create('/es/skills');
    const root = harness.routeNativeElement!;
    const copy = TestBed.inject(PortfolioRepository).getCopy('es');
    const output = root.querySelector('.terminal-output')!;
    expect(output.getAttribute('aria-live')).toBe('polite');
    expect(root.querySelector('label[for="terminal-command"]')?.textContent?.trim()).toBe(
      copy.terminalLabel,
    );
    expect(root.querySelector('.terminal-empty')?.textContent?.trim()).toBe(copy.empty.terminal);

    submitCommand(root, 'help');
    await harness.fixture.whenStable();
    expect(root.querySelector('.terminal-text')?.textContent).toContain(copy.terminalResults.help);
    expect(root.querySelector('.terminal-text')?.textContent).toContain(copy.terminalClear);

    submitCommand(root, 'rm -rf /');
    await harness.fixture.whenStable();
    expect([...root.querySelectorAll('.terminal-text')].at(-1)?.textContent?.trim()).toBe(
      copy.terminalUnknown,
    );
    expect(TestBed.inject(Router).url).toBe('/es/skills');

    submitCommand(root, 'clear');
    await harness.fixture.whenStable();
    expect(root.querySelectorAll('.terminal-line')).toHaveLength(0);
    expect(root.querySelector('.terminal-empty')?.textContent?.trim()).toBe(
      copy.terminalResults.cleared,
    );
  });

  it('routes the navigation commands to the same screens as the menu', async () => {
    for (const [command, section] of [
      ['projects', 'projects'],
      ['experience', 'experience'],
      ['contact', 'contact'],
    ]) {
      const harness = await RouterTestingHarness.create('/en/skills');
      submitCommand(harness.routeNativeElement!, command!);
      await harness.fixture.whenStable();
      expect(TestBed.inject(Router).url).toBe(`/en/${section}`);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideRouter(routes, withComponentInputBinding()),
          providePortfolioI18n(),
          { provide: PortfolioRepository, useExisting: StaticPortfolioRepository },
        ],
      });
    }
  });

  it('prints the transcript in the language selected at the time of reading', async () => {
    const harness = await RouterTestingHarness.create('/es/skills');
    submitCommand(harness.routeNativeElement!, 'help');
    await harness.fixture.whenStable();
    const repository = TestBed.inject(PortfolioRepository);
    expect(harness.routeNativeElement?.querySelector('.terminal-text')?.textContent).toContain(
      repository.getCopy('es').terminalResults.help,
    );
    await harness.navigateByUrl('/pt/skills');
    expect(
      harness.routeNativeElement?.querySelector('.terminal-command')?.textContent?.trim(),
    ).toBe('help');
    expect(harness.routeNativeElement?.querySelector('.terminal-text')?.textContent).toContain(
      repository.getCopy('pt').terminalResults.help,
    );
  });
});

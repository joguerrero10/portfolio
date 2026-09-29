import { TestBed } from '@angular/core/testing';
import { NavigationEnd, NavigationError, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { LoadingScreen } from './loading-screen';

describe('LoadingScreen', () => {
  let events: Subject<NavigationEnd | NavigationError>;

  beforeEach(() => {
    vi.useFakeTimers();
    events = new Subject();
    TestBed.configureTestingModule({
      imports: [LoadingScreen],
      providers: [{ provide: Router, useValue: { navigated: false, events } }],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  function render() {
    const fixture = TestBed.createComponent(LoadingScreen);
    fixture.detectChanges();
    return fixture;
  }

  it('waits for navigation before fading out and removing the overlay', () => {
    const fixture = render();
    const screen = fixture.componentInstance;
    expect(screen.visible()).toBe(true);
    vi.advanceTimersByTime(1200);
    expect(screen.leaving()).toBe(false);
    events.next(new NavigationEnd(1, '/es', '/es'));
    expect(screen.leaving()).toBe(true);
    vi.advanceTimersByTime(400);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('section')).toBeNull();
    events.next(new NavigationEnd(2, '/es/projects', '/es/projects'));
    expect(screen.visible()).toBe(false);
  });

  it('keeps a brief introduction when the initial navigation is already complete', () => {
    Object.assign(TestBed.inject(Router), { navigated: true });
    const screen = render().componentInstance;
    vi.advanceTimersByTime(1199);
    expect(screen.leaving()).toBe(false);
    vi.advanceTimersByTime(1);
    expect(screen.leaving()).toBe(true);
  });

  it('lets the visitor skip and bounds a stalled navigation', () => {
    const fixture = render();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    vi.advanceTimersByTime(400);
    expect(fixture.componentInstance.visible()).toBe(false);
    const stalled = render().componentInstance;
    vi.advanceTimersByTime(8400);
    expect(stalled.visible()).toBe(false);
  });

  it('dismisses on navigation errors and cleans up timers on destruction', () => {
    const fixture = render();
    events.next(new NavigationError(1, '/es', new Error('navigation failed')));
    expect(fixture.componentInstance.leaving()).toBe(true);
    fixture.destroy();
    vi.advanceTimersByTime(10000);
    expect(fixture.componentInstance.visible()).toBe(true);
  });
});

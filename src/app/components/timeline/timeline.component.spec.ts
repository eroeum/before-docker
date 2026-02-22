import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TimelineComponent } from './timeline.component';
import { Technology } from '../../models/technology.model';

const makeTech = (overrides: Partial<Technology> = {}): Technology => ({
  id: 'python',
  name: 'Python',
  year: 1991,
  categoryId: 'software',
  wikipediaTitle: 'Python_(programming_language)',
  ...overrides,
});

describe('TimelineComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TimelineComponent],
      providers: [provideZonelessChangeDetection()],
    });
  });

  function create(playedTechs: Technology[] = []) {
    const fixture = TestBed.createComponent(TimelineComponent);
    fixture.componentRef.setInput('playedTechs', playedTechs);
    fixture.detectChanges();
    return fixture;
  }

  // ─── markers() computed ────────────────────────────────────────────────────

  it('always includes exactly one Docker marker', () => {
    const fixture = create();
    const dockerMarkers = fixture.componentInstance.markers().filter((m) => m.isDocker);
    expect(dockerMarkers).toHaveLength(1);
    expect(dockerMarkers[0].year).toBe(2013);
    expect(dockerMarkers[0].name).toBe('Docker');
  });

  it('Docker label is below the line (above = false)', () => {
    const fixture = create();
    const docker = fixture.componentInstance.markers().find((m) => m.isDocker)!;
    expect(docker.above).toBe(false);
  });

  it('adds non-docker played techs as markers', () => {
    const fixture = create([makeTech()]);
    const markers = fixture.componentInstance.markers();
    expect(markers).toHaveLength(2); // Docker + Python
    expect(markers.some((m) => m.name === 'Python')).toBe(true);
  });

  it('filters out Docker from playedTechs to prevent duplicate', () => {
    const fixture = create([makeTech({ id: 'docker', name: 'Docker', year: 2013 })]);
    const dockerMarkers = fixture.componentInstance.markers().filter((m) => m.isDocker);
    expect(dockerMarkers).toHaveLength(1);
  });

  it('alternates above/below for successive techs (first = above)', () => {
    const fixture = create([
      makeTech({ id: 'python', name: 'Python', year: 1991 }),
      makeTech({ id: 'java', name: 'Java', year: 1995 }),
      makeTech({ id: 'git', name: 'Git', year: 2005 }),
    ]);
    const nonDocker = fixture.componentInstance.markers().filter((m) => !m.isDocker);
    expect(nonDocker[0].above).toBe(true);
    expect(nonDocker[1].above).toBe(false);
    expect(nonDocker[2].above).toBe(true);
  });

  // ─── toPercent() ──────────────────────────────────────────────────────────

  it('positions Docker (2013) at ~87% across the 1965–2020 scale', () => {
    const fixture = create();
    const pct = fixture.componentInstance.toPercent(2013);
    // (2013 - 1965) / 55 * 100 = 87.27…
    expect(pct).toBeCloseTo(87.27, 1);
  });

  it('positions C (1972) at ~12.7%', () => {
    const fixture = create();
    expect(fixture.componentInstance.toPercent(1972)).toBeCloseTo(12.73, 1);
  });

  it('clamps within 0–100 for any year in data range', () => {
    const fixture = create();
    // Earliest known tech
    const pct1972 = fixture.componentInstance.toPercent(1972);
    expect(pct1972).toBeGreaterThan(0);
    expect(pct1972).toBeLessThan(100);
    // Latest known tech
    const pct2016 = fixture.componentInstance.toPercent(2016);
    expect(pct2016).toBeGreaterThan(0);
    expect(pct2016).toBeLessThan(100);
  });

  // ─── DOM ──────────────────────────────────────────────────────────────────

  it('renders a .docker-marker in the DOM', () => {
    const fixture = create();
    const el = fixture.nativeElement.querySelector('.docker-marker');
    expect(el).not.toBeNull();
  });

  it('renders decade tick marks for 1970, 1980, 1990, 2000, 2010', () => {
    const fixture = create();
    const ticks = fixture.nativeElement.querySelectorAll('.decade-tick');
    expect(ticks.length).toBe(5);
  });

  it('renders a marker for each played tech plus Docker', () => {
    const fixture = create([makeTech(), makeTech({ id: 'java', name: 'Java', year: 1995 })]);
    const markers = fixture.nativeElement.querySelectorAll('.marker');
    expect(markers.length).toBe(3); // Docker + Python + Java
  });
});

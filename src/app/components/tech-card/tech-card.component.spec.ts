import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TechCardComponent } from './tech-card.component';
import { DisplayTech } from '../../models/technology.model';

const BASE_TECH: DisplayTech = {
  id: 'python',
  name: 'Python',
  year: 1991,
  categoryId: 'software',
  wikipediaTitle: 'Python_(programming_language)',
  wiki: null,
  isLoading: false,
};

describe('TechCardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TechCardComponent],
      providers: [provideZonelessChangeDetection()],
    });
  });

  function create(tech: DisplayTech = BASE_TECH, disabled = false) {
    const fixture = TestBed.createComponent(TechCardComponent);
    fixture.componentRef.setInput('tech', tech);
    fixture.componentRef.setInput('disabled', disabled);
    fixture.detectChanges();
    return fixture;
  }

  // ─── Rendering ─────────────────────────────────────────────────────────────

  it('renders the technology name', () => {
    const fixture = create();
    const name = fixture.nativeElement.querySelector('.tech-name');
    expect(name?.textContent?.trim()).toBe('Python');
  });

  it('shows a loading spinner when isLoading is true', () => {
    const fixture = create({ ...BASE_TECH, isLoading: true });
    expect(fixture.nativeElement.querySelector('mat-spinner')).not.toBeNull();
  });

  it('shows a memory icon when there is no image and not loading', () => {
    const fixture = create({ ...BASE_TECH, wiki: null, isLoading: false });
    const icons = Array.from(
      fixture.nativeElement.querySelectorAll('mat-icon'),
    ) as HTMLElement[];
    expect(icons.some((el) => el.textContent?.trim() === 'memory')).toBe(true);
  });

  it('renders the background image when wiki has a thumbnailUrl', () => {
    const fixture = create({
      ...BASE_TECH,
      wiki: { description: 'A language', thumbnailUrl: 'https://example.com/img.jpg', extract: '' },
    });
    const img = fixture.nativeElement.querySelector('.bg-image') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.src).toBe('https://example.com/img.jpg');
  });

  // ─── Pick button ───────────────────────────────────────────────────────────

  it('shows pick button when not disabled', () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelector('.pick-btn')).not.toBeNull();
  });

  it('hides pick button when disabled', () => {
    const fixture = create(BASE_TECH, true);
    expect(fixture.nativeElement.querySelector('.pick-btn')).toBeNull();
  });

  it('adds .disabled class to .panel when disabled', () => {
    const fixture = create(BASE_TECH, true);
    const panel = fixture.nativeElement.querySelector('.panel');
    expect(panel.classList).toContain('disabled');
  });

  // ─── Output ────────────────────────────────────────────────────────────────

  it('emits selected when the pick button is clicked', () => {
    const fixture = create();
    let emitted = false;
    fixture.componentInstance.selected.subscribe(() => {
      emitted = true;
    });
    fixture.nativeElement.querySelector('.pick-btn').click();
    expect(emitted).toBe(true);
  });

  it('emits selected when the panel itself is clicked', () => {
    const fixture = create();
    let emitted = false;
    fixture.componentInstance.selected.subscribe(() => {
      emitted = true;
    });
    fixture.nativeElement.querySelector('.panel').click();
    expect(emitted).toBe(true);
  });
});

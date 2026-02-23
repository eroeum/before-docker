import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ResultOverlayComponent } from './result-overlay.component';
import { RoundResult } from '../../models/game-state.model';

const LEFT_TECH = {
  id: 'c',
  name: 'C',
  year: 1972,
  categoryId: 'software',
  wikipediaTitle: 'C_(programming_language)',
  wiki: null,
  isLoading: false,
};
const RIGHT_TECH = {
  id: 'docker',
  name: 'Docker',
  year: 2013,
  categoryId: 'software',
  wikipediaTitle: 'Docker_(software)',
  wiki: null,
  isLoading: false,
};

const CORRECT_RESULT: RoundResult = {
  leftTech: LEFT_TECH,
  rightTech: RIGHT_TECH,
  userPickedLeft: true,
  wasCorrect: true,
  dockerYearDeltaLeft: 41,
  dockerYearDeltaRight: 0,
};

const WRONG_RESULT: RoundResult = {
  ...CORRECT_RESULT,
  userPickedLeft: false,
  wasCorrect: false,
};

describe('ResultOverlayComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ResultOverlayComponent],
      providers: [provideZonelessChangeDetection()],
    });
  });

  function create(result: RoundResult) {
    const fixture = TestBed.createComponent(ResultOverlayComponent);
    fixture.componentRef.setInput('result', result);
    fixture.detectChanges();
    return fixture;
  }

  // ─── Verdict ───────────────────────────────────────────────────────────────

  it('shows "Correct!" for a correct guess', () => {
    const fixture = create(CORRECT_RESULT);
    expect(fixture.nativeElement.querySelector('h2')?.textContent?.trim()).toBe('Correct!');
  });

  it('shows "Wrong!" for an incorrect guess', () => {
    const fixture = create(WRONG_RESULT);
    expect(fixture.nativeElement.querySelector('h2')?.textContent?.trim()).toBe('Wrong!');
  });

  it('applies .correct class to card on correct guess', () => {
    const fixture = create(CORRECT_RESULT);
    const card = fixture.nativeElement.querySelector('.overlay-card');
    expect(card.classList).toContain('correct');
  });

  it('applies .wrong class to card on wrong guess', () => {
    const fixture = create(WRONG_RESULT);
    const card = fixture.nativeElement.querySelector('.overlay-card');
    expect(card.classList).toContain('wrong');
  });

  // ─── Date display ──────────────────────────────────────────────────────────

  it('shows "41 BD" for C (1972)', () => {
    const fixture = create(CORRECT_RESULT);
    const texts = (Array.from(fixture.nativeElement.querySelectorAll('.docker-date')) as HTMLElement[]).map(
      (el) => el.textContent?.trim(),
    );
    expect(texts).toContain('41 BD');
  });

  it('shows "The Year of Docker" for Docker (2013)', () => {
    const fixture = create(CORRECT_RESULT);
    const texts = (Array.from(fixture.nativeElement.querySelectorAll('.docker-date')) as HTMLElement[]).map(
      (el) => el.textContent?.trim(),
    );
    expect(texts).toContain('The Year of Docker');
  });

  it('marks the user-picked tech with .picked class', () => {
    const fixture = create(CORRECT_RESULT); // userPickedLeft = true
    const results = fixture.nativeElement.querySelectorAll('.tech-result');
    expect(results[0].classList).toContain('picked'); // left = picked
    expect(results[1].classList).not.toContain('picked');
  });

  // ─── Fixed backdrop ────────────────────────────────────────────────────────

  it('renders a .backdrop wrapper (position: fixed overlay)', () => {
    const fixture = create(CORRECT_RESULT);
    expect(fixture.nativeElement.querySelector('.backdrop')).not.toBeNull();
  });

  // ─── Output ────────────────────────────────────────────────────────────────

  it('emits next when "Next Round" button is clicked', () => {
    const fixture = create(CORRECT_RESULT);
    let nextEmitted = false;
    fixture.componentInstance.next.subscribe(() => {
      nextEmitted = true;
    });
    const btn = fixture.nativeElement.querySelector('button[mat-flat-button]');
    btn?.click();
    expect(nextEmitted).toBe(true);
  });
});

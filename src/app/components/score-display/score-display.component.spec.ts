import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ScoreDisplayComponent } from './score-display.component';
import { GameService } from '../../services/game.service';
import { WikipediaService } from '../../services/wikipedia.service';

const WIKI_DATA = { description: 'Test', thumbnailUrl: null, extract: '' };

describe('ScoreDisplayComponent', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ScoreDisplayComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        GameService,
        { provide: WikipediaService, useValue: { fetch: () => of(WIKI_DATA), prefetch: vi.fn() } },
      ],
    });
    service = TestBed.inject(GameService);
  });

  function create() {
    const fixture = TestBed.createComponent(ScoreDisplayComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('shows 3 filled hearts at the start of a game', async () => {
    service.startGame('software');
    await vi.waitFor(() => service.lives() === 3, { timeout: 3000 });

    const fixture = create();
    fixture.detectChanges();

    const filledHearts = fixture.nativeElement.querySelectorAll('.heart:not(.lost)');
    expect(filledHearts.length).toBe(3);
  });

  it('shows the correct score count', async () => {
    service.startGame('software');
    await vi.waitFor(() => service.phase() === 'Playing', { timeout: 3000 });

    const left = service.leftTech()!;
    const right = service.rightTech()!;
    service.guess(left.year <= right.year); // correct

    const fixture = create();
    fixture.detectChanges();

    const scoreText = fixture.nativeElement.querySelector('.score-text')?.textContent?.trim();
    expect(scoreText).toBe('1');
  });

  it('marks a heart as lost after a wrong answer', async () => {
    service.startGame('software');
    await vi.waitFor(() => service.phase() === 'Playing', { timeout: 3000 });

    const left = service.leftTech()!;
    const right = service.rightTech()!;
    service.guess(left.year > right.year); // wrong

    const fixture = create();
    fixture.detectChanges();

    const lostHearts = fixture.nativeElement.querySelectorAll('.heart.lost');
    expect(lostHearts.length).toBe(1);
  });
});

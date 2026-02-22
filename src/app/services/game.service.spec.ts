import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { GameService, toDockerDate } from './game.service';
import { WikipediaService } from './wikipedia.service';
import { GamePhase } from '../models/game-state.model';

const WIKI_DATA = { description: 'Test', thumbnailUrl: null, extract: 'Test extract' };

function makeWikiService() {
  return { fetch: () => of(WIKI_DATA), prefetch: vi.fn() };
}

// ─── Pure function ───────────────────────────────────────────────────────────

describe('toDockerDate', () => {
  it('returns BD for years before 2013', () => {
    expect(toDockerDate(1972)).toBe('41 BD');
    expect(toDockerDate(2012)).toBe('1 BD');
  });

  it('returns "The Year of Docker" for 2013', () => {
    expect(toDockerDate(2013)).toBe('The Year of Docker');
  });

  it('returns AD for years after 2013', () => {
    expect(toDockerDate(2014)).toBe('1 AD');
    expect(toDockerDate(2016)).toBe('3 AD');
  });
});

// ─── GameService ─────────────────────────────────────────────────────────────

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        GameService,
        { provide: WikipediaService, useValue: makeWikiService() },
      ],
    });
    service = TestBed.inject(GameService);
  });

  it('starts in Menu phase with 3 lives and 0 score', () => {
    expect(service.phase()).toBe(GamePhase.Menu);
    expect(service.lives()).toBe(3);
    expect(service.score()).toBe(0);
    expect(service.playedTechs()).toEqual([]);
  });

  // ─── startGame() ───────────────────────────────────────────────────────────

  describe('startGame()', () => {
    it('resets to Loading phase with fresh lives and score', () => {
      service.startGame('software');
      expect(service.phase()).toBe(GamePhase.Loading);
      expect(service.lives()).toBe(3);
      expect(service.score()).toBe(0);
      expect(service.playedTechs()).toEqual([]);
    });

    it('transitions to Playing once wiki data arrives', async () => {
      service.startGame('software');
      await vi.waitFor(() => service.phase() === GamePhase.Playing, { timeout: 3000 });
      expect(service.leftTech()).not.toBeNull();
      expect(service.rightTech()).not.toBeNull();
    });
  });

  // ─── guess() ───────────────────────────────────────────────────────────────

  describe('guess()', () => {
    beforeEach(async () => {
      service.startGame('software');
      await vi.waitFor(() => service.phase() === GamePhase.Playing, { timeout: 3000 });
    });

    it('increments score on a correct guess and leaves lives unchanged', () => {
      const left = service.leftTech()!;
      const right = service.rightTech()!;
      service.guess(left.year <= right.year); // always the correct pick
      expect(service.score()).toBe(1);
      expect(service.lives()).toBe(3);
    });

    it('decrements lives on a wrong guess and leaves score unchanged', () => {
      const left = service.leftTech()!;
      const right = service.rightTech()!;
      service.guess(left.year > right.year); // always the wrong pick
      expect(service.score()).toBe(0);
      expect(service.lives()).toBe(2);
    });

    it('records both techs in playedTechs', () => {
      const left = service.leftTech()!;
      const right = service.rightTech()!;
      service.guess(true);
      expect(service.playedTechs()).toContain(left);
      expect(service.playedTechs()).toContain(right);
    });

    it('moves to RoundResult (not GameOver) while lives remain', () => {
      service.guess(true);
      expect(service.phase()).toBe(GamePhase.RoundResult);
    });

    it('stores the last result', () => {
      service.guess(true);
      const result = service.lastResult();
      expect(result).not.toBeNull();
      expect(result!.leftTech).toEqual(service.playedTechs()[0]);
      expect(result!.rightTech).toEqual(service.playedTechs()[1]);
    });
  });

  // ─── Game Over ─────────────────────────────────────────────────────────────

  describe('GameOver', () => {
    it('reaches GameOver after 3 wrong guesses', async () => {
      service.startGame('software');
      await vi.waitFor(() => service.phase() === GamePhase.Playing, { timeout: 3000 });

      for (let livesLeft = 3; livesLeft > 0; livesLeft--) {
        const left = service.leftTech()!;
        const right = service.rightTech()!;
        service.guess(left.year > right.year); // wrong pick every time

        if (livesLeft > 1) {
          // More rounds remain — advance to next
          service.nextRound();
          await vi.waitFor(() => service.phase() === GamePhase.Playing, { timeout: 3000 });
        }
      }

      expect(service.phase()).toBe(GamePhase.GameOver);
      expect(service.lives()).toBe(0);
    });
  });

  // ─── nextRound / resetToMenu ────────────────────────────────────────────────

  describe('nextRound()', () => {
    it('returns to Loading then Playing', async () => {
      service.startGame('software');
      await vi.waitFor(() => service.phase() === GamePhase.Playing, { timeout: 3000 });
      service.guess(true);
      expect(service.phase()).toBe(GamePhase.RoundResult);

      service.nextRound();
      expect(service.phase()).toBe(GamePhase.Loading);
      await vi.waitFor(() => service.phase() === GamePhase.Playing, { timeout: 3000 });
      expect(service.leftTech()).not.toBeNull();
    });
  });
});

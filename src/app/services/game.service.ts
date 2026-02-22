import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { GamePhase, GameState, RoundResult } from '../models/game-state.model';
import { DisplayTech, Technology } from '../models/technology.model';
import { WikipediaService } from './wikipedia.service';
import { SOFTWARE_TECHNOLOGIES } from '../data/technologies.data';
import { SPACE_TECHNOLOGIES } from '../data/space.data';
import { ENGINEERING_TECHNOLOGIES } from '../data/engineering.data';

const DOCKER_YEAR = 2013;
const STARTING_LIVES = 3;

export function toDockerDate(year: number): string {
  const delta = DOCKER_YEAR - year;
  if (delta === 0) return 'The Year of Docker';
  if (delta > 0) return `${delta} BD`;
  return `${Math.abs(delta)} AD`;
}

const CATEGORY_DATA_MAP: Record<string, Technology[]> = {
  software: SOFTWARE_TECHNOLOGIES,
  space: SPACE_TECHNOLOGIES,
  engineering: ENGINEERING_TECHNOLOGIES,
};

function initialState(categoryId: string): GameState {
  return {
    phase: GamePhase.Loading,
    categoryId,
    leftTech: null,
    rightTech: null,
    score: 0,
    lives: STARTING_LIVES,
    lastResult: null,
    usedTechIds: new Set<string>(),
    playedTechs: [],
  };
}

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly wiki = inject(WikipediaService);
  private readonly router = inject(Router);

  private readonly _state = signal<GameState>({
    phase: GamePhase.Menu,
    categoryId: '',
    leftTech: null,
    rightTech: null,
    score: 0,
    lives: STARTING_LIVES,
    lastResult: null,
    usedTechIds: new Set<string>(),
    playedTechs: [],
  });

  readonly phase = computed(() => this._state().phase);
  readonly leftTech = computed(() => this._state().leftTech);
  readonly rightTech = computed(() => this._state().rightTech);
  readonly score = computed(() => this._state().score);
  readonly lives = computed(() => this._state().lives);
  readonly lastResult = computed(() => this._state().lastResult);
  readonly playedTechs = computed(() => this._state().playedTechs);

  startGame(categoryId: string): void {
    this._state.set(initialState(categoryId));
    this._loadNextRound();
  }

  guess(pickedLeft: boolean): void {
    const state = this._state();
    const { leftTech, rightTech } = state;
    if (!leftTech || !rightTech) return;

    const leftYear = leftTech.year;
    const rightYear = rightTech.year;

    const leftIsOlder = leftYear <= rightYear;
    const wasCorrect = pickedLeft ? leftIsOlder : !leftIsOlder;

    const result: RoundResult = {
      leftTech,
      rightTech,
      userPickedLeft: pickedLeft,
      wasCorrect,
      dockerYearDeltaLeft: DOCKER_YEAR - leftYear,
      dockerYearDeltaRight: DOCKER_YEAR - rightYear,
    };

    const newScore = state.score + (wasCorrect ? 1 : 0);
    const newLives = wasCorrect ? state.lives : state.lives - 1;
    const isGameOver = newLives === 0;

    this._state.update((s) => ({
      ...s,
      score: newScore,
      lives: newLives,
      lastResult: result,
      phase: isGameOver ? GamePhase.GameOver : GamePhase.RoundResult,
      playedTechs: [...s.playedTechs, leftTech, rightTech],
    }));
  }

  nextRound(): void {
    this._state.update((s) => ({ ...s, phase: GamePhase.Loading }));
    this._loadNextRound();
  }

  resetToMenu(): void {
    this._state.update((s) => ({ ...s, phase: GamePhase.Menu }));
    this.router.navigate(['/']);
  }

  private async _loadNextRound(): Promise<void> {
    const state = this._state();
    const techs = CATEGORY_DATA_MAP[state.categoryId];
    if (!techs || techs.length < 2) return;

    const available = techs.filter((t) => !state.usedTechIds.has(t.id));
    const pool = available.length >= 2 ? available : techs;

    const [left, right] = this._pickTwo(pool);

    const partialLeft: DisplayTech = { ...left, wiki: null, isLoading: true };
    const partialRight: DisplayTech = { ...right, wiki: null, isLoading: true };

    this._state.update((s) => ({
      ...s,
      leftTech: partialLeft,
      rightTech: partialRight,
    }));

    const nextAvailable = pool.filter((t) => t.id !== left.id && t.id !== right.id);
    if (nextAvailable.length >= 2) {
      const [nextLeft, nextRight] = this._pickTwo(nextAvailable);
      this.wiki.prefetch([nextLeft.wikipediaTitle, nextRight.wikipediaTitle]);
    }

    const [leftWiki, rightWiki] = await Promise.all([
      firstValueFrom(this.wiki.fetch(left.wikipediaTitle)),
      firstValueFrom(this.wiki.fetch(right.wikipediaTitle)),
    ]);

    const newUsed = new Set(state.usedTechIds);
    newUsed.add(left.id);
    newUsed.add(right.id);

    this._state.update((s) => ({
      ...s,
      phase: GamePhase.Playing,
      leftTech: { ...left, wiki: leftWiki, isLoading: false },
      rightTech: { ...right, wiki: rightWiki, isLoading: false },
      usedTechIds: newUsed,
    }));
  }

  private _pickTwo<T>(arr: T[]): [T, T] {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1]];
  }
}

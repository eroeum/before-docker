import { DisplayTech, Technology } from './technology.model';

export enum GamePhase {
  Menu = 'Menu',
  Loading = 'Loading',
  Playing = 'Playing',
  RoundResult = 'RoundResult',
  GameOver = 'GameOver',
}

export interface RoundResult {
  leftTech: DisplayTech;
  rightTech: DisplayTech;
  userPickedLeft: boolean;
  wasCorrect: boolean;
  dockerYearDeltaLeft: number;
  dockerYearDeltaRight: number;
}

export interface GameState {
  phase: GamePhase;
  categoryId: string;
  leftTech: DisplayTech | null;
  rightTech: DisplayTech | null;
  score: number;
  lives: number;
  lastResult: RoundResult | null;
  usedTechIds: Set<string>;
  playedTechs: Technology[];
}

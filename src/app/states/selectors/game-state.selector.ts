import { createSelector, createFeatureSelector } from '@ngrx/store';
import { GameState } from "../../models/state";
import { ITech } from '../../models/tech';


export interface State {
    gameState: GameState,
    left: ITech,
    right: ITech,
    score: number,
    guesses: number,
}


export const feature = createFeatureSelector<State>('gameState');


export const selectGameState = createSelector(
    feature,
    (state: State) => state.gameState,
);


export const selectLeft = createSelector(
    feature,
    (state: State) => state.left,
)

export const selectRight = createSelector(
    feature,
    (state: State) => state.right,
)

export const selectFormattedScore = createSelector(
    feature,
    (state: State) => {
        return `${state.score}/${state.guesses}`;
    }
)


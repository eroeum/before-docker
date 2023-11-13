import * as gameStateActions from  '../actions/game-state.action';
import { createReducer, on } from '@ngrx/store';
import { GameState } from '../../models/state';
import { State } from '../selectors/game-state.selector';
import { technologies } from '../../data/tech';
import { ITech } from '../../models/tech';


export const isCorrect = (before: ITech, after: ITech) => {
    return before.creationDate <= after.creationDate;
}


export const randomTech = (other: ITech) => {
    let randomTech: ITech;
    do {
        randomTech = technologies[Math.floor(Math.random() * (technologies.length ))]
    } while(randomTech.name === other.name);
    return randomTech;
}


export const initialState: State = {
    gameState: GameState.gameMenu,
    left: technologies[0],
    right: randomTech(technologies[0]),
    score: 0,
    guesses: 0,
}

export const reducer = createReducer(
    initialState,
    on(gameStateActions.newGame, (state) => {
        return {...state, gameState: GameState.gameMenu, score: 0, guesses: 0, left: technologies[0], right: randomTech(technologies[0])};
    }),
    on(gameStateActions.startGame, (state) => {
        if (state.gameState !== GameState.gameMenu) {
            return state;
        }
        return {...state, gameState: GameState.inGame, score: 0, guesses: 0};
    }),
    on(gameStateActions.nextRound, (state) => {
        if (state.gameState !== GameState.roundResults) {
            return state;
        }
        if (Math.random() < 0.5) {
            return {...state, gameState: GameState.inGame, left: randomTech(state.right)};
        } else {
            return {...state, gameState: GameState.inGame, right: randomTech(state.left)};
        }
    }),
    on(gameStateActions.selectLeft, (state) => {
        let newScore = state.score;
        if (state.gameState !== GameState.inGame) {
            return state;
        }
        if (isCorrect(state.right, state.left)) {
            newScore += 1;
        }
        return {...state, gameState: GameState.roundResults, score: newScore, guesses: state.guesses + 1};

    }),
    on(gameStateActions.selectRight, (state) => {
        let newScore = state.score;
        if (state.gameState !== GameState.inGame) {
            return state;
        }
        if (isCorrect(state.left, state.right)) {
            newScore += 1;
        }
        return {...state, gameState: GameState.roundResults, score: newScore, guesses: state.guesses + 1};
    }),
);

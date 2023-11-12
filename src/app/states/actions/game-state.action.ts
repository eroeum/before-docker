/**
 * Holds the view-state on what to show when.
 */

import { createAction } from '@ngrx/store';

export const newGame = createAction('[Game State] New Game');
export const startGame = createAction('[Game State] Start Game');
export const nextRound = createAction('[Game State] Next Round');
export const selectLeft = createAction('[Game State] Select Left');
export const selectRight = createAction('[Game State] Select Right');

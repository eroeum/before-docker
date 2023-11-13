import { Component } from '@angular/core';
import {Store, select} from '@ngrx/store';
import { Observable } from 'rxjs';
import { ITech } from '../../models/tech';
import { selectFormattedScore, selectGameState, selectLeft, selectRight } from '../../states/selectors/game-state.selector';
import * as gameStateActions from '../../states/actions/game-state.action';
import { GameState } from '../../models/state';
import {MatSnackBar} from '@angular/material/snack-bar';
import { isCorrect } from '../../states/reducers/game-state.reducer';

@Component({
  selector: 'app-game-container',
  templateUrl: './game-container.component.html',
  styleUrls: ['./game-container.component.scss']
})
export class GameContainerComponent {
  public gameState$: Observable<GameState>;
  public left$: Observable<ITech>;
  public right$: Observable<ITech>;
  public score$: Observable<string>;

  protected isDisplayingRoundResults = false;
  public GameState = GameState;

  constructor(
    private store: Store,
    private snackBar: MatSnackBar,
  ) {
    this.gameState$ = this.store.pipe(select(selectGameState));
    this.left$ = this.store.pipe(select(selectLeft));
    this.right$ = this.store.pipe(select(selectRight));
    this.score$ = this.store.pipe(select(selectFormattedScore));
  }

  public toDateFormat(date: Date): string {
    return date.toLocaleDateString('en-us', { year:"numeric", month:"long", day:"2-digit"});
  }

  public toDockerDate(date: Date): string {
    const delta = 2013 - date.getFullYear();
    return delta < 0 ? `${-delta} AD` : `${delta} BD`;
  }

  public onSelect(which: string) {
    if (which === 'left') {
      this.store.dispatch(gameStateActions.selectLeft());
    } else {
      this.store.dispatch(gameStateActions.selectRight());
    }
  }

  public nextRound() {
    this.store.dispatch(gameStateActions.nextRound());
  }

  public isCorrect(after: ITech | null, before: ITech | null, state: GameState | null) {
    if (!before || !after || !state) {
      return 'white';
    }

    if (state !== GameState.roundResults) {
      return 'white';
    }

    return before.creationDate <= after.creationDate ? 'green' : 'red';
  }

  public newGame() {
    this.store.dispatch(gameStateActions.newGame());
  }
}

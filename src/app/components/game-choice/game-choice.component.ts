import { Component } from '@angular/core';
import {Store} from '@ngrx/store';
import * as gameStateActions from '../../states/actions/game-state.action';

@Component({
  selector: 'app-game-choice',
  templateUrl: './game-choice.component.html',
  styleUrls: ['./game-choice.component.scss']
})
export class GameChoiceComponent {

  constructor(
    private store: Store,
  ) {}

  public onStart() {
    this.store.dispatch(gameStateActions.startGame());
  }
}

import { Component, OnInit } from '@angular/core';
import {Store} from '@ngrx/store';
import { Subscription } from 'rxjs';
import * as gameStateActions from '../../states/actions/game-state.action';

@Component({
  selector: 'app-game-choice',
  templateUrl: './game-choice.component.html',
  styleUrls: ['./game-choice.component.scss']
})
export class GameChoiceComponent implements OnInit {

  constructor(
    private store: Store,
  ) {}

  private subscriptions: Subscription[] = [];

  ngOnInit() {
  }

  public onStart() {
    this.store.dispatch(gameStateActions.startGame());
  }
}

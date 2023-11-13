import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import {Store, select} from '@ngrx/store';
import { GameState } from './models/state';
import { selectGameState } from './states/selectors/game-state.selector';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'before-docker';

  public gameState$: Observable<GameState>;

  public GameState = GameState;
  
  constructor(
    private store: Store,
  ) {
    this.gameState$ = this.store.pipe(select(selectGameState));
  }
}

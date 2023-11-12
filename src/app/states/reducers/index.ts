import { StoreModule } from '@ngrx/store';
import { reducer } from './game-state.reducer';


export const reducers = StoreModule.forRoot({
    gameState: reducer,
})

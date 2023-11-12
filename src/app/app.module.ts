import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GameChoiceComponent } from './components/game-choice/game-choice.component';
import {MatButtonModule} from '@angular/material/button';
import { StoreModule } from '@ngrx/store';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatCardModule} from '@angular/material/card';
import { reducers } from './states/reducers';
import { GameContainerComponent } from './components/game-container/game-container.component';
import { MatToolbarModule } from '@angular/material/toolbar';


@NgModule({
  declarations: [
    AppComponent,
    GameChoiceComponent,
    GameContainerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatCardModule,
    reducers,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

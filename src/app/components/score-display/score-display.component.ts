import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-score-display',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './score-display.component.html',
  styleUrl: './score-display.component.scss',
})
export class ScoreDisplayComponent {
  readonly gameService = inject(GameService);
}

import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GamePhase } from '../../models/game-state.model';
import { GameService } from '../../services/game.service';
import { ScoreDisplayComponent } from '../score-display/score-display.component';
import { TechCardComponent } from '../tech-card/tech-card.component';
import { ResultOverlayComponent } from '../result-overlay/result-overlay.component';
import { TimelineComponent } from '../timeline/timeline.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    ScoreDisplayComponent,
    TechCardComponent,
    ResultOverlayComponent,
    TimelineComponent,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent implements OnInit {
  readonly gameService = inject(GameService);
  private readonly route = inject(ActivatedRoute);

  readonly GamePhase = GamePhase;
  categoryId = 'software';

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('categoryId') ?? 'software';
    this.gameService.startGame(this.categoryId);
  }
}

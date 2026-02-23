import { Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RoundResult } from '../../models/game-state.model';
import { toDockerDate } from '../../services/game.service';

@Component({
  selector: 'app-result-overlay',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './result-overlay.component.html',
  styleUrl: './result-overlay.component.scss',
})
export class ResultOverlayComponent {
  readonly result = input.required<RoundResult>();
  readonly next = output<void>();

  readonly toDockerDate = toDockerDate;

  onNext(): void {
    this.next.emit();
  }
}

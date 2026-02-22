import { Component, input, output } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { DisplayTech } from '../../models/technology.model';

@Component({
  selector: 'app-tech-card',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatIconModule],
  templateUrl: './tech-card.component.html',
  styleUrl: './tech-card.component.scss',
})
export class TechCardComponent {
  readonly tech = input.required<DisplayTech>();
  readonly disabled = input(false);
  readonly selected = output<void>();

  onSelect(): void {
    this.selected.emit();
  }
}

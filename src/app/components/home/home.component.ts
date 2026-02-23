import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CATEGORIES } from '../../data/categories.data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly categories = CATEGORIES;

  constructor(private router: Router) {}

  play(categoryId: string): void {
    this.router.navigate(['/game', categoryId]);
  }
}

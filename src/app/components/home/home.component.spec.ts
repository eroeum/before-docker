import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { HomeComponent } from './home.component';
import { CATEGORIES } from '../../data/categories.data';

describe('HomeComponent', () => {
  let navigateSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    navigateSpy = vi.fn();
    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: { navigate: navigateSpy } },
      ],
    });
  });

  function create() {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the "Before Docker" title', () => {
    const fixture = create();
    const title = fixture.nativeElement.querySelector('.title');
    expect(title?.textContent?.trim()).toBe('Before Docker');
  });

  it('renders one tile per category', () => {
    const fixture = create();
    const tiles = fixture.nativeElement.querySelectorAll('.category-tile');
    expect(tiles.length).toBe(CATEGORIES.length);
  });

  it('shows each category name in its tile', () => {
    const fixture = create();
    const tileTexts = (
      Array.from(fixture.nativeElement.querySelectorAll('.tile-name')) as HTMLElement[]
    ).map((el) => el.textContent?.trim());
    for (const cat of CATEGORIES) {
      expect(tileTexts).toContain(cat.name);
    }
  });

  it('navigates to /game/:id when a tile is clicked', () => {
    const fixture = create();
    const firstTile = fixture.nativeElement.querySelector('.category-tile') as HTMLElement;
    firstTile.click();
    expect(navigateSpy).toHaveBeenCalledWith(['/game', CATEGORIES[0].id]);
  });

  it('shows BD and AD legend pills', () => {
    const fixture = create();
    const pills = fixture.nativeElement.querySelectorAll('.legend-pill');
    expect(pills.length).toBe(2);
  });
});

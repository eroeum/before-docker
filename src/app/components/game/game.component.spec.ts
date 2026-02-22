/**
 * Integration tests for GameComponent.
 * Uses a real GameService but mocks WikipediaService so no HTTP calls are made.
 */
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { GameComponent } from './game.component';
import { GameService } from '../../services/game.service';
import { WikipediaService } from '../../services/wikipedia.service';
import { GamePhase } from '../../models/game-state.model';

const WIKI_DATA = { description: 'Test', thumbnailUrl: null, extract: 'Extract' };
const MOCK_ROUTE = { snapshot: { paramMap: { get: () => 'software' } } };

describe('GameComponent (integration)', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        GameService,
        { provide: WikipediaService, useValue: { fetch: () => of(WIKI_DATA), prefetch: vi.fn() } },
        { provide: ActivatedRoute, useValue: MOCK_ROUTE },
      ],
    });
    service = TestBed.inject(GameService);
  });

  async function createAndWaitForPlaying() {
    const fixture = TestBed.createComponent(GameComponent);
    fixture.detectChanges();
    await vi.waitFor(
      () => {
        fixture.detectChanges();
        return service.phase() === GamePhase.Playing;
      },
      { timeout: 5000 },
    );
    fixture.detectChanges();
    return fixture;
  }

  // ─── Initial loading ────────────────────────────────────────────────────────

  it('shows a loading spinner initially while fetching techs', () => {
    const fixture = TestBed.createComponent(GameComponent);
    fixture.detectChanges();
    // During Loading phase with no techs yet, shows initial-loading
    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).not.toBeNull();
  });

  // ─── Playing state ─────────────────────────────────────────────────────────

  it('shows two tech card panels once techs are loaded', async () => {
    const fixture = await createAndWaitForPlaying();
    const cards = fixture.nativeElement.querySelectorAll('app-tech-card');
    expect(cards.length).toBe(2);
  });

  it('shows the VS badge between the two panels', async () => {
    const fixture = await createAndWaitForPlaying();
    const badge = fixture.nativeElement.querySelector('.vs-badge');
    expect(badge?.textContent?.trim()).toBe('VS');
  });

  it('shows the timeline component', async () => {
    const fixture = await createAndWaitForPlaying();
    expect(fixture.nativeElement.querySelector('app-timeline')).not.toBeNull();
  });

  it('shows the score display', async () => {
    const fixture = await createAndWaitForPlaying();
    expect(fixture.nativeElement.querySelector('app-score-display')).not.toBeNull();
  });

  it('shows Docker on the timeline from the very first round', async () => {
    const fixture = await createAndWaitForPlaying();
    const dockerMarker = fixture.nativeElement.querySelector('.docker-marker');
    expect(dockerMarker).not.toBeNull();
  });

  // ─── After a guess ─────────────────────────────────────────────────────────

  it('shows the result overlay after the user makes a pick', async () => {
    const fixture = await createAndWaitForPlaying();

    // Simulate a guess via the service
    const left = service.leftTech()!;
    const right = service.rightTech()!;
    service.guess(left.year <= right.year);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.backdrop');
    expect(backdrop).not.toBeNull();
  });

  it('dims the panels when the result overlay is open', async () => {
    const fixture = await createAndWaitForPlaying();
    service.guess(true);
    fixture.detectChanges();

    const panels = fixture.nativeElement.querySelector('.panels');
    expect(panels.classList).toContain('dimmed');
  });

  it('adds two techs to the timeline after a guess', async () => {
    const fixture = await createAndWaitForPlaying();
    expect(service.playedTechs().length).toBe(0);

    service.guess(true);
    fixture.detectChanges();

    expect(service.playedTechs().length).toBe(2);
  });

  // ─── Game over ─────────────────────────────────────────────────────────────

  it('shows the game-over overlay when lives reach 0', async () => {
    const fixture = await createAndWaitForPlaying();

    for (let life = 3; life > 0; life--) {
      const left = service.leftTech()!;
      const right = service.rightTech()!;
      service.guess(left.year > right.year); // wrong

      if (life > 1) {
        service.nextRound();
        await vi.waitFor(() => service.phase() === GamePhase.Playing, { timeout: 3000 });
      }
    }

    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.gameover-overlay')).not.toBeNull();
  });
});

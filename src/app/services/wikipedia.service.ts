import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, shareReplay } from 'rxjs';
import { WikipediaData } from '../models/technology.model';

const FALLBACK: WikipediaData = { description: '', extract: '', thumbnailUrl: null };

interface WikiSummaryResponse {
  description?: string;
  extract?: string;
  thumbnail?: { source?: string };
}

@Injectable({ providedIn: 'root' })
export class WikipediaService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, WikipediaData>();
  private readonly inFlight = new Map<string, Observable<WikipediaData>>();

  fetch(title: string): Observable<WikipediaData> {
    if (this.cache.has(title)) {
      return of(this.cache.get(title)!);
    }
    if (this.inFlight.has(title)) {
      return this.inFlight.get(title)!;
    }

    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const obs$: Observable<WikipediaData> = this.http
      .get<WikiSummaryResponse>(url)
      .pipe(
        map(
          (response): WikipediaData => ({
            description: response.description ?? '',
            extract: response.extract ?? '',
            thumbnailUrl: response.thumbnail?.source ?? null,
          }),
        ),
        catchError(() => of(FALLBACK)),
        shareReplay(1),
      );

    this.inFlight.set(title, obs$);

    obs$.subscribe({
      next: (data) => {
        this.cache.set(title, data);
        this.inFlight.delete(title);
      },
      error: () => {
        this.inFlight.delete(title);
      },
    });

    return obs$;
  }

  prefetch(titles: string[]): void {
    for (const title of titles) {
      if (!this.cache.has(title) && !this.inFlight.has(title)) {
        this.fetch(title).subscribe();
      }
    }
  }
}

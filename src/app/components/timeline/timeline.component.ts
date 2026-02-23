import { Component, computed, input } from '@angular/core';
import { Technology } from '../../models/technology.model';

interface TimelineMarker {
  name: string;
  year: number;
  isDocker: boolean;
  position: number;
  above: boolean;
}

const MIN_YEAR = 1965;
const MAX_YEAR = 2020;
const RANGE = MAX_YEAR - MIN_YEAR;

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
})
export class TimelineComponent {
  readonly playedTechs = input<Technology[]>([]);

  readonly DECADE_MARKS = [1970, 1980, 1990, 2000, 2010];

  readonly markers = computed<TimelineMarker[]>(() => {
    const techs = this.playedTechs().filter((t) => t.id !== 'docker');
    const docker: TimelineMarker = {
      name: 'Docker',
      year: 2013,
      isDocker: true,
      position: this.toPercent(2013),
      above: false,
    };
    const rest: TimelineMarker[] = techs.map((t, i) => ({
      name: t.name,
      year: t.year,
      isDocker: false,
      position: this.toPercent(t.year),
      above: i % 2 === 0,
    }));
    return [docker, ...rest];
  });

  toPercent(year: number): number {
    return ((year - MIN_YEAR) / RANGE) * 100;
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-row',
  standalone: true,
  imports: [],
  templateUrl: './skeleton-row.component.html',
  styleUrl: './skeleton-row.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonRowComponent {}

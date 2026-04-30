import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-skeleton-row',
  standalone: true,
  template: `
    @for (row of rowsArray; track $index) {
      <div class="skeleton-row">
        <div class="skeleton-cell"></div>
        <div class="skeleton-cell"></div>
        <div class="skeleton-cell"></div>
        <div class="skeleton-cell"></div>
        <div class="skeleton-cell"></div>
      </div>
    }
  `,
  styles: `
    .skeleton-row {
      display: flex;
      gap: 16px;
      padding: 16px;
      border-bottom: 1px solid #eee;
    }
    .skeleton-cell {
      height: 20px;
      background: #f0f0f0;
      flex: 1;
      border-radius: 4px;
      animation: pulse 1.5s infinite ease-in-out;
    }
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.4; }
      100% { opacity: 1; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonRowComponent {
  @Input() rows = 5;

  get rowsArray() {
    return Array(this.rows).fill(0);
  }
}

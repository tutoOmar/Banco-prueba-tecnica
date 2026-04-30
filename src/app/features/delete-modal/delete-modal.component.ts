import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  imports: [],
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteModalComponent {}

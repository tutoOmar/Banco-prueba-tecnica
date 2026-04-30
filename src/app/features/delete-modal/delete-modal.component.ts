import { Component, Input, Output, EventEmitter, HostListener, AfterViewInit, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteModalComponent implements AfterViewInit {
  @Input() message: string = '';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('cancelBtn') cancelBtn!: ElementRef<HTMLButtonElement>;

  ngAfterViewInit(): void {
    this.cancelBtn.nativeElement.focus();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cancel.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}

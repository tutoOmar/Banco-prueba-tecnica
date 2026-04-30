import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent {}

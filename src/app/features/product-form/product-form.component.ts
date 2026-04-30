import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FinancialProductsService } from '../../core/services/financial-products.service';
import { ProductsStore } from '../../core/store/products.store';
import { dateReleaseValidator } from '../../shared/validators/date-release.validator';
import { dateRevisionValidator } from '../../shared/validators/date-revision.validator';
import { idAsyncValidator } from '../../shared/validators/id-async.validator';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(FinancialProductsService);
  private readonly store = inject(ProductsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  productForm!: FormGroup;
  isEditMode = signal(false);
  isSubmitting = signal(false);
  formErrorMessage = signal<string | null>(null);
  minDate = signal<string>(new Date().toISOString().split('T')[0]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.initForm(id);
    } else {
      this.initForm();
    }
  }

  private initForm(id?: string): void {
    this.productForm = this.fb.group({
      id: [{ value: '', disabled: !!id }, [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(10)
      ], id ? [] : [idAsyncValidator(this.service)]],
      name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      logo: ['', Validators.required],
      date_release: ['', [Validators.required, dateReleaseValidator()]],
      date_revision: [{ value: '', disabled: true }, Validators.required]
    }, { validators: [dateRevisionValidator()] });

    if (id) {
      const product = this.store.products().find(p => p.id === id);
      if (product) {
        this.productForm.patchValue(product);
      }
    }

    this.productForm.get('date_release')?.valueChanges.subscribe(value => {
      if (value) {
        const [year, month, day] = value.split('-').map(Number);
        const revisionDate = new Date(year + 1, month - 1, day);
        
        const resYear = revisionDate.getFullYear();
        const resMonth = String(revisionDate.getMonth() + 1).padStart(2, '0');
        const resDay = String(revisionDate.getDate()).padStart(2, '0');
        
        this.productForm.get('date_revision')?.setValue(`${resYear}-${resMonth}-${resDay}`);
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;

    this.isSubmitting.set(true);
    this.formErrorMessage.set(null);

    const productData = this.productForm.getRawValue();

    if (this.isEditMode()) {
      this.service.updateProduct(productData.id, productData).subscribe({
        next: (res) => {
          this.store.updateProduct(res.data);
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.formErrorMessage.set(err.message);
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.service.createProduct(productData).subscribe({
        next: (res) => {
          this.store.addProduct(res.data);
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.formErrorMessage.set(err.message);
          this.isSubmitting.set(false);
        }
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/products']);
  }

  onReset(): void {
    if (this.isEditMode()) {
      const id = this.route.snapshot.paramMap.get('id');
      const product = this.store.products().find(p => p.id === id);
      if (product) {
        this.productForm.patchValue(product);
      }
    } else {
      this.productForm.reset();
    }
  }

  isInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field?.invalid && (field?.touched || field?.dirty));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('minlength')) {
      const min = field.errors?.['minlength'].requiredLength;
      return `Mínimo ${min} caracteres`;
    }
    if (field?.hasError('maxlength')) {
      const max = field.errors?.['maxlength'].requiredLength;
      return `Máximo ${max} caracteres`;
    }
    if (field?.hasError('idExists')) return 'ID no válido o ya existe';
    if (field?.hasError('invalidDateRelease')) return 'Fecha debe ser igual o mayor a hoy';
    if (this.productForm.hasError('invalidDateRevision') && fieldName === 'date_revision') {
      return 'Debe ser exactamente 1 año después';
    }
    return '';
  }
}

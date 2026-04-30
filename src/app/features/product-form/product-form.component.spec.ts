import { ComponentFixture, TestBed, fakeAsync, tick, flush, discardPeriodicTasks } from '@angular/core/testing';
import { ProductFormComponent } from './product-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { FinancialProductsService } from '../../core/services/financial-products.service';
import { ProductsStore } from '../../core/store/products.store';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let service: FinancialProductsService;
  let store: ProductsStore;
  let router: Router;

  const mockProduct = {
    id: 'test-id',
    name: 'Test Product',
    description: 'Test Description',
    logo: 'logo.png',
    date_release: '2026-05-01',
    date_revision: '2027-05-01'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [
        ProductsStore,
        {
          provide: FinancialProductsService,
          useValue: {
            verifyId: () => of(false),
            createProduct: () => of({ data: mockProduct, message: 'Success' }),
            updateProduct: () => of({ data: mockProduct, message: 'Success' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(FinancialProductsService);
    store = TestBed.inject(ProductsStore);
    router = TestBed.inject(Router);
  });

  it('debe crear el componente en modo creación por defecto', () => {
    fixture.detectChanges();
    expect(component.isEditMode()).toBe(false);
    expect(component.productForm.get('id')?.enabled).toBe(true);
  });

  it('debe navegar al listado al hacer click en Volver', () => {
    jest.spyOn(router, 'navigate');
    fixture.detectChanges();
    const backBtn = fixture.nativeElement.querySelector('.btn-back');
    backBtn.click();
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('debe calcular automáticamente la fecha de revisión al cambiar la fecha de liberación', () => {
    fixture.detectChanges();
    component.productForm.get('date_release')?.setValue('2025-01-01');
    expect(component.productForm.get('date_revision')?.value).toBe('2026-01-01');
  });

  it('debe validar que el nombre tenga al menos 5 caracteres', () => {
    fixture.detectChanges();
    const nameControl = component.productForm.get('name');
    nameControl?.setValue('abcd');
    expect(nameControl?.valid).toBe(false);
    expect(nameControl?.hasError('minlength')).toBe(true);
  });


  it('debe mostrar mensaje de error para campo requerido', () => {
    fixture.detectChanges();
    const nameControl = component.productForm.get('name');
    nameControl?.setValue('');
    nameControl?.markAsTouched();
    fixture.detectChanges();
    expect(component.getErrorMessage('name')).toBe('Este campo es requerido');
  });

  it('debe mostrar mensaje de error para longitud máxima', () => {
    fixture.detectChanges();
    const nameControl = component.productForm.get('name');
    nameControl?.setValue('a'.repeat(101));
    nameControl?.markAsTouched();
    fixture.detectChanges();
    expect(component.getErrorMessage('name')).toBe('Máximo 100 caracteres');
  });

  it('debe mostrar mensaje de error para fecha de liberación inválida', () => {
    fixture.detectChanges();
    const dateControl = component.productForm.get('date_release');
    dateControl?.setValue('2020-01-01');
    dateControl?.markAsTouched();
    fixture.detectChanges();
    expect(component.getErrorMessage('date_release')).toBe('Fecha debe ser igual o mayor a hoy');
  });

  it('debe llamar a createProduct y navegar al éxito en modo creación', () => {
    jest.spyOn(service, 'createProduct');
    jest.spyOn(router, 'navigate');
    fixture.detectChanges();
    
    component.productForm.patchValue(mockProduct);
    component.onSubmit();
    
    expect(service.createProduct).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('debe reiniciar el formulario al hacer click en Reiniciar', () => {
    fixture.detectChanges();
    component.productForm.get('name')?.setValue('Some Value');
    component.onReset();
    expect(component.productForm.get('name')?.value).toBeNull();
  });
});

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProductFormComponent } from './product-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { FinancialProductsService } from '../../core/services/financial-products.service';
import { ProductsStore } from '../../core/store/products.store';
import { of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

describe('ProductFormComponent - Edit Mode', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let service: FinancialProductsService;
  let store: ProductsStore;

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
            updateProduct: () => of({ data: mockProduct, message: 'Updated' })
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? 'test-id' : null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(FinancialProductsService);
    store = TestBed.inject(ProductsStore);
    
    // Simular producto en el store
    store.setProducts([mockProduct]);
  });

  it('debe iniciar en modo edición si hay un ID en la ruta', () => {
    fixture.detectChanges();
    expect(component.isEditMode()).toBe(true);
    expect(component.productForm.get('id')?.disabled).toBe(true);
  });

  it('debe precargar los datos del producto desde el store', () => {
    fixture.detectChanges();
    expect(component.productForm.get('name')?.value).toBe(mockProduct.name);
  });

  it('debe llamar a updateProduct al enviar en modo edición', () => {
    jest.spyOn(service, 'updateProduct');
    fixture.detectChanges();
    
    component.onSubmit();
    
    expect(service.updateProduct).toHaveBeenCalledWith('test-id', expect.anything());
  });
});

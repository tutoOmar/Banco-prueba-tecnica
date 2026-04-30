import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ProductListComponent } from './product-list.component';
import { ProductsStore } from '../../core/store/products.store';
import { FinancialProductsService } from '../../core/services/financial-products.service';
import { of, throwError } from 'rxjs';
import { FinancialProduct } from '../../core/models/financial-product.model';

const mockProducts: FinancialProduct[] = [
  { id: '1', name: 'Product A', description: 'Desc A', logo: '', date_release: '', date_revision: '' },
  { id: '2', name: 'Product B', description: 'Desc B', logo: '', date_release: '', date_revision: '' }
];

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let store: ProductsStore;
  let service: FinancialProductsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        ProductsStore,
        {
          provide: FinancialProductsService,
          useValue: {
            getProducts: () => of(mockProducts)
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(ProductsStore);
    service = TestBed.inject(FinancialProductsService);
  });

  it('debe crear el componente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('debe cargar productos al inicializar si el store no está cargado', () => {
    jest.spyOn(service, 'getProducts').mockReturnValue(of(mockProducts));
    fixture.detectChanges();
    expect(service.getProducts).toHaveBeenCalled();
    expect(store.products()).toEqual(mockProducts);
  });

  it('debe filtrar productos basados en el término de búsqueda', fakeAsync(() => {
    fixture.detectChanges();
    component.searchControl.setValue('Product A');
    tick(400);
    fixture.detectChanges();
    expect(component.filteredProducts().length).toBe(1);
    expect(component.filteredProducts()[0].name).toBe('Product A');
  }));

  it('debe cambiar el tamaño de página y actualizar los productos paginados', () => {
    fixture.detectChanges();
    component.pageSize.set(5);
    const event = { target: { value: '10' } } as any;
    component.onPageSizeChange(event);
    expect(component.pageSize()).toBe(10);
  });

  it('debe mostrar el skeleton mientras está cargando', () => {
    fixture.detectChanges();
    store.setLoading();
    fixture.detectChanges();
    const skeleton = fixture.nativeElement.querySelector('app-skeleton-row');
    expect(skeleton).toBeTruthy();
  });

  it('debe mostrar el mensaje de error si el servicio falla', () => {
    fixture.detectChanges();
    const errorMsg = 'Error al cargar productos';
    store.setError(errorMsg);
    fixture.detectChanges();
    const errorContainer = fixture.nativeElement.querySelector('.error-message');
    expect(errorContainer.textContent).toContain(errorMsg);
  });

  it('debe mostrar el estado vacío si no hay productos', () => {
    fixture.detectChanges();
    store.setProducts([]);
    fixture.detectChanges();
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('debe navegar al formulario de creación al hacer click en Agregar', () => {
    const router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.btn-primary');
    btn.click();
    expect(router.navigate).toHaveBeenCalledWith(['/products/new']);
  });

  it('debe mostrar el menú contextual al hacer click en ⋮', () => {
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.btn-menu');
    btn.click();
    fixture.detectChanges();
    const menu = fixture.nativeElement.querySelector('.dropdown-menu');
    expect(menu).toBeTruthy();
  });

  it('debe navegar al formulario de edición al seleccionar Editar en el menú', () => {
    const router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');
    fixture.detectChanges();
    
    // Abrir menú
    const btn = fixture.nativeElement.querySelector('.btn-menu');
    btn.click();
    fixture.detectChanges();
    
    // Click en Editar
    const editBtn = fixture.nativeElement.querySelector('.dropdown-menu button');
    editBtn.click();
    
    expect(router.navigate).toHaveBeenCalledWith(['/products/edit', '1']);
  });
});

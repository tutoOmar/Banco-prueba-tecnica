import { TestBed } from '@angular/core/testing';
import { ProductsStore } from './products.store';
import { FinancialProduct } from '../models/financial-product.model';

const mockProduct = (id: string): FinancialProduct => ({
  id,
  name: `Producto ${id}`,
  description: `Descripción de ${id}`,
  logo: 'https://example.com/logo.png',
  date_release: '2025-01-01',
  date_revision: '2026-01-01',
});

describe('ProductsStore', () => {
  let store: ProductsStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductsStore]
    });
    store = TestBed.inject(ProductsStore);
  });

  describe('Estado inicial', () => {
    it('debe iniciar con products vacío', () => {
      expect(store.products()).toEqual([]);
    });

    it('debe iniciar con status idle', () => {
      expect(store.status()).toBe('idle');
    });

    it('debe iniciar con loaded en false', () => {
      expect(store.isLoaded()).toBe(false);
    });

    it('debe iniciar con error null', () => {
      expect(store.error()).toBeNull();
    });
  });

  describe('setLoading()', () => {
    it('debe cambiar status a loading', () => {
      store.setLoading();
      expect(store.status()).toBe('loading');
      expect(store.isLoading()).toBe(true);
    });

    it('debe limpiar el error previo', () => {
      store.setError('error previo');
      store.setLoading();
      expect(store.error()).toBeNull();
    });
  });

  describe('setError()', () => {
    it('debe cambiar status a error', () => {
      store.setError('Algo salió mal');
      expect(store.status()).toBe('error');
      expect(store.hasError()).toBe(true);
    });

    it('debe guardar el mensaje de error', () => {
      store.setError('Error de red');
      expect(store.error()).toBe('Error de red');
    });
  });

  describe('setProducts()', () => {
    it('debe guardar la lista y marcar loaded en true', () => {
      const list = [mockProduct('p1'), mockProduct('p2')];
      store.setProducts(list);
      expect(store.products()).toEqual(list);
      expect(store.isLoaded()).toBe(true);
      expect(store.status()).toBe('idle');
    });

    it('computed total debe reflejar la cantidad de productos', () => {
      store.setProducts([mockProduct('p1'), mockProduct('p2'), mockProduct('p3')]);
      expect(store.total()).toBe(3);
    });
  });

  describe('addProduct()', () => {
    it('debe agregar un producto al final de la lista', () => {
      store.setProducts([mockProduct('p1')]);
      store.addProduct(mockProduct('p2'));
      expect(store.products().length).toBe(2);
      expect(store.products()[1].id).toBe('p2');
    });
  });

  describe('updateProduct()', () => {
    it('debe actualizar el producto con el mismo id', () => {
      store.setProducts([mockProduct('p1')]);
      const updated = { ...mockProduct('p1'), name: 'Nombre actualizado' };
      store.updateProduct(updated);
      expect(store.products()[0].name).toBe('Nombre actualizado');
    });

    it('no debe modificar otros productos', () => {
      store.setProducts([mockProduct('p1'), mockProduct('p2')]);
      store.updateProduct({ ...mockProduct('p1'), name: 'Modificado' });
      expect(store.products()[1].name).toBe('Producto p2');
    });
  });

  describe('removeProduct()', () => {
    it('debe eliminar el producto con el id dado', () => {
      store.setProducts([mockProduct('p1'), mockProduct('p2')]);
      store.removeProduct('p1');
      expect(store.products().length).toBe(1);
      expect(store.products()[0].id).toBe('p2');
    });

    it('no debe modificar la lista si el id no existe', () => {
      store.setProducts([mockProduct('p1')]);
      store.removeProduct('no-existe');
      expect(store.products().length).toBe(1);
    });
  });

  describe('Computed signals', () => {
    it('isLoading es false cuando status es idle', () => {
      expect(store.isLoading()).toBe(false);
    });

    it('hasError es false cuando status es idle', () => {
      expect(store.hasError()).toBe(false);
    });
  });
});

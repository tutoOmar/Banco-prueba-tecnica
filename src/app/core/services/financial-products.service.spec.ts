import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { FinancialProductsService } from './financial-products.service';
import { FinancialProduct } from '../models/financial-product.model';
import { environment } from '../../../environments/environment';

const BASE = `${environment.apiBaseUrl}/bp/products`;

const mockProduct: FinancialProduct = {
  id: 'trj-crd',
  name: 'Tarjetas de Crédito',
  description: 'Tarjeta de consumo bajo la modalidad de crédito',
  logo: 'https://example.com/logo.png',
  date_release: '2025-01-01',
  date_revision: '2026-01-01',
};

describe('FinancialProductsService', () => {
  let service: FinancialProductsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FinancialProductsService],
    });
    service = TestBed.inject(FinancialProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('getProducts()', () => {
    it('debe retornar el array de productos en respuesta 200', (done) => {
      service.getProducts().subscribe((products) => {
        expect(products).toEqual([mockProduct]);
        done();
      });
      httpMock.expectOne(BASE).flush({ data: [mockProduct] });
    });

    it('debe lanzar error legible en fallo de red', (done) => {
      service.getProducts().subscribe({
        error: (err: Error) => {
          expect(err.message).toBeTruthy();
          done();
        },
      });
      httpMock.expectOne(BASE).error(new ProgressEvent('error'));
    });
  });

  describe('createProduct()', () => {
    it('debe retornar el producto creado en respuesta 200', (done) => {
      service.createProduct(mockProduct).subscribe((res) => {
        expect(res.data).toEqual(mockProduct);
        expect(res.message).toBe('Product added successfully');
        done();
      });
      httpMock.expectOne(BASE).flush({
        message: 'Product added successfully',
        data: mockProduct,
      });
    });

    it('debe lanzar error con mensaje del backend en respuesta 400', (done) => {
      service.createProduct(mockProduct).subscribe({
        error: (err: Error) => {
          expect(err.message).toContain('Invalid body');
          done();
        },
      });
      httpMock.expectOne(BASE).flush(
        { message: 'Invalid body, check errors property for more info.' },
        { status: 400, statusText: 'Bad Request' }
      );
    });
  });

  describe('updateProduct()', () => {
    const { id, ...payload } = mockProduct;

    it('debe retornar el producto actualizado en respuesta 200', (done) => {
      service.updateProduct(id, payload).subscribe((res) => {
        expect(res.message).toBe('Product updated successfully');
        done();
      });
      httpMock.expectOne(`${BASE}/${id}`).flush({
        message: 'Product updated successfully',
        data: mockProduct,
      });
    });

    it('debe lanzar error en respuesta 404', (done) => {
      service.updateProduct(id, payload).subscribe({
        error: (err: Error) => {
          expect(err.message).toContain('Not product found');
          done();
        },
      });
      httpMock.expectOne(`${BASE}/${id}`).flush(
        { message: 'Not product found with that identifier' },
        { status: 404, statusText: 'Not Found' }
      );
    });
  });

  describe('deleteProduct()', () => {
    it('debe retornar mensaje de éxito en respuesta 200', (done) => {
      service.deleteProduct('trj-crd').subscribe((res) => {
        expect(res.message).toBe('Product removed successfully');
        done();
      });
      httpMock.expectOne(`${BASE}/trj-crd`).flush({ message: 'Product removed successfully' });
    });

    it('debe lanzar error en respuesta 404', (done) => {
      service.deleteProduct('no-existe').subscribe({
        error: (err: Error) => {
          expect(err.message).toContain('Not product found');
          done();
        },
      });
      httpMock.expectOne(`${BASE}/no-existe`).flush(
        { message: 'Not product found with that identifier' },
        { status: 404, statusText: 'Not Found' }
      );
    });
  });

  describe('verifyId()', () => {
    it('debe retornar true si el id ya existe', (done) => {
      service.verifyId('trj-crd').subscribe((exists) => {
        expect(exists).toBe(true);
        done();
      });
      httpMock.expectOne(`${BASE}/verification/trj-crd`).flush(true);
    });

    it('debe retornar false si el id no existe', (done) => {
      service.verifyId('nuevo-id').subscribe((exists) => {
        expect(exists).toBe(false);
        done();
      });
      httpMock.expectOne(`${BASE}/verification/nuevo-id`).flush(false);
    });
  });
});

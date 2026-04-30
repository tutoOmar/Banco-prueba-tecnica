import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  FinancialProduct,
  ProductsResponse,
  ProductMutationResponse,
  CreateProductPayload,
  UpdateProductPayload,
} from '../models/financial-product.model';

@Injectable({ providedIn: 'root' })
export class FinancialProductsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/bp/products`;

  getProducts(): Observable<FinancialProduct[]> {
    return this.http.get<ProductsResponse>(this.base).pipe(
      map((res) => res.data),
      catchError(this.handleError)
    );
  }

  createProduct(payload: CreateProductPayload): Observable<ProductMutationResponse> {
    return this.http
      .post<ProductMutationResponse>(this.base, payload)
      .pipe(catchError(this.handleError));
  }

  updateProduct(
    id: string,
    payload: UpdateProductPayload
  ): Observable<ProductMutationResponse> {
    return this.http
      .put<ProductMutationResponse>(`${this.base}/${id}`, payload)
      .pipe(catchError(this.handleError));
  }

  deleteProduct(id: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.base}/${id}`)
      .pipe(catchError(this.handleError));
  }

  verifyId(id: string): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.base}/verification/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    const message = err.error?.message ?? err.message ?? 'Error desconocido del servidor';
    return throwError(() => new Error(message));
  }
}

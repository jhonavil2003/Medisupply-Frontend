import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductoRepository, CreateProductRequest } from '../../../domain/repositories/producto.repository';
import {
  ProductoEntity,
  ProductoDetailedEntity,
  ProductListResponse,
  ProductQueryParams
} from '../../../domain/entities/producto.entity';
import { environment } from '../../../../../environments/environment';

@Injectable()
export class HttpProductoRepository extends ProductoRepository {
  private http = inject(HttpClient);
  private apiUrl = `${environment.catalogApiUrl}/products`;

  getAll(params: ProductQueryParams = {}): Observable<ProductListResponse> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<ProductListResponse>(this.apiUrl, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  getBySku(sku: string): Observable<ProductoDetailedEntity> {
    return this.http.get<ProductoDetailedEntity>(`${this.apiUrl}/${sku}`)
      .pipe(catchError(this.handleError));
  }

  searchProducts(searchTerm: string, page: number = 1, perPage: number = 20): Observable<ProductListResponse> {
    return this.getAll({
      search: searchTerm,
      is_active: true,
      page,
      per_page: perPage
    });
  }

  getActiveProducts(page: number = 1, perPage: number = 20): Observable<ProductListResponse> {
    return this.getAll({
      is_active: true,
      page,
      per_page: perPage
    });
  }

  getProductsByCategory(category: string, page: number = 1): Observable<ProductListResponse> {
    return this.getAll({
      category,
      is_active: true,
      page,
      per_page: 20
    });
  }

  getColdChainProducts(page: number = 1): Observable<ProductListResponse> {
    return this.getAll({
      requires_cold_chain: true,
      is_active: true,
      page,
      per_page: 20
    });
  }

  getProductsBySupplier(supplierId: number, page: number = 1): Observable<ProductListResponse> {
    return this.getAll({
      supplier_id: supplierId,
      is_active: true,
      page,
      per_page: 20
    });
  }

  create(productData: CreateProductRequest): Observable<ProductoDetailedEntity> {
    return this.http.post<ProductoDetailedEntity>(this.apiUrl, productData)
      .pipe(catchError(this.handleError));
  }

  private buildHttpParams(params: ProductQueryParams): HttpParams {
    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      const value = params[key as keyof ProductQueryParams];
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return httpParams;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = error.error.error || 'Parámetros de búsqueda inválidos';
          break;
        case 404:
          errorMessage = 'Producto no encontrado en el catálogo';
          break;
        case 500:
          errorMessage = 'Error del servidor. Intente nuevamente.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.error?.error || error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}

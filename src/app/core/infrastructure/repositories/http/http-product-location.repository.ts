import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductLocationRepository } from '../../../domain/repositories/product-location.repository';
import {
  ProductLocationResponse,
  ProductLocationQueryParams,
  StockLevelsResponse
} from '../../../domain/entities/product-location.entity';
import {environment} from "../../../../../environments/environment";


@Injectable()
export class HttpProductLocationRepository extends ProductLocationRepository {
  private http = inject(HttpClient);
  private apiUrl = `${environment.logisticsApiUrl}/inventory`;

  getProductLocation(params: ProductLocationQueryParams): Observable<ProductLocationResponse> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<ProductLocationResponse>(`${this.apiUrl}/product-location`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  getStockLevels(productSku: string, distributionCenterId?: number): Observable<StockLevelsResponse> {
    let httpParams = new HttpParams().set('product_sku', productSku);

    if (distributionCenterId !== undefined) {
      httpParams = httpParams.set('distribution_center_id', distributionCenterId.toString());
    }

    return this.http.get<StockLevelsResponse>(`${this.apiUrl}/stock-levels`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  getLocationBySku(sku: string, orderBy: 'fefo' | 'fifo' | 'lifo' = 'fefo'): Observable<ProductLocationResponse> {
    return this.getProductLocation({
      product_sku: sku,
      only_available: true,
      order_by: orderBy
    });
  }

  getLocationByBarcode(barcode: string): Observable<ProductLocationResponse> {
    return this.getProductLocation({
      barcode,
      only_available: true
    });
  }

  searchProductLocation(searchTerm: string, onlyAvailable: boolean = true): Observable<ProductLocationResponse> {
    return this.getProductLocation({
      search_term: searchTerm,
      only_available: onlyAvailable,
      order_by: 'fefo'
    });
  }

  private buildHttpParams(params: ProductLocationQueryParams): HttpParams {
    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      const value = params[key as keyof ProductLocationQueryParams];
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return httpParams;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = error.error.error || 'Parámetros de búsqueda inválidos';
          break;
        case 404:
          errorMessage = 'Producto no encontrado en bodega';
          break;
        case 500:
          errorMessage = 'Error del servidor de logística. Intente nuevamente.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.error?.error || error.message}`;
      }
    }

    console.error('Error en ProductLocationRepository:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}

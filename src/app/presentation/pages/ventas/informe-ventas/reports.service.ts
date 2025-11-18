import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../..//environments/environment';

export interface SalesSummaryFilters {
  from_date?: string;  // YYYY-MM-DD
  to_date?: string;    // YYYY-MM-DD
  month?: number;      // 1-12
  year?: number;
  region?: string;
  territory?: string;
  product_sku?: string;
  employee_id?: string;
  order_status?: string;
}

export interface SalesSummaryItem {
  fecha: string;
  employee_id: string;
  vendedor: string;
  region: string | null;  // Puede ser null si no hay objetivo
  territory: string;
  product_sku: string;
  product_name: string;
  tipo_objetivo: 'unidades' | 'monetario' | null;  // Tipo de objetivo
  volumen_ventas: number;
  valor_total: number;
  valor_objetivo: number | null;  // Valor del objetivo (unidades o monetario según tipo)
  cumplimiento_porcentaje: number | null;  // % de cumplimiento del objetivo
}

export interface SalesSummaryResponse {
  summary: SalesSummaryItem[];
  totals: {
    total_volumen_ventas: number;
    total_valor_total: number;
    unique_salespersons: number;
    unique_products: number;
    unique_regions: number;
  };
  filters_applied: SalesSummaryFilters;
  total_records: number;
}

export interface SalespersonSummary {
  employee_id: string;
  vendedor: string;
  region: string;
  territory: string;
  total_ventas: number;
  total_valor: number;
  productos_vendidos: Array<{
    product_sku: string;
    product_name: string;
    cantidad: number;
    valor: number;
  }>;
}

export interface SalesBySalespersonResponse {
  salespersons: SalespersonSummary[];
  total_salespersons: number;
  filters_applied: SalesSummaryFilters;
}

export interface ProductSummary {
  product_sku: string;
  product_name: string;
  total_cantidad: number;
  total_valor: number;
  vendedores: Array<{
    employee_id: string;
    vendedor: string;
  }>;
}

export interface SalesByProductResponse {
  products: ProductSummary[];
  total_products: number;
  filters_applied: SalesSummaryFilters;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private readonly apiUrl = '/reports';  // Usa proxy de Angular

  constructor(private http: HttpClient) {}

  getSalesSummary(filters?: SalesSummaryFilters): Observable<SalesSummaryResponse> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<SalesSummaryResponse>(`${this.apiUrl}/sales-summary`, { params });
  }

  getSalesBySalesperson(filters?: SalesSummaryFilters): Observable<SalesBySalespersonResponse> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<SalesBySalespersonResponse>(`${this.apiUrl}/sales-by-salesperson`, { params });
  }

  getSalesByProduct(filters?: SalesSummaryFilters): Observable<SalesByProductResponse> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<SalesByProductResponse>(`${this.apiUrl}/sales-by-product`, { params });
  }

  healthCheck(): Observable<{ service: string; status: string; endpoints: string[] }> {
    return this.http.get<{ service: string; status: string; endpoints: string[] }>(`${this.apiUrl}/health`);
  }
}

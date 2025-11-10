import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ProveedorRepository } from '../../../domain/repositories/proveedor.repository';
import {
  ProveedorEntity,
  CreateProveedorDto,
  UpdateProveedorDto,
  EstadoProveedor
} from '../../../domain/entities/proveedor.entity';
import { environment } from '../../../../../environments/environment';

interface SupplierApiModel {
  id: number | string;
  name: string;
  legal_name?: string;
  tax_id?: string;
  email?: string | null;
  phone?: string | null;
  is_certified?: boolean;
  certification_date?: string | null;
  certification_expiry?: string | null;
  is_active?: boolean;
  country?: string | null;
  website?: string | null;
  address_line1?: string | null;
  city?: string | null;
  state?: string | null;
  payment_terms?: string | null;
  credit_limit?: number | null;
  currency?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

@Injectable()
export class HttpProveedorRepository extends ProveedorRepository {
  private http = inject(HttpClient);
  private apiUrl = `${environment.catalogApiUrl}/suppliers`;

  getAll(): Observable<ProveedorEntity[]> {
    // request a reasonably large page to approximate "all" for the list view
    const params = new HttpParams().set('per_page', '100');
    return this.http.get<{ suppliers: SupplierApiModel[] }>(this.apiUrl, { params })
      .pipe(
        map(resp => (resp.suppliers || ([] as SupplierApiModel[])).map(s => this.mapFromApi(s))),
        catchError(this.handleError)
      );
  }

  getById(id: string): Observable<ProveedorEntity | null> {
    return this.http.get<SupplierApiModel>(`${this.apiUrl}/${id}`)
      .pipe(
        map(s => this.mapFromApi(s)),
        catchError(err => {
          if (err.status === 404) return throwError(() => new Error('Proveedor no encontrado'));
          return this.handleError(err);
        })
      );
  }

  search(criteria: string): Observable<ProveedorEntity[]> {
    const params = new HttpParams().set('search', criteria).set('per_page', '100');
    return this.http.get<{ suppliers: SupplierApiModel[] }>(this.apiUrl, { params })
      .pipe(
        map(resp => (resp.suppliers || []).map(s => this.mapFromApi(s))),
        catchError(this.handleError)
      );
  }

  create(dto: CreateProveedorDto): Observable<ProveedorEntity> {
    const payload = this.mapToApiCreate(dto);
    return this.http.post<SupplierApiModel>(this.apiUrl, payload)
      .pipe(
        map(s => this.mapFromApi(s)),
        catchError(this.handleError)
      );
  }

  update(dto: UpdateProveedorDto): Observable<ProveedorEntity> {
    const id = dto.id;
    const payload: any = this.mapToApiUpdate(dto);
    return this.http.put<SupplierApiModel>(`${this.apiUrl}/${id}`, payload)
      .pipe(
        map(s => this.mapFromApi(s)),
        catchError(this.handleError)
      );
  }

  delete(id: string): Observable<boolean> {
    return this.http.delete<{ message?: string; deleted_supplier?: SupplierApiModel }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(() => true),
        catchError(err => {
          if (err.status === 404) return throwError(() => new Error('Proveedor no encontrado'));
          return this.handleError(err);
        })
      );
  }

  filterByEstado(estado: string): Observable<ProveedorEntity[]> {
    const isActive = estado === EstadoProveedor.ACTIVO;
    const params = new HttpParams().set('is_active', String(isActive)).set('per_page', '100');
    return this.http.get<{ suppliers: SupplierApiModel[] }>(this.apiUrl, { params })
      .pipe(
        map(resp => (resp.suppliers || []).map(s => this.mapFromApi(s))),
        catchError(this.handleError)
      );
  }

  private mapFromApi(s: SupplierApiModel): ProveedorEntity {
    const estado = s.is_active ? EstadoProveedor.ACTIVO : EstadoProveedor.INACTIVO;
    const certificaciones = s.is_certified ? ['CERTIFICADO'] : [];

    return {
      id: String(s.id),
      razonSocial: s.name || s.legal_name || 'Sin nombre',
      ruc: s.tax_id || '',
      telefono: s.phone || '',
      correoContacto: s.email || '',
      country: s.country || undefined,
      website: s.website || undefined,
      addressLine1: s.address_line1 || undefined,
      city: s.city || undefined,
      state: s.state || undefined,
      paymentTerms: s.payment_terms || undefined,
      creditLimit: (s.credit_limit !== null && s.credit_limit !== undefined) ? Number(s.credit_limit) : undefined,
      currency: s.currency || undefined,
      estado,
      certificacionesVigentes: certificaciones,
      fechaRegistro: s['created_at'] ? new Date(s['created_at']) : undefined,
      fechaActualizacion: s['updated_at'] ? new Date(s['updated_at']) : undefined
    } as ProveedorEntity;
  }

  private mapToApiCreate(dto: CreateProveedorDto): any {
    return {
      name: dto.razonSocial,
      legal_name: dto.razonSocial,
      tax_id: dto.ruc,
      email: dto.correoContacto,
      phone: dto.telefono,
      is_active: dto.estado === EstadoProveedor.ACTIVO,
      is_certified: (dto.certificacionesVigentes || []).length > 0,
      country: dto.country || 'Colombia',
      website: dto.website || null,
      address_line1: dto.addressLine1 || null,
      city: dto.city || null,
      state: dto.state || null,
      payment_terms: dto.paymentTerms || null,
      credit_limit: dto.creditLimit ?? null,
      currency: dto.currency || null
    };
  }

  private mapToApiUpdate(dto: UpdateProveedorDto): any {
    const payload: any = {};
    if (dto.razonSocial !== undefined) payload.name = dto.razonSocial;
    if (dto.ruc !== undefined) payload.tax_id = dto.ruc;
    if (dto.correoContacto !== undefined) payload.email = dto.correoContacto;
    if (dto.telefono !== undefined) payload.phone = dto.telefono;
    if (dto.estado !== undefined) payload.is_active = dto.estado === EstadoProveedor.ACTIVO;
    if (dto.certificacionesVigentes !== undefined) payload.is_certified = dto.certificacionesVigentes.length > 0;
    if ((dto as any).country !== undefined) payload.country = (dto as any).country;
    if ((dto as any).website !== undefined) payload.website = (dto as any).website;
    if ((dto as any).addressLine1 !== undefined) payload.address_line1 = (dto as any).addressLine1;
    if ((dto as any).city !== undefined) payload.city = (dto as any).city;
    if ((dto as any).state !== undefined) payload.state = (dto as any).state;
    if ((dto as any).paymentTerms !== undefined) payload.payment_terms = (dto as any).paymentTerms;
    if ((dto as any).creditLimit !== undefined) payload.credit_limit = (dto as any).creditLimit;
    if ((dto as any).currency !== undefined) payload.currency = (dto as any).currency;
    return payload;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = error.error?.error || 'Datos inválidos';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 500:
          errorMessage = 'Error del servidor. Intente más tarde.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.error?.error || error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}

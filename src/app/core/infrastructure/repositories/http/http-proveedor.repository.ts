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
  website?: string | null;
  is_certified?: boolean;
  certification_date?: string | null;
  certification_expiry?: string | null;
  is_active?: boolean;
  payment_terms?: string | null;
  credit_limit?: number | null;
  currency?: string | null;
  country?: string | null;  // ✅ AGREGADO: country a nivel raíz también
  created_at?: string | null;
  updated_at?: string | null;
  address?: {
    country?: string | null;
    line1?: string | null;  // El backend usa 'line1', no 'address_line1'
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
  } | null;
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
        map(resp => {
          console.log('[HttpProveedorRepository] API response:', JSON.stringify(resp, null, 2));
          const mapped = (resp.suppliers || ([] as SupplierApiModel[])).map(s => this.mapFromApi(s));
          console.log('[HttpProveedorRepository] Mapped entities:', JSON.stringify(mapped, null, 2));
          return mapped;
        }),
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

    console.log('[HttpProveedorRepository] mapFromApi - raw supplier:', JSON.stringify(s, null, 2));
    console.log('[HttpProveedorRepository] mapFromApi - address object:', s.address);
    console.log('[HttpProveedorRepository] mapFromApi - line1 value:', s.address?.line1);
    console.log('[HttpProveedorRepository] mapFromApi - full address object keys:', s.address ? Object.keys(s.address) : 'no address');

    const mapped = {
      id: String(s.id),
      razonSocial: s.name || s.legal_name || 'Sin nombre',
      ruc: s.tax_id || '',
      telefono: s.phone || '',
      correoContacto: s.email || '',
      country: s.address?.country || s.country || '',  // ✅ Revisar tanto en address como a nivel raíz
      website: s.website || '',
      addressLine1: s.address?.line1 || '',
      city: s.address?.city || '',
      state: s.address?.state || '',
      paymentTerms: s.payment_terms || '',
      creditLimit: (s.credit_limit !== null && s.credit_limit !== undefined) ? Number(s.credit_limit) : undefined,
      currency: s.currency || '',
      estado,
      certificacionesVigentes: certificaciones,
      fechaRegistro: s['created_at'] ? new Date(s['created_at']) : undefined,
      fechaActualizacion: s['updated_at'] ? new Date(s['updated_at']) : undefined
    } as ProveedorEntity;

    console.log('[HttpProveedorRepository] mapFromApi - mapped entity:', JSON.stringify(mapped, null, 2));
    return mapped;
  }

  private mapToApiCreate(dto: CreateProveedorDto): any {
    console.log('[HttpProveedorRepository] mapToApiCreate - input DTO:', dto);
    console.log('[HttpProveedorRepository] mapToApiCreate - address fields from DTO:', {
      addressLine1: dto.addressLine1,
      city: dto.city,
      state: dto.state,
      country: dto.country
    });

    // El address es requerido y country es requerido dentro de address
    const address: any = {
      country: dto.country || 'Colombia'  // Default a Colombia si no se especifica
    };

    // Incluir todos los campos de dirección, incluso si están vacíos
    address.line1 = dto.addressLine1 || null;
    address.city = dto.city || null;
    address.state = dto.state || null;

    console.log('[HttpProveedorRepository] mapToApiCreate - address object being sent:', address);

    const payload = {
      name: dto.razonSocial,
      legal_name: dto.razonSocial,
      tax_id: dto.ruc,
      email: dto.correoContacto,
      phone: dto.telefono,
      is_active: dto.estado === EstadoProveedor.ACTIVO,
      is_certified: (dto.certificacionesVigentes || []).length > 0,
      website: dto.website || null,
      payment_terms: dto.paymentTerms || null,
      credit_limit: dto.creditLimit ?? null,
      currency: dto.currency || null,
      country: dto.country || 'Colombia',  // ✅ AGREGADO: country a nivel raíz también
      address  // Siempre incluir address
    };

    console.log('[HttpProveedorRepository] mapToApiCreate - final payload:', JSON.stringify(payload, null, 2));
    return payload;
  }

  private mapToApiUpdate(dto: UpdateProveedorDto): any {
    console.log('[HttpProveedorRepository] mapToApiUpdate - input DTO:', dto);
    console.log('[HttpProveedorRepository] mapToApiUpdate - address fields from DTO:', {
      addressLine1: (dto as any).addressLine1,
      city: (dto as any).city,
      state: (dto as any).state,
      country: (dto as any).country
    });

    const payload: any = {};
    if (dto.razonSocial !== undefined) payload.name = dto.razonSocial;
    if (dto.ruc !== undefined) payload.tax_id = dto.ruc;
    if (dto.correoContacto !== undefined) payload.email = dto.correoContacto;
    if (dto.telefono !== undefined) payload.phone = dto.telefono;
    if (dto.estado !== undefined) payload.is_active = dto.estado === EstadoProveedor.ACTIVO;
    if (dto.certificacionesVigentes !== undefined) payload.is_certified = dto.certificacionesVigentes.length > 0;
    if ((dto as any).website !== undefined) payload.website = (dto as any).website;
    if ((dto as any).paymentTerms !== undefined) payload.payment_terms = (dto as any).paymentTerms;
    if ((dto as any).creditLimit !== undefined) payload.credit_limit = (dto as any).creditLimit;
    if ((dto as any).currency !== undefined) payload.currency = (dto as any).currency;

    // ✅ AGREGADO: country a nivel raíz también
    if ((dto as any).country !== undefined) payload.country = (dto as any).country;

    // Handle address fields in nested structure - incluir siempre address completo
    const address: any = {};

    // Siempre incluir country (requerido)
    address.country = (dto as any).country !== undefined ? (dto as any).country : 'Colombia';

    // Incluir otros campos de dirección incluso si están vacíos
    if ((dto as any).addressLine1 !== undefined) address.line1 = (dto as any).addressLine1 || null;
    if ((dto as any).city !== undefined) address.city = (dto as any).city || null;
    if ((dto as any).state !== undefined) address.state = (dto as any).state || null;

    console.log('[HttpProveedorRepository] mapToApiUpdate - address object being sent:', address);

    // Siempre incluir address
    payload.address = address;

    console.log('[HttpProveedorRepository] mapToApiUpdate - final payload:', JSON.stringify(payload, null, 2));
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

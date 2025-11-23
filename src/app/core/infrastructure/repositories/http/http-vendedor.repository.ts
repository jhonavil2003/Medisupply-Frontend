import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { VendedorRepository, VendedorFilters } from '../../../domain/repositories/vendedor.repository';
import {
  VendedorEntity,
  CreateVendedorDto,
  UpdateVendedorDto
} from '../../../domain/entities/vendedor.entity';
import {environment} from "../../../../../environments/environment";

/**
 * Formato de respuesta del backend
 */
interface BackendVendedor {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  territory?: string;
  hire_date?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Formato de creación para el backend
 */
interface BackendCreateVendedor {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  territory?: string;
  hire_date?: string;
  is_active?: boolean;
}

/**
 * Formato de actualización para el backend
 */
interface BackendUpdateVendedor {
  employee_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  territory?: string;
  hire_date?: string;
  is_active?: boolean;
}

/**
 * Respuesta del backend para CREATE
 */
interface BackendCreateResponse {
  message: string;
  salesperson: BackendVendedor;
}

/**
 * Respuesta del backend para UPDATE
 */
interface BackendUpdateResponse {
  message: string;
  salesperson: BackendVendedor;
}

/**
 * Respuesta del backend para GET ALL
 */
interface BackendListResponse {
  salespersons: BackendVendedor[];
  total: number;
}

/**
 * Respuesta del backend para GET BY TERRITORY
 */
interface BackendTerritoryResponse {
  territory: string;
  salespersons: BackendVendedor[];
  total: number;
}

/**
 * Implementación HTTP del repositorio de Vendedores
 */
@Injectable({ providedIn: 'root' })
export class HttpVendedorRepository extends VendedorRepository {
  private readonly http = inject(HttpClient);
  // Usar proxy para evitar problemas de CORS
  private readonly baseUrl = `${environment.salesApiUrl}/salespersons`;

  /**
   * Mapea de backend a entidad de dominio
   */
  private mapToEntity(backend: BackendVendedor): VendedorEntity {
    return {
      id: backend.id,
      employeeId: backend.employee_id,
      firstName: backend.first_name,
      lastName: backend.last_name,
      email: backend.email,
      phone: backend.phone,
      territory: backend.territory,
      hireDate: backend.hire_date,
      isActive: backend.is_active,
      createdAt: backend.created_at,
      updatedAt: backend.updated_at
    };
  }

  /**
   * Mapea de DTO de creación a formato backend
   */
  private mapCreateToBackend(dto: CreateVendedorDto): BackendCreateVendedor {
    return {
      employee_id: dto.employeeId,
      first_name: dto.firstName,
      last_name: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      territory: dto.territory,
      hire_date: dto.hireDate,
      is_active: dto.isActive ?? true
    };
  }

  /**
   * Mapea de DTO de actualización a formato backend
   */
  private mapUpdateToBackend(dto: UpdateVendedorDto): BackendUpdateVendedor {
    const update: BackendUpdateVendedor = {};

    if (dto.employeeId !== undefined) update.employee_id = dto.employeeId;
    if (dto.firstName !== undefined) update.first_name = dto.firstName;
    if (dto.lastName !== undefined) update.last_name = dto.lastName;
    if (dto.email !== undefined) update.email = dto.email;
    if (dto.phone !== undefined) update.phone = dto.phone;
    if (dto.territory !== undefined) update.territory = dto.territory;
    if (dto.hireDate !== undefined) update.hire_date = dto.hireDate;
    if (dto.isActive !== undefined) update.is_active = dto.isActive;

    return update;
  }

  /**
   * Obtiene todos los vendedores con filtros opcionales
   */
  getAll(filters?: VendedorFilters): Observable<VendedorEntity[]> {
    let params = new HttpParams();

    if (filters?.territory) {
      params = params.set('territory', filters.territory);
    }
    if (filters?.isActive !== undefined) {
      params = params.set('is_active', filters.isActive.toString());
    }

    console.log('🌐 HTTP Request: GET', `${this.baseUrl}/`, { params: params.toString() });

    return this.http.get<BackendListResponse>(`${this.baseUrl}/`, { params }).pipe(
      map(response => {
        console.log('📦 Backend Response (raw):', response);
        console.log('📦 Type of response:', typeof response);
        console.log('📦 Has salespersons?:', 'salespersons' in response);

        if (!response || !response.salespersons) {
          console.error('⚠️ Respuesta inválida del backend:', response);
          throw new Error('Respuesta inválida del backend: falta el campo salespersons');
        }

        const vendedores = response.salespersons.map(v => this.mapToEntity(v));
        console.log('🔄 Mapped Vendedores:', vendedores);
        return vendedores;
      }),
      catchError(error => {
        console.error('❌ HTTP Error en getAll:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error statusText:', error.statusText);
        console.error('❌ Error url:', error.url);
        console.error('❌ Error full object:', JSON.stringify(error, null, 2));
        throw error;
      })
    );
  }

  /**
   * Obtiene un vendedor por ID
   */
  getById(id: number): Observable<VendedorEntity | null> {
    return this.http.get<BackendVendedor>(`${this.baseUrl}/${id}`).pipe(
      map(vendedor => this.mapToEntity(vendedor)),
      catchError(error => {
        console.error(`Error al obtener vendedor ${id}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Obtiene un vendedor por Employee ID
   */
  getByEmployeeId(employeeId: string): Observable<VendedorEntity | null> {
    return this.http.get<BackendVendedor>(`${this.baseUrl}/employee/${employeeId}`).pipe(
      map(vendedor => this.mapToEntity(vendedor)),
      catchError(error => {
        console.error(`Error al obtener vendedor por employeeId ${employeeId}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Busca vendedores por criterio general
   * Nota: El backend no tiene un endpoint de búsqueda general,
   * por lo que filtramos localmente después de obtener todos
   */
  search(criteria: string): Observable<VendedorEntity[]> {
    return this.getAll().pipe(
      map(vendedores => {
        const lowerCriteria = criteria.toLowerCase();
        return vendedores.filter(v =>
          v.firstName.toLowerCase().includes(lowerCriteria) ||
          v.lastName.toLowerCase().includes(lowerCriteria) ||
          v.employeeId.toLowerCase().includes(lowerCriteria) ||
          v.email.toLowerCase().includes(lowerCriteria) ||
          (v.territory && v.territory.toLowerCase().includes(lowerCriteria)) ||
          (v.phone && v.phone.includes(lowerCriteria))
        );
      })
    );
  }

  /**
   * Crea un nuevo vendedor
   */
  create(vendedor: CreateVendedorDto): Observable<VendedorEntity> {
    const backendDto = this.mapCreateToBackend(vendedor);

    return this.http.post<BackendCreateResponse>(`${this.baseUrl}/`, backendDto).pipe(
      map(response => this.mapToEntity(response.salesperson)),
      catchError(error => {
        console.error('Error al crear vendedor:', error);
        throw error;
      })
    );
  }

  /**
   * Actualiza un vendedor existente
   */
  update(vendedor: UpdateVendedorDto): Observable<VendedorEntity> {
    const backendDto = this.mapUpdateToBackend(vendedor);

    return this.http.put<BackendUpdateResponse>(`${this.baseUrl}/${vendedor.id}`, backendDto).pipe(
      map(response => this.mapToEntity(response.salesperson)),
      catchError(error => {
        console.error(`Error al actualizar vendedor ${vendedor.id}:`, error);
        throw error;
      })
    );
  }

  /**
   * Elimina un vendedor por ID
   */
  delete(id: number): Observable<boolean> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error al eliminar vendedor ${id}:`, error);
        return of(false);
      })
    );
  }

  /**
   * Filtra vendedores por territorio
   */
  filterByTerritory(territory: string): Observable<VendedorEntity[]> {
    return this.http.get<BackendTerritoryResponse>(`${this.baseUrl}/territory/${encodeURIComponent(territory)}`).pipe(
      map(response => response.salespersons.map(v => this.mapToEntity(v))),
      catchError(error => {
        console.error(`Error al filtrar por territorio ${territory}:`, error);
        return of([]);
      })
    );
  }
}

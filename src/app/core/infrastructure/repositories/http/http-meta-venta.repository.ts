import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { 
  MetaVentaRepository, 
  MetaVentaFilters 
} from '../../../domain/repositories/meta-venta.repository';
import { 
  MetaVentaEntity, 
  CreateMetaVentaDto, 
  UpdateMetaVentaDto,
  VendedorInfo,
  ProductoInfo,
  Region,
  Trimestre,
  TipoMeta
} from '../../../domain/entities/meta-venta.entity';

/**
 * Formato de vendedor en backend
 */
interface BackendVendedorInfo {
  employee_id: string;
  nombre_completo: string;
  email: string;
}

/**
 * Formato de producto en backend
 */
interface BackendProductoInfo {
  sku: string;
  name?: string | null;
  description?: string | null;
  unit_price?: number | null;
  is_active?: boolean | null;
}

/**
 * Formato de meta de venta en backend
 */
interface BackendMetaVenta {
  id: number;
  id_vendedor: string;
  id_producto: string;
  region: string;
  trimestre: string;
  valor_objetivo: number;
  tipo: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  vendedor?: BackendVendedorInfo;
  producto?: BackendProductoInfo;
}

/**
 * Formato de creación para el backend
 */
interface BackendCreateMetaVenta {
  id_vendedor: string;
  id_producto: string;
  region: string;
  trimestre: string;
  valor_objetivo: number;
  tipo: string;
}

/**
 * Formato de actualización para el backend
 */
interface BackendUpdateMetaVenta {
  id_vendedor?: string;
  id_producto?: string;
  region?: string;
  trimestre?: string;
  valor_objetivo?: number;
  tipo?: string;
}

/**
 * Respuesta del backend para CREATE
 */
interface BackendCreateResponse {
  message: string;
  salesperson_goal?: BackendMetaVenta;
  goal?: BackendMetaVenta;
}

/**
 * Respuesta del backend para UPDATE
 */
interface BackendUpdateResponse {
  message: string;
  salesperson_goal?: BackendMetaVenta;
  goal?: BackendMetaVenta;
}

/**
 * Respuesta del backend para GET ALL
 */
interface BackendListResponse {
  salesperson_goals?: BackendMetaVenta[];
  goals?: BackendMetaVenta[];
  total: number;
}

/**
 * Respuesta del backend para GET BY VENDEDOR
 */
interface BackendVendedorResponse {
  vendedor_id?: string;
  employee_id?: string;
  salesperson_goals?: BackendMetaVenta[];
  goals?: BackendMetaVenta[];
  total?: number;
}

/**
 * Respuesta del backend para GET BY PRODUCTO
 */
interface BackendProductoResponse {
  producto_sku?: string;
  product_sku?: string;
  salesperson_goals?: BackendMetaVenta[];
  goals?: BackendMetaVenta[];
  total?: number;
}

/**
 * Implementación HTTP del repositorio de Metas de Venta
 */
@Injectable({ providedIn: 'root' })
export class HttpMetaVentaRepository extends MetaVentaRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.salesApiUrl}/salesperson-goals`;

  /**
   * Mapea vendedor info de backend a dominio
   */
  private mapVendedorInfo(backend?: BackendVendedorInfo): VendedorInfo | undefined {
    if (!backend) return undefined;
    return {
      employeeId: backend.employee_id,
      nombreCompleto: backend.nombre_completo,
      email: backend.email
    };
  }

  /**
   * Mapea producto info de backend a dominio
   */
  private mapProductoInfo(backend?: BackendProductoInfo): ProductoInfo | undefined {
    if (!backend) return undefined;
    return {
      sku: backend.sku,
      name: backend.name ?? null,
      description: backend.description ?? null,
      unitPrice: backend.unit_price ?? null,
      isActive: backend.is_active ?? null
    };
  }

  /**
   * Mapea region de backend (string) a dominio (enum)
   */
  private mapRegion(backendRegion: string): Region {
    const regionMap: Record<string, Region> = {
      'Norte': Region.NORTE,
      'Sur': Region.SUR,
      'Oeste': Region.OESTE,
      'Este': Region.ESTE
    };
    return regionMap[backendRegion] || Region.NORTE;
  }

  /**
   * Mapea region de dominio (enum) a backend (string)
   */
  private mapRegionToBackend(region: Region): string {
    const regionMap: Record<Region, string> = {
      [Region.NORTE]: 'Norte',
      [Region.SUR]: 'Sur',
      [Region.OESTE]: 'Oeste',
      [Region.ESTE]: 'Este'
    };
    return regionMap[region];
  }

  /**
   * Mapea trimestre de backend (string) a dominio (enum)
   */
  private mapTrimestre(backendTrimestre: string): Trimestre {
    const trimestreMap: Record<string, Trimestre> = {
      'Q1': Trimestre.Q1,
      'Q2': Trimestre.Q2,
      'Q3': Trimestre.Q3,
      'Q4': Trimestre.Q4
    };
    return trimestreMap[backendTrimestre] || Trimestre.Q1;
  }

  /**
   * Mapea trimestre de dominio (enum) a backend (string)
   */
  private mapTrimestreToBackend(trimestre: Trimestre): string {
    return trimestre; // Q1, Q2, Q3, Q4 son iguales
  }

  /**
   * Mapea tipo de backend (string) a dominio (enum)
   */
  private mapTipo(backendTipo: string): TipoMeta {
    const tipoMap: Record<string, TipoMeta> = {
      'unidades': TipoMeta.UNIDADES,
      'monetario': TipoMeta.MONETARIO
    };
    return tipoMap[backendTipo] || TipoMeta.UNIDADES;
  }

  /**
   * Mapea tipo de dominio (enum) a backend (string)
   */
  private mapTipoToBackend(tipo: TipoMeta): string {
    const tipoMap: Record<TipoMeta, string> = {
      [TipoMeta.UNIDADES]: 'unidades',
      [TipoMeta.MONETARIO]: 'monetario'
    };
    return tipoMap[tipo];
  }

  /**
   * Mapea de backend a entidad de dominio
   */
  private mapToEntity(backend: BackendMetaVenta): MetaVentaEntity {
    return {
      id: backend.id,
      idVendedor: backend.id_vendedor,
      idProducto: backend.id_producto,
      region: this.mapRegion(backend.region),
      trimestre: this.mapTrimestre(backend.trimestre),
      valorObjetivo: backend.valor_objetivo,
      tipo: this.mapTipo(backend.tipo),
      fechaCreacion: backend.fecha_creacion,
      fechaActualizacion: backend.fecha_actualizacion,
      vendedor: this.mapVendedorInfo(backend.vendedor),
      producto: this.mapProductoInfo(backend.producto)
    };
  }

  /**
   * Mapea de DTO de creación a formato backend
   */
  private mapCreateToBackend(dto: CreateMetaVentaDto): BackendCreateMetaVenta {
    return {
      id_vendedor: dto.idVendedor,
      id_producto: dto.idProducto,
      region: this.mapRegionToBackend(dto.region),
      trimestre: this.mapTrimestreToBackend(dto.trimestre),
      valor_objetivo: dto.valorObjetivo,
      tipo: this.mapTipoToBackend(dto.tipo)
    };
  }

  /**
   * Mapea de DTO de actualización a formato backend
   */
  private mapUpdateToBackend(dto: UpdateMetaVentaDto): BackendUpdateMetaVenta {
    const update: BackendUpdateMetaVenta = {};
    
    if (dto.idVendedor !== undefined) update.id_vendedor = dto.idVendedor;
    if (dto.idProducto !== undefined) update.id_producto = dto.idProducto;
    if (dto.region !== undefined) update.region = this.mapRegionToBackend(dto.region);
    if (dto.trimestre !== undefined) update.trimestre = this.mapTrimestreToBackend(dto.trimestre);
    if (dto.valorObjetivo !== undefined) update.valor_objetivo = dto.valorObjetivo;
    if (dto.tipo !== undefined) update.tipo = this.mapTipoToBackend(dto.tipo);
    
    return update;
  }

  /**
   * Construye los parámetros HTTP para los filtros
   */
  private buildFilterParams(filters?: MetaVentaFilters): HttpParams {
    let params = new HttpParams();
    
    if (filters?.region) {
      params = params.set('region', this.mapRegionToBackend(filters.region));
    }
    if (filters?.trimestre) {
      params = params.set('trimestre', this.mapTrimestreToBackend(filters.trimestre));
    }
    if (filters?.tipo) {
      params = params.set('tipo', filters.tipo);
    }
    
    return params;
  }

  /**
   * Obtiene todas las metas con filtros opcionales
   */
  getAll(filters?: MetaVentaFilters): Observable<MetaVentaEntity[]> {
    const params = this.buildFilterParams(filters);

    console.log('🌐 HTTP Request: GET', `${this.baseUrl}/`, { params: params.toString() });
    
    return this.http.get<BackendListResponse | BackendMetaVenta[]>(`${this.baseUrl}/`, { params }).pipe(
      map(response => {
        console.log('📦 Backend Response (raw):', response);
        
        let metasArray: BackendMetaVenta[];
        
        // Si es un array directamente
        if (Array.isArray(response)) {
          metasArray = response;
        }
        // Si es un objeto con la propiedad 'goals'
        else if (response && typeof response === 'object' && 'goals' in response) {
          metasArray = response.goals!;
        }
        // Si es un objeto con la propiedad 'salesperson_goals' (backward compatibility)
        else if (response && typeof response === 'object' && 'salesperson_goals' in response) {
          metasArray = response.salesperson_goals!;
        }
        // Formato no reconocido
        else {
          console.error('⚠️ Respuesta inválida del backend:', response);
          throw new Error('Respuesta inválida del backend: formato no reconocido');
        }
        
        const metas = metasArray.map(m => this.mapToEntity(m));
        console.log('✅ Mapped', metas.length, 'metas');
        return metas;
      }),
      catchError(error => {
        console.error('❌ HTTP Error en getAll:', error);
        throw error;
      })
    );
  }

  /**
   * Obtiene una meta por ID
   */
  getById(id: number): Observable<MetaVentaEntity | null> {
    return this.http.get<BackendMetaVenta>(`${this.baseUrl}/${id}`).pipe(
      map(meta => this.mapToEntity(meta)),
      catchError(error => {
        console.error(`Error al obtener meta ${id}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Crea una nueva meta
   */
  create(meta: CreateMetaVentaDto): Observable<MetaVentaEntity> {
    const backendDto = this.mapCreateToBackend(meta);
    
    console.log('🌐 HTTP Request: POST /salesperson-goals/', backendDto);
    
    return this.http.post<BackendCreateResponse>(`${this.baseUrl}/`, backendDto).pipe(
      map(response => {
        console.log('📦 Backend Response (create):', response);
        
        // El backend puede devolver 'goal' o 'salesperson_goal'
        const backendMeta = response.goal || response.salesperson_goal;
        
        if (!backendMeta) {
          console.error('⚠️ Respuesta sin meta:', response);
          throw new Error('Respuesta inválida del backend: no se encontró la meta creada');
        }
        
        return this.mapToEntity(backendMeta);
      }),
      catchError(error => {
        console.error('❌ Error al crear meta:', error);
        
        // Extraer mensaje de error del backend
        if (error.error) {
          const backendError = error.error;
          
          // Si el backend devuelve un mensaje de error específico
          if (backendError.error) {
            const errorMsg = backendError.error;
            
            // Personalizar mensajes comunes
            if (errorMsg.includes('not found') || errorMsg.includes('does not exist')) {
              if (errorMsg.toLowerCase().includes('salesperson') || errorMsg.toLowerCase().includes('vendedor')) {
                error.userMessage = 'El ID de vendedor ingresado no existe en el sistema';
              } else if (errorMsg.toLowerCase().includes('product') || errorMsg.toLowerCase().includes('producto')) {
                error.userMessage = 'El SKU de producto ingresado no existe en el sistema';
              } else {
                error.userMessage = 'Vendedor o producto no encontrado';
              }
            } else if (errorMsg.includes('already exists') || errorMsg.includes('duplicate') || errorMsg.includes('unique constraint')) {
              error.userMessage = 'Ya existe una meta para esta combinación de vendedor, producto, región y trimestre';
            } else {
              error.userMessage = errorMsg;
            }
          } else if (backendError.message) {
            error.userMessage = backendError.message;
          } else if (typeof backendError === 'string') {
            error.userMessage = backendError;
          }
        }
        
        throw error;
      })
    );
  }

  /**
   * Actualiza una meta existente
   */
  update(meta: UpdateMetaVentaDto): Observable<MetaVentaEntity> {
    const backendDto = this.mapUpdateToBackend(meta);
    
    console.log(`🌐 HTTP Request: PUT /salesperson-goals/${meta.id}`, backendDto);
    
    return this.http.put<BackendUpdateResponse>(`${this.baseUrl}/${meta.id}`, backendDto).pipe(
      map(response => {
        console.log('📦 Backend Response (update):', response);
        
        // El backend puede devolver 'goal' o 'salesperson_goal'
        const backendMeta = response.goal || response.salesperson_goal;
        
        if (!backendMeta) {
          console.error('⚠️ Respuesta sin meta:', response);
          throw new Error('Respuesta inválida del backend: no se encontró la meta actualizada');
        }
        
        return this.mapToEntity(backendMeta);
      }),
      catchError(error => {
        console.error(`❌ Error al actualizar meta ${meta.id}:`, error);
        
        // Extraer mensaje de error del backend
        if (error.error) {
          const backendError = error.error;
          
          // Si el backend devuelve un mensaje de error específico
          if (backendError.error) {
            const errorMsg = backendError.error;
            
            // Personalizar mensajes comunes
            if (errorMsg.includes('not found') || errorMsg.includes('does not exist')) {
              if (errorMsg.toLowerCase().includes('salesperson') || errorMsg.toLowerCase().includes('vendedor')) {
                error.userMessage = 'El ID de vendedor ingresado no existe en el sistema';
              } else if (errorMsg.toLowerCase().includes('product') || errorMsg.toLowerCase().includes('producto')) {
                error.userMessage = 'El SKU de producto ingresado no existe en el sistema';
              } else if (errorMsg.toLowerCase().includes('goal') || errorMsg.toLowerCase().includes('meta')) {
                error.userMessage = 'La meta que intenta actualizar no existe';
              } else {
                error.userMessage = 'Meta, vendedor o producto no encontrado';
              }
            } else if (errorMsg.includes('already exists') || errorMsg.includes('duplicate') || errorMsg.includes('unique constraint')) {
              error.userMessage = 'Ya existe una meta para esta combinación de vendedor, producto, región y trimestre';
            } else {
              error.userMessage = errorMsg;
            }
          } else if (backendError.message) {
            error.userMessage = backendError.message;
          } else if (typeof backendError === 'string') {
            error.userMessage = backendError;
          }
        }
        
        throw error;
      })
    );
  }

  /**
   * Elimina una meta por ID
   */
  delete(id: number): Observable<boolean> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error al eliminar meta ${id}:`, error);
        return of(false);
      })
    );
  }

  /**
   * Obtiene metas por vendedor con filtros opcionales
   */
  getByVendedor(employeeId: string, filters?: MetaVentaFilters): Observable<MetaVentaEntity[]> {
    const params = this.buildFilterParams(filters);
    
    console.log(`🌐 HTTP Request: GET /salesperson-goals/vendedor/${employeeId}`);
    
    return this.http.get<BackendVendedorResponse>(`${this.baseUrl}/vendedor/${encodeURIComponent(employeeId)}`, { params }).pipe(
      map(response => {
        console.log('📦 Backend Response (getByVendedor):', response);
        
        // El backend puede devolver 'goals' o 'salesperson_goals'
        const metasArray = response.goals || response.salesperson_goals || [];
        
        return metasArray.map(m => this.mapToEntity(m));
      }),
      catchError(error => {
        console.error(`❌ Error al obtener metas por vendedor ${employeeId}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene metas por producto con filtros opcionales
   */
  getByProducto(productSku: string, filters?: MetaVentaFilters): Observable<MetaVentaEntity[]> {
    const params = this.buildFilterParams(filters);
    
    console.log(`🌐 HTTP Request: GET /salesperson-goals/producto/${productSku}`);
    
    return this.http.get<BackendProductoResponse>(`${this.baseUrl}/producto/${encodeURIComponent(productSku)}`, { params }).pipe(
      map(response => {
        console.log('📦 Backend Response (getByProducto):', response);
        
        // El backend puede devolver 'goals' o 'salesperson_goals'
        const metasArray = response.goals || response.salesperson_goals || [];
        
        return metasArray.map(m => this.mapToEntity(m));
      }),
      catchError(error => {
        console.error(`❌ Error al obtener metas por producto ${productSku}:`, error);
        return of([]);
      })
    );
  }
}

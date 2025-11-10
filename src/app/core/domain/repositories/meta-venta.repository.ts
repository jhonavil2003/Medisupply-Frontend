import { Observable } from 'rxjs';
import { 
  MetaVentaEntity, 
  CreateMetaVentaDto, 
  UpdateMetaVentaDto,
  Region,
  Trimestre
} from '../entities/meta-venta.entity';

/**
 * Filtros opcionales para consultar metas de venta
 */
export interface MetaVentaFilters {
  region?: Region;
  trimestre?: Trimestre;
  tipo?: 'unidades' | 'monetario';
}

/**
 * Contrato del repositorio de Metas de Venta
 */
export abstract class MetaVentaRepository {
  /**
   * Obtiene todas las metas con filtros opcionales
   */
  abstract getAll(filters?: MetaVentaFilters): Observable<MetaVentaEntity[]>;

  /**
   * Obtiene una meta por ID
   */
  abstract getById(id: number): Observable<MetaVentaEntity | null>;

  /**
   * Crea una nueva meta
   */
  abstract create(meta: CreateMetaVentaDto): Observable<MetaVentaEntity>;

  /**
   * Actualiza una meta existente
   */
  abstract update(meta: UpdateMetaVentaDto): Observable<MetaVentaEntity>;

  /**
   * Elimina una meta por ID
   */
  abstract delete(id: number): Observable<boolean>;

  /**
   * Obtiene metas por vendedor con filtros opcionales
   */
  abstract getByVendedor(employeeId: string, filters?: MetaVentaFilters): Observable<MetaVentaEntity[]>;

  /**
   * Obtiene metas por producto con filtros opcionales
   */
  abstract getByProducto(productSku: string, filters?: MetaVentaFilters): Observable<MetaVentaEntity[]>;
}

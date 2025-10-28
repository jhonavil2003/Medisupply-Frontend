import { Observable } from 'rxjs';
import { 
  MetaVentaEntity, 
  CreateMetaVentaDto, 
  UpdateMetaVentaDto,
  ComparacionMetaResultado 
} from '../entities/meta-venta.entity';

/**
 * Contrato del repositorio de Metas de Venta
 */
export abstract class MetaVentaRepository {
  /**
   * Obtiene todas las metas
   */
  abstract getAll(): Observable<MetaVentaEntity[]>;

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
   * Filtra metas por producto
   */
  abstract filterByProducto(producto: string): Observable<MetaVentaEntity[]>;

  /**
   * Filtra metas por región
   */
  abstract filterByRegion(region: string): Observable<MetaVentaEntity[]>;

  /**
   * Filtra metas por trimestre
   */
  abstract filterByTrimestre(trimestre: string): Observable<MetaVentaEntity[]>;

  /**
   * Compara meta con resultado real
   */
  abstract compararResultados(metaId: number, resultado: number): Observable<ComparacionMetaResultado>;
}

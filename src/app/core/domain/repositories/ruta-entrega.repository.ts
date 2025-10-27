import { Observable } from 'rxjs';
import { 
  RutaEntregaEntity, 
  CreateRutaEntregaDto, 
  UpdateRutaEntregaDto,
  EstadoRuta 
} from '../entities/ruta-entrega.entity';

/**
 * Contrato del repositorio de Rutas de Entrega
 */
export abstract class RutaEntregaRepository {
  /**
   * Obtiene todas las rutas
   */
  abstract getAll(): Observable<RutaEntregaEntity[]>;

  /**
   * Obtiene una ruta por ID
   */
  abstract getById(id: string): Observable<RutaEntregaEntity | null>;

  /**
   * Crea una nueva ruta
   */
  abstract create(ruta: CreateRutaEntregaDto): Observable<RutaEntregaEntity>;

  /**
   * Actualiza una ruta existente
   */
  abstract update(ruta: UpdateRutaEntregaDto): Observable<RutaEntregaEntity>;

  /**
   * Filtra rutas por estado
   */
  abstract filterByEstado(estado: EstadoRuta): Observable<RutaEntregaEntity[]>;

  /**
   * Obtiene rutas por conductor
   */
  abstract getByconductor(conductor: string): Observable<RutaEntregaEntity[]>;
}

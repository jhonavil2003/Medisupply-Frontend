import { Observable } from 'rxjs';
import { VendedorEntity, CreateVendedorDto, UpdateVendedorDto } from '../entities/vendedor.entity';

/**
 * Filtros para búsqueda de vendedores
 */
export interface VendedorFilters {
  territory?: string;
  isActive?: boolean;
}

/**
 * Contrato del repositorio de Vendedores
 */
export abstract class VendedorRepository {
  /**
   * Obtiene todos los vendedores con filtros opcionales
   */
  abstract getAll(filters?: VendedorFilters): Observable<VendedorEntity[]>;

  /**
   * Obtiene un vendedor por ID
   */
  abstract getById(id: number): Observable<VendedorEntity | null>;

  /**
   * Obtiene un vendedor por Employee ID
   */
  abstract getByEmployeeId(employeeId: string): Observable<VendedorEntity | null>;

  /**
   * Busca vendedores por criterio (búsqueda general)
   */
  abstract search(criteria: string): Observable<VendedorEntity[]>;

  /**
   * Crea un nuevo vendedor
   */
  abstract create(vendedor: CreateVendedorDto): Observable<VendedorEntity>;

  /**
   * Actualiza un vendedor existente
   */
  abstract update(vendedor: UpdateVendedorDto): Observable<VendedorEntity>;

  /**
   * Elimina un vendedor por ID
   */
  abstract delete(id: number): Observable<boolean>;

  /**
   * Filtra vendedores por territorio
   */
  abstract filterByTerritory(territory: string): Observable<VendedorEntity[]>;
}

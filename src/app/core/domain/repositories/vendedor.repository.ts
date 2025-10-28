import { Observable } from 'rxjs';
import { VendedorEntity, CreateVendedorDto, UpdateVendedorDto } from '../entities/vendedor.entity';

/**
 * Contrato del repositorio de Vendedores
 */
export abstract class VendedorRepository {
  /**
   * Obtiene todos los vendedores
   */
  abstract getAll(): Observable<VendedorEntity[]>;

  /**
   * Obtiene un vendedor por ID
   */
  abstract getById(id: string): Observable<VendedorEntity | null>;

  /**
   * Busca vendedores por criterio
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
  abstract delete(id: string): Observable<boolean>;

  /**
   * Filtra vendedores por región
   */
  abstract filterByRegion(region: string): Observable<VendedorEntity[]>;
}

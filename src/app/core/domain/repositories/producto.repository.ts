import { Observable } from 'rxjs';
import { ProductoEntity, CreateProductoDto, UpdateProductoDto } from '../entities/producto.entity';

/**
 * Contrato del repositorio de Productos
 */
export abstract class ProductoRepository {
  /**
   * Obtiene todos los productos
   */
  abstract getAll(): Observable<ProductoEntity[]>;

  /**
   * Obtiene un producto por ID
   */
  abstract getById(id: string): Observable<ProductoEntity | null>;

  /**
   * Busca productos por criterio
   */
  abstract search(criteria: string): Observable<ProductoEntity[]>;

  /**
   * Crea un nuevo producto
   */
  abstract create(producto: CreateProductoDto): Observable<ProductoEntity>;

  /**
   * Actualiza un producto existente
   */
  abstract update(producto: UpdateProductoDto): Observable<ProductoEntity>;

  /**
   * Elimina un producto por ID
   */
  abstract delete(id: string): Observable<boolean>;

  /**
   * Filtra productos por categoría
   */
  abstract filterByCategoria(categoria: string): Observable<ProductoEntity[]>;

  /**
   * Filtra productos por proveedor
   */
  abstract filterByProveedor(proveedorId: string): Observable<ProductoEntity[]>;
}

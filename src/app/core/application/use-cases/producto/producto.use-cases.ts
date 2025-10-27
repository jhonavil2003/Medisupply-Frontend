import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductoRepository } from '../../../domain/repositories/producto.repository';
import { ProductoEntity, CreateProductoDto, UpdateProductoDto } from '../../../domain/entities/producto.entity';

/**
 * Caso de uso: Obtener todos los productos
 */
@Injectable({ providedIn: 'root' })
export class GetAllProductosUseCase {
  private repository = inject(ProductoRepository);
  execute(): Observable<ProductoEntity[]> {
    return this.repository.getAll();
  }
}

/**
 * Caso de uso: Obtener producto por ID
 */
@Injectable({ providedIn: 'root' })
export class GetProductoByIdUseCase {
  private repository = inject(ProductoRepository);
  execute(id: string): Observable<ProductoEntity | null> {
    return this.repository.getById(id);
  }
}

/**
 * Caso de uso: Crear producto
 */
@Injectable({ providedIn: 'root' })
export class CreateProductoUseCase {
  private repository = inject(ProductoRepository);
  
  execute(producto: CreateProductoDto): Observable<ProductoEntity> {
    this.validateProducto(producto);
    return this.repository.create(producto);
  }

  private validateProducto(producto: CreateProductoDto): void {
    if (!producto.codigo || producto.codigo.trim().length < 3) {
      throw new Error('El código debe tener al menos 3 caracteres');
    }
    if (!producto.nombre || producto.nombre.trim().length < 3) {
      throw new Error('El nombre debe tener al menos 3 caracteres');
    }
  }
}

/**
 * Caso de uso: Actualizar producto
 */
@Injectable({ providedIn: 'root' })
export class UpdateProductoUseCase {
  private repository = inject(ProductoRepository);
  
  execute(producto: UpdateProductoDto): Observable<ProductoEntity> {
    if (!producto.id) {
      throw new Error('El ID del producto es requerido');
    }
    return this.repository.update(producto);
  }
}

/**
 * Caso de uso: Eliminar producto
 */
@Injectable({ providedIn: 'root' })
export class DeleteProductoUseCase {
  private repository = inject(ProductoRepository);
  
  execute(id: string): Observable<boolean> {
    if (!id) {
      throw new Error('El ID del producto es requerido');
    }
    return this.repository.delete(id);
  }
}

/**
 * Caso de uso: Buscar productos
 */
@Injectable({ providedIn: 'root' })
export class SearchProductosUseCase {
  private repository = inject(ProductoRepository);
  
  execute(criteria: string): Observable<ProductoEntity[]> {
    if (!criteria || criteria.trim().length === 0) {
      return this.repository.getAll();
    }
    return this.repository.search(criteria.trim());
  }
}

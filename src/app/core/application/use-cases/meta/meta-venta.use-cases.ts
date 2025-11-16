import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { 
  MetaVentaRepository, 
  MetaVentaFilters 
} from '../../../domain/repositories/meta-venta.repository';
import { 
  MetaVentaEntity, 
  CreateMetaVentaDto, 
  UpdateMetaVentaDto
} from '../../../domain/entities/meta-venta.entity';

/**
 * Casos de uso para Metas de Venta
 */

@Injectable({ providedIn: 'root' })
export class GetAllMetasUseCase {
  private repository = inject(MetaVentaRepository);
  
  execute(filters?: MetaVentaFilters): Observable<MetaVentaEntity[]> {
    return this.repository.getAll(filters);
  }
}

@Injectable({ providedIn: 'root' })
export class GetMetaByIdUseCase {
  private repository = inject(MetaVentaRepository);
  
  execute(id: number): Observable<MetaVentaEntity | null> {
    if (!id || id <= 0) {
      return throwError(() => new Error('El ID de la meta debe ser un número válido'));
    }
    return this.repository.getById(id);
  }
}

@Injectable({ providedIn: 'root' })
export class CreateMetaVentaUseCase {
  private repository = inject(MetaVentaRepository);
  
  execute(meta: CreateMetaVentaDto): Observable<MetaVentaEntity> {
    // Validaciones síncronas
    if (!meta.idVendedor || meta.idVendedor.trim().length === 0) {
      return throwError(() => new Error('El ID del vendedor es requerido'));
    }
    if (!meta.idProducto || meta.idProducto.trim().length === 0) {
      return throwError(() => new Error('El SKU del producto es requerido'));
    }
    if (!meta.region) {
      return throwError(() => new Error('La región es requerida'));
    }
    if (!meta.trimestre) {
      return throwError(() => new Error('El trimestre es requerido'));
    }
    if (!meta.valorObjetivo || meta.valorObjetivo <= 0) {
      return throwError(() => new Error('El valor objetivo debe ser mayor a 0'));
    }
    if (!meta.tipo) {
      return throwError(() => new Error('El tipo de meta es requerido'));
    }
    
    return this.repository.create(meta);
  }
}

@Injectable({ providedIn: 'root' })
export class UpdateMetaVentaUseCase {
  private repository = inject(MetaVentaRepository);
  
  execute(meta: UpdateMetaVentaDto): Observable<MetaVentaEntity> {
    if (!meta.id || meta.id <= 0) {
      return throwError(() => new Error('El ID de la meta es requerido'));
    }
    if (meta.valorObjetivo !== undefined && meta.valorObjetivo <= 0) {
      return throwError(() => new Error('El valor objetivo debe ser mayor a 0'));
    }
    if (meta.idVendedor !== undefined && meta.idVendedor.trim().length === 0) {
      return throwError(() => new Error('El ID del vendedor no puede estar vacío'));
    }
    if (meta.idProducto !== undefined && meta.idProducto.trim().length === 0) {
      return throwError(() => new Error('El SKU del producto no puede estar vacío'));
    }
    
    return this.repository.update(meta);
  }
}

@Injectable({ providedIn: 'root' })
export class DeleteMetaVentaUseCase {
  private repository = inject(MetaVentaRepository);
  
  execute(id: number): Observable<boolean> {
    if (!id || id <= 0) {
      return throwError(() => new Error('El ID de la meta es requerido'));
    }
    return this.repository.delete(id);
  }
}

@Injectable({ providedIn: 'root' })
export class GetMetasByVendedorUseCase {
  private repository = inject(MetaVentaRepository);
  
  execute(employeeId: string, filters?: MetaVentaFilters): Observable<MetaVentaEntity[]> {
    if (!employeeId || employeeId.trim().length === 0) {
      return throwError(() => new Error('El ID del vendedor es requerido'));
    }
    return this.repository.getByVendedor(employeeId, filters);
  }
}

@Injectable({ providedIn: 'root' })
export class GetMetasByProductoUseCase {
  private repository = inject(MetaVentaRepository);
  
  execute(productSku: string, filters?: MetaVentaFilters): Observable<MetaVentaEntity[]> {
    if (!productSku || productSku.trim().length === 0) {
      return throwError(() => new Error('El SKU del producto es requerido'));
    }
    return this.repository.getByProducto(productSku, filters);
  }
}

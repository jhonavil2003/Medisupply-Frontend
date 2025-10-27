import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MetaVentaRepository } from '../../../domain/repositories/meta-venta.repository';
import { 
  MetaVentaEntity, 
  CreateMetaVentaDto, 
  UpdateMetaVentaDto,
  ComparacionMetaResultado 
} from '../../../domain/entities/meta-venta.entity';

/**
 * Casos de uso para Metas de Venta
 */

@Injectable({ providedIn: 'root' })
export class GetAllMetasUseCase {
  private repository = inject(MetaVentaRepository);
  execute(): Observable<MetaVentaEntity[]> {
    return this.repository.getAll();
  }
}

@Injectable({ providedIn: 'root' })
export class GetMetaByIdUseCase {
  private repository = inject(MetaVentaRepository);
  execute(id: number): Observable<MetaVentaEntity | null> {
    return this.repository.getById(id);
  }
}

@Injectable({ providedIn: 'root' })
export class CreateMetaVentaUseCase {
  private repository = inject(MetaVentaRepository);
  
  execute(meta: CreateMetaVentaDto): Observable<MetaVentaEntity> {
    this.validateMeta(meta);
    return this.repository.create(meta);
  }

  private validateMeta(meta: CreateMetaVentaDto): void {
    if (!meta.producto || meta.producto.trim().length === 0) {
      throw new Error('El producto es requerido');
    }
    if (!meta.region || meta.region.trim().length === 0) {
      throw new Error('La región es requerida');
    }
    if (!meta.trimestre) {
      throw new Error('El trimestre es requerido');
    }
    if (meta.valorObjetivo <= 0) {
      throw new Error('El valor objetivo debe ser mayor a 0');
    }
  }
}

@Injectable({ providedIn: 'root' })
export class UpdateMetaVentaUseCase {
  private repository = inject(MetaVentaRepository);
  
  execute(meta: UpdateMetaVentaDto): Observable<MetaVentaEntity> {
    if (!meta.id) {
      throw new Error('El ID de la meta es requerido');
    }
    return this.repository.update(meta);
  }
}

@Injectable({ providedIn: 'root' })
export class DeleteMetaVentaUseCase {
  private repository = inject(MetaVentaRepository);
  
  execute(id: number): Observable<boolean> {
    if (!id) {
      throw new Error('El ID de la meta es requerido');
    }
    return this.repository.delete(id);
  }
}

@Injectable({ providedIn: 'root' })
export class CompararMetaResultadoUseCase {
  private repository = inject(MetaVentaRepository);
  
  execute(metaId: number, resultado: number): Observable<ComparacionMetaResultado> {
    if (!metaId) {
      throw new Error('El ID de la meta es requerido');
    }
    if (resultado < 0) {
      throw new Error('El resultado no puede ser negativo');
    }
    return this.repository.compararResultados(metaId, resultado);
  }
}

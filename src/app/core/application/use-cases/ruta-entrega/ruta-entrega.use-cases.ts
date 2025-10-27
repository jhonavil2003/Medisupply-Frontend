import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RutaEntregaRepository } from '../../../domain/repositories/ruta-entrega.repository';
import { 
  RutaEntregaEntity, 
  CreateRutaEntregaDto, 
  UpdateRutaEntregaDto,
  EstadoRuta 
} from '../../../domain/entities/ruta-entrega.entity';

/**
 * Casos de uso para Rutas de Entrega
 */

@Injectable({ providedIn: 'root' })
export class GetAllRutasUseCase {
  private repository = inject(RutaEntregaRepository);
  execute(): Observable<RutaEntregaEntity[]> {
    return this.repository.getAll();
  }
}

@Injectable({ providedIn: 'root' })
export class GetRutaByIdUseCase {
  private repository = inject(RutaEntregaRepository);
  execute(id: string): Observable<RutaEntregaEntity | null> {
    return this.repository.getById(id);
  }
}

@Injectable({ providedIn: 'root' })
export class CreateRutaEntregaUseCase {
  private repository = inject(RutaEntregaRepository);
  
  execute(ruta: CreateRutaEntregaDto): Observable<RutaEntregaEntity> {
    this.validateRuta(ruta);
    return this.repository.create(ruta);
  }

  private validateRuta(ruta: CreateRutaEntregaDto): void {
    if (!ruta.conductor || ruta.conductor.trim().length === 0) {
      throw new Error('El conductor es requerido');
    }
    if (!ruta.vehiculos || ruta.vehiculos.length === 0) {
      throw new Error('Debe asignar al menos un vehículo');
    }
    if (!ruta.pedidos || ruta.pedidos.length === 0) {
      throw new Error('Debe incluir al menos un pedido');
    }
  }
}

@Injectable({ providedIn: 'root' })
export class UpdateRutaEntregaUseCase {
  private repository = inject(RutaEntregaRepository);
  
  execute(ruta: UpdateRutaEntregaDto): Observable<RutaEntregaEntity> {
    if (!ruta.id) {
      throw new Error('El ID de la ruta es requerido');
    }
    return this.repository.update(ruta);
  }
}

@Injectable({ providedIn: 'root' })
export class FilterRutasByEstadoUseCase {
  private repository = inject(RutaEntregaRepository);
  
  execute(estado: EstadoRuta): Observable<RutaEntregaEntity[]> {
    return this.repository.filterByEstado(estado);
  }
}

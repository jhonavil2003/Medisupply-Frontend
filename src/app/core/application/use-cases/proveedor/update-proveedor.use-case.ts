import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProveedorRepository } from '../../../domain/repositories/proveedor.repository';
import { UpdateProveedorDto, ProveedorEntity } from '../../../domain/entities/proveedor.entity';

@Injectable({ providedIn: 'root' })
export class UpdateProveedorUseCase {
  private repository = inject(ProveedorRepository);

  execute(proveedor: UpdateProveedorDto): Observable<ProveedorEntity> {
    if (!proveedor.id) {
      throw new Error('El ID del proveedor es requerido');
    }

    return this.repository.update(proveedor);
  }
}

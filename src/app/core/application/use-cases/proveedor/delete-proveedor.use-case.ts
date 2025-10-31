import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProveedorRepository } from '../../../domain/repositories/proveedor.repository';

@Injectable({ providedIn: 'root' })
export class DeleteProveedorUseCase {
  private repository = inject(ProveedorRepository);

  execute(id: string): Observable<boolean> {
    if (!id) {
      throw new Error('El ID del proveedor es requerido');
    }

    return this.repository.delete(id);
  }
}

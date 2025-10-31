import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProveedorRepository } from '../../../domain/repositories/proveedor.repository';
import { ProveedorEntity } from '../../../domain/entities/proveedor.entity';

@Injectable({ providedIn: 'root' })
export class GetProveedorByIdUseCase {
  private repository = inject(ProveedorRepository);

  execute(id: string): Observable<ProveedorEntity | null> {
    return this.repository.getById(id);
  }
}

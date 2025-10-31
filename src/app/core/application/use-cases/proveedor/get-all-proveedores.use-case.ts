import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProveedorRepository } from '../../../domain/repositories/proveedor.repository';
import { ProveedorEntity } from '../../../domain/entities/proveedor.entity';

@Injectable({ providedIn: 'root' })
export class GetAllProveedoresUseCase {
  private repository = inject(ProveedorRepository);

  execute(): Observable<ProveedorEntity[]> {
    return this.repository.getAll();
  }
}

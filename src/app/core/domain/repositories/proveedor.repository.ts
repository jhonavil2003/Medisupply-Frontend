import { Observable } from 'rxjs';
import { ProveedorEntity, CreateProveedorDto, UpdateProveedorDto } from '../entities/proveedor.entity';

export abstract class ProveedorRepository {
  abstract getAll(): Observable<ProveedorEntity[]>;
  abstract getById(id: string): Observable<ProveedorEntity | null>;
  abstract search(criteria: string): Observable<ProveedorEntity[]>;
  abstract create(proveedor: CreateProveedorDto): Observable<ProveedorEntity>;
  abstract update(proveedor: UpdateProveedorDto): Observable<ProveedorEntity>;
  abstract delete(id: string): Observable<boolean>;
  abstract filterByEstado(estado: string): Observable<ProveedorEntity[]>;
}

import { Injectable } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';
import { ProveedorRepository } from '../../../domain/repositories/proveedor.repository';
import { 
  ProveedorEntity, 
  CreateProveedorDto, 
  UpdateProveedorDto,
  EstadoProveedor 
} from '../../../domain/entities/proveedor.entity';

@Injectable({ providedIn: 'root' })
export class MockProveedorRepository extends ProveedorRepository {
  private proveedores: ProveedorEntity[] = [
    {
      id: '1',
      razonSocial: 'Proveedor A',
      ruc: '20440370388',
      telefono: '987654321',
      correoContacto: 'juan@proveedor.com',
      estado: EstadoProveedor.ACTIVO,
      certificacionesVigentes: ['ISO 9001', 'BPM'],
      fechaRegistro: new Date('2024-01-15'),
      fechaActualizacion: new Date('2024-01-15')
    },
    {
      id: '2',
      razonSocial: 'Proveedor B',
      ruc: '10345678901',
      telefono: '912345678',
      correoContacto: 'maria@proveedor.com',
      estado: EstadoProveedor.INACTIVO,
      certificacionesVigentes: ['ISO 14001'],
      fechaRegistro: new Date('2024-02-20'),
      fechaActualizacion: new Date('2024-02-20')
    }
  ];

  private nextId = 3;

  getAll(): Observable<ProveedorEntity[]> {
    return of([...this.proveedores]).pipe(delay(300));
  }

  getById(id: string): Observable<ProveedorEntity | null> {
    const proveedor = this.proveedores.find(p => p.id === id);
    return of(proveedor || null).pipe(delay(200));
  }

  search(criteria: string): Observable<ProveedorEntity[]> {
    const lowerCriteria = criteria.toLowerCase();
    const filtered = this.proveedores.filter(p =>
      p.razonSocial.toLowerCase().includes(lowerCriteria) ||
      p.ruc.includes(lowerCriteria) ||
      p.correoContacto.toLowerCase().includes(lowerCriteria) ||
      p.telefono.includes(lowerCriteria)
    );
    return of(filtered).pipe(delay(200));
  }

  create(dto: CreateProveedorDto): Observable<ProveedorEntity> {
    const newProveedor: ProveedorEntity = {
      id: String(this.nextId++),
      ...dto,
      fechaRegistro: new Date(),
      fechaActualizacion: new Date()
    };
    
    this.proveedores.push(newProveedor);
    return of(newProveedor).pipe(delay(300));
  }

  update(dto: UpdateProveedorDto): Observable<ProveedorEntity> {
    const index = this.proveedores.findIndex(p => p.id === dto.id);
    
    if (index === -1) {
      return throwError(() => new Error('Proveedor no encontrado'));
    }

    const updated: ProveedorEntity = {
      ...this.proveedores[index],
      ...dto,
      fechaActualizacion: new Date()
    };
    
    this.proveedores[index] = updated;
    return of(updated).pipe(delay(300));
  }

  delete(id: string): Observable<boolean> {
    const index = this.proveedores.findIndex(p => p.id === id);
    
    if (index === -1) {
      return of(false).pipe(delay(200));
    }

    this.proveedores.splice(index, 1);
    return of(true).pipe(delay(200));
  }

  filterByEstado(estado: string): Observable<ProveedorEntity[]> {
    const filtered = this.proveedores.filter(p => p.estado === estado);
    return of(filtered).pipe(delay(200));
  }
}

import { Injectable } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';
import { VendedorRepository } from '../../../domain/repositories/vendedor.repository';
import { 
  VendedorEntity, 
  CreateVendedorDto, 
  UpdateVendedorDto 
} from '../../../domain/entities/vendedor.entity';

/**
 * Implementación Mock del repositorio de Vendedores
 */
@Injectable({ providedIn: 'root' })
export class MockVendedorRepository extends VendedorRepository {
  private vendedores: VendedorEntity[] = [
    {
      id: '1',
      documento: '12345678',
      nombre: 'Juan Pérez',
      correo: 'juan@empresa.com',
      telefono: '987654321',
      region: 'Lima',
      activo: true,
      fechaIngreso: new Date('2023-06-01'),
      fechaActualizacion: new Date('2023-06-01')
    },
    {
      id: '2',
      documento: '87654321',
      nombre: 'María García',
      correo: 'maria@empresa.com',
      telefono: '912345678',
      region: 'Arequipa',
      activo: true,
      fechaIngreso: new Date('2023-08-15'),
      fechaActualizacion: new Date('2023-08-15')
    }
  ];

  private nextId = 3;

  getAll(): Observable<VendedorEntity[]> {
    return of([...this.vendedores]).pipe(delay(300));
  }

  getById(id: string): Observable<VendedorEntity | null> {
    const vendedor = this.vendedores.find(v => v.id === id);
    return of(vendedor || null).pipe(delay(200));
  }

  search(criteria: string): Observable<VendedorEntity[]> {
    const lowerCriteria = criteria.toLowerCase();
    const filtered = this.vendedores.filter(v =>
      v.nombre.toLowerCase().includes(lowerCriteria) ||
      v.documento.includes(lowerCriteria) ||
      v.correo.toLowerCase().includes(lowerCriteria) ||
      v.region.toLowerCase().includes(lowerCriteria)
    );
    return of(filtered).pipe(delay(200));
  }

  create(dto: CreateVendedorDto): Observable<VendedorEntity> {
    const newVendedor: VendedorEntity = {
      id: String(this.nextId++),
      ...dto,
      activo: dto.activo ?? true,
      fechaIngreso: new Date(),
      fechaActualizacion: new Date()
    };
    
    this.vendedores.push(newVendedor);
    return of(newVendedor).pipe(delay(300));
  }

  update(dto: UpdateVendedorDto): Observable<VendedorEntity> {
    const index = this.vendedores.findIndex(v => v.id === dto.id);
    
    if (index === -1) {
      return throwError(() => new Error('Vendedor no encontrado'));
    }

    const updated: VendedorEntity = {
      ...this.vendedores[index],
      ...dto,
      fechaActualizacion: new Date()
    };
    
    this.vendedores[index] = updated;
    return of(updated).pipe(delay(300));
  }

  delete(id: string): Observable<boolean> {
    const index = this.vendedores.findIndex(v => v.id === id);
    
    if (index === -1) {
      return of(false).pipe(delay(200));
    }

    this.vendedores.splice(index, 1);
    return of(true).pipe(delay(200));
  }

  filterByRegion(region: string): Observable<VendedorEntity[]> {
    const filtered = this.vendedores.filter(v => v.region === region);
    return of(filtered).pipe(delay(200));
  }
}

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
      id: 1,
      employeeId: 'EMP001',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@empresa.com',
      phone: '987654321',
      territory: 'Lima',
      isActive: true,
      hireDate: '2023-06-01'
    },
    {
      id: 2,
      employeeId: 'EMP002',
      firstName: 'María',
      lastName: 'García',
      email: 'maria@empresa.com',
      phone: '912345678',
      territory: 'Arequipa',
      isActive: true,
      hireDate: '2023-08-15'
    }
  ];

  private nextId = 3;

  getAll(): Observable<VendedorEntity[]> {
    return of([...this.vendedores]).pipe(delay(300));
  }

  getById(id: number): Observable<VendedorEntity | null> {
    const vendedor = this.vendedores.find(v => v.id === id);
    return of(vendedor || null).pipe(delay(200));
  }

  getByEmployeeId(employeeId: string): Observable<VendedorEntity | null> {
    const vendedor = this.vendedores.find(v => v.employeeId === employeeId);
    return of(vendedor || null).pipe(delay(200));
  }

  search(criteria: string): Observable<VendedorEntity[]> {
    const lowerCriteria = criteria.toLowerCase();
    const filtered = this.vendedores.filter(v =>
      v.firstName.toLowerCase().includes(lowerCriteria) ||
      v.lastName.toLowerCase().includes(lowerCriteria) ||
      v.employeeId.toLowerCase().includes(lowerCriteria) ||
      v.email.toLowerCase().includes(lowerCriteria) ||
      (v.territory && v.territory.toLowerCase().includes(lowerCriteria))
    );
    return of(filtered).pipe(delay(200));
  }

  create(dto: CreateVendedorDto): Observable<VendedorEntity> {
    const newVendedor: VendedorEntity = {
      id: this.nextId++,
      ...dto,
      isActive: dto.isActive ?? true
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
      ...dto
    };
    
    this.vendedores[index] = updated;
    return of(updated).pipe(delay(300));
  }

  delete(id: number): Observable<boolean> {
    const index = this.vendedores.findIndex(v => v.id === id);
    
    if (index === -1) {
      return of(false).pipe(delay(200));
    }

    this.vendedores.splice(index, 1);
    return of(true).pipe(delay(200));
  }

  filterByTerritory(territory: string): Observable<VendedorEntity[]> {
    const filtered = this.vendedores.filter(v => v.territory === territory);
    return of(filtered).pipe(delay(200));
  }
}

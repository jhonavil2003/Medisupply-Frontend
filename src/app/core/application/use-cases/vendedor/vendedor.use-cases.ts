import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VendedorRepository } from '../../../domain/repositories/vendedor.repository';
import { VendedorEntity, CreateVendedorDto, UpdateVendedorDto } from '../../../domain/entities/vendedor.entity';

/**
 * Casos de uso para Vendedor
 */

@Injectable({ providedIn: 'root' })
export class GetAllVendedoresUseCase {
  private repository = inject(VendedorRepository);
  execute(): Observable<VendedorEntity[]> {
    return this.repository.getAll();
  }
}

@Injectable({ providedIn: 'root' })
export class GetVendedorByIdUseCase {
  private repository = inject(VendedorRepository);
  execute(id: string): Observable<VendedorEntity | null> {
    return this.repository.getById(id);
  }
}

@Injectable({ providedIn: 'root' })
export class CreateVendedorUseCase {
  private repository = inject(VendedorRepository);
  
  execute(vendedor: CreateVendedorDto): Observable<VendedorEntity> {
    this.validateVendedor(vendedor);
    return this.repository.create(vendedor);
  }

  private validateVendedor(vendedor: CreateVendedorDto): void {
    if (!vendedor.documento || vendedor.documento.trim().length < 8) {
      throw new Error('El documento debe tener al menos 8 caracteres');
    }
    if (!vendedor.nombre || vendedor.nombre.trim().length < 3) {
      throw new Error('El nombre debe tener al menos 3 caracteres');
    }
    if (!this.isValidEmail(vendedor.correo)) {
      throw new Error('El correo electrónico no es válido');
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

@Injectable({ providedIn: 'root' })
export class UpdateVendedorUseCase {
  private repository = inject(VendedorRepository);
  
  execute(vendedor: UpdateVendedorDto): Observable<VendedorEntity> {
    if (!vendedor.id) {
      throw new Error('El ID del vendedor es requerido');
    }
    return this.repository.update(vendedor);
  }
}

@Injectable({ providedIn: 'root' })
export class DeleteVendedorUseCase {
  private repository = inject(VendedorRepository);
  
  execute(id: string): Observable<boolean> {
    if (!id) {
      throw new Error('El ID del vendedor es requerido');
    }
    return this.repository.delete(id);
  }
}

@Injectable({ providedIn: 'root' })
export class SearchVendedoresUseCase {
  private repository = inject(VendedorRepository);
  
  execute(criteria: string): Observable<VendedorEntity[]> {
    if (!criteria || criteria.trim().length === 0) {
      return this.repository.getAll();
    }
    return this.repository.search(criteria.trim());
  }
}

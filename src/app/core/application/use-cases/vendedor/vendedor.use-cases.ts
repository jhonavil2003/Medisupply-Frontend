import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { VendedorRepository, VendedorFilters } from '../../../domain/repositories/vendedor.repository';
import { VendedorEntity, CreateVendedorDto, UpdateVendedorDto } from '../../../domain/entities/vendedor.entity';

/**
 * Casos de uso para Vendedor
 */

@Injectable({ providedIn: 'root' })
export class GetAllVendedoresUseCase {
  private repository = inject(VendedorRepository);
  
  execute(filters?: VendedorFilters): Observable<VendedorEntity[]> {
    return this.repository.getAll(filters);
  }
}

@Injectable({ providedIn: 'root' })
export class GetVendedorByIdUseCase {
  private repository = inject(VendedorRepository);
  
  execute(id: number): Observable<VendedorEntity | null> {
    return this.repository.getById(id);
  }
}

@Injectable({ providedIn: 'root' })
export class GetVendedorByEmployeeIdUseCase {
  private repository = inject(VendedorRepository);
  
  execute(employeeId: string): Observable<VendedorEntity | null> {
    return this.repository.getByEmployeeId(employeeId);
  }
}

@Injectable({ providedIn: 'root' })
export class CreateVendedorUseCase {
  private repository = inject(VendedorRepository);
  
  execute(vendedor: CreateVendedorDto): Observable<VendedorEntity> {
    // Validar antes de ejecutar
    const validationError = this.validateVendedor(vendedor);
    if (validationError) {
      return throwError(() => new Error(validationError));
    }
    return this.repository.create(vendedor);
  }

  private validateVendedor(vendedor: CreateVendedorDto): string | null {
    console.log('🔍 Validando vendedor:', vendedor);
    
    if (!vendedor.employeeId || vendedor.employeeId.trim().length === 0) {
      return 'El ID de empleado es requerido';
    }
    if (!vendedor.firstName || vendedor.firstName.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    if (!vendedor.lastName || vendedor.lastName.trim().length < 2) {
      return 'El apellido debe tener al menos 2 caracteres';
    }
    
    // Validación detallada del email
    console.log('📧 Validando email...');
    console.log('  - Email recibido:', vendedor.email);
    console.log('  - Email tipo:', typeof vendedor.email);
    console.log('  - Email existe?:', !!vendedor.email);
    
    if (!vendedor.email) {
      return 'El correo electrónico es requerido';
    }
    
    const emailTrimmed = vendedor.email.trim();
    console.log('  - Email trimmed:', emailTrimmed);
    console.log('  - Email length:', emailTrimmed.length);
    
    const isValid = this.isValidEmail(emailTrimmed);
    console.log('  - Email válido?:', isValid);
    
    if (!isValid) {
      return 'El correo electrónico no es válido';
    }
    
    if (vendedor.hireDate && !this.isValidDate(vendedor.hireDate)) {
      return 'La fecha de contratación debe tener el formato YYYY-MM-DD';
    }
    
    console.log('✅ Validación exitosa');
    return null;
  }

  private isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  private isValidDate(date: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
  }
}

@Injectable({ providedIn: 'root' })
export class UpdateVendedorUseCase {
  private repository = inject(VendedorRepository);
  
  execute(vendedor: UpdateVendedorDto): Observable<VendedorEntity> {
    if (!vendedor.id) {
      return throwError(() => new Error('El ID del vendedor es requerido'));
    }
    const validationError = this.validateUpdateData(vendedor);
    if (validationError) {
      return throwError(() => new Error(validationError));
    }
    return this.repository.update(vendedor);
  }

  private validateUpdateData(vendedor: UpdateVendedorDto): string | null {
    if (vendedor.email && !this.isValidEmail(vendedor.email)) {
      return 'El correo electrónico no es válido';
    }
    if (vendedor.firstName && vendedor.firstName.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    if (vendedor.lastName && vendedor.lastName.trim().length < 2) {
      return 'El apellido debe tener al menos 2 caracteres';
    }
    if (vendedor.hireDate && !this.isValidDate(vendedor.hireDate)) {
      return 'La fecha de contratación debe tener el formato YYYY-MM-DD';
    }
    return null;
  }

  private isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  private isValidDate(date: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
  }
}

@Injectable({ providedIn: 'root' })
export class DeleteVendedorUseCase {
  private repository = inject(VendedorRepository);
  
  execute(id: number): Observable<boolean> {
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

@Injectable({ providedIn: 'root' })
export class FilterVendedoresByTerritoryUseCase {
  private repository = inject(VendedorRepository);
  
  execute(territory: string): Observable<VendedorEntity[]> {
    if (!territory || territory.trim().length === 0) {
      throw new Error('El territorio es requerido');
    }
    return this.repository.filterByTerritory(territory.trim());
  }
}

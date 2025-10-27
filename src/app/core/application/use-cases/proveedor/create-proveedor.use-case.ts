import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProveedorRepository } from '../../../domain/repositories/proveedor.repository';
import { CreateProveedorDto, ProveedorEntity } from '../../../domain/entities/proveedor.entity';

@Injectable({ providedIn: 'root' })
export class CreateProveedorUseCase {
  private repository = inject(ProveedorRepository);

  execute(proveedor: CreateProveedorDto): Observable<ProveedorEntity> {
    this.validateProveedor(proveedor);
    return this.repository.create(proveedor);
  }

  private validateProveedor(proveedor: CreateProveedorDto): void {
    if (!proveedor.razonSocial || proveedor.razonSocial.trim().length < 3) {
      throw new Error('La razón social debe tener al menos 3 caracteres');
    }

    if (!proveedor.ruc || !this.isValidRUC(proveedor.ruc)) {
      throw new Error('El RUC no es válido');
    }

    if (!this.isValidEmail(proveedor.correoContacto)) {
      throw new Error('El correo electrónico no es válido');
    }
  }

  private isValidRUC(ruc: string): boolean {
    return /^\d{11}$/.test(ruc);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

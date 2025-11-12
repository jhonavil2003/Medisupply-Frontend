import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogRef } from '@angular/material/dialog';

import { CreateProveedorUseCase } from '../../core/application/use-cases/proveedor/create-proveedor.use-case';
import { ProveedorEntity } from '../../core/domain/entities/proveedor.entity';

@Component({
  selector: 'app-proveedor-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './proveedor-create.component.html',
  styleUrls: ['./proveedor-create.component.css']
})
export class ProveedorCreateComponent {
  private fb = inject(FormBuilder);
  private createProveedorUseCase = inject(CreateProveedorUseCase);
  private dialogRef = inject(MatDialogRef<ProveedorCreateComponent>);

  loading = signal(false);
  proveedorForm: FormGroup;

  estadosDisponibles = ['Activo', 'Inactivo', 'Pendiente'];
  monedasDisponibles = ['USD', 'COP', 'EUR'];

  constructor() {
    this.proveedorForm = this.fb.group({
      razonSocial: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(200)
      ]],
      ruc: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(20),
        Validators.pattern(/^[0-9]+$/)
      ]],
      country: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],
      telefono: ['', [
        Validators.required,
        Validators.minLength(7),
        Validators.maxLength(20),
        Validators.pattern(/^[0-9+\-\s()]+$/)
      ]],
      correoContacto: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(150)
      ]],
      website: ['', [
        Validators.maxLength(200),
        Validators.pattern(/^https?:\/\/.+/)
      ]],
      currency: ['', [
        Validators.maxLength(10)
      ]],
      addressLine1: ['', [
        Validators.required,
        Validators.maxLength(300)
      ]],
      city: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],
      state: ['', [
        Validators.maxLength(100)
      ]],
      paymentTerms: ['', [
        Validators.maxLength(200)
      ]],
      creditLimit: [null, [
        Validators.min(0),
        Validators.max(999999999.99)
      ]],
      estado: ['Activo', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.proveedorForm.valid) {
      this.loading.set(true);
      
      const proveedorData = this.proveedorForm.value;
      
      this.createProveedorUseCase.execute(proveedorData).subscribe({
        next: (proveedor) => {
          this.loading.set(false);
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading.set(false);
          console.error('Error al crear proveedor:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.proveedorForm.controls).forEach(key => {
      const control = this.proveedorForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.proveedorForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['maxlength']) {
        return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `El valor mínimo es ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `El valor máximo es ${field.errors['max'].max}`;
      }
      if (field.errors['email']) {
        return 'Correo electrónico inválido';
      }
      if (field.errors['pattern']) {
        if (fieldName === 'ruc') {
          return 'Solo números permitidos';
        }
        if (fieldName === 'telefono') {
          return 'Formato de teléfono inválido';
        }
        if (fieldName === 'website') {
          return 'Debe ser una URL válida (http:// o https://)';
        }
        return 'Formato inválido';
      }
    }
    return '';
  }
}

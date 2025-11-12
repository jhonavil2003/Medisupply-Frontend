import { Component, inject, signal, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import {
  GetVendedorByIdUseCase,
  UpdateVendedorUseCase
} from '../../../../core/application/use-cases/vendedor/vendedor.use-cases';
import { UpdateVendedorDto, VendedorEntity } from '../../../../core/domain/entities/vendedor.entity';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-vendedor-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './vendedor-edit.component.html',
  styleUrls: ['./vendedor-edit.component.css']
})
export class VendedorEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private getVendedorByIdUseCase = inject(GetVendedorByIdUseCase);
  private updateVendedorUseCase = inject(UpdateVendedorUseCase);
  private notificationService = inject(NotificationService);
  private dialogRef = inject(MatDialogRef<VendedorEditComponent>);

  loading = signal(false);
  vendedorId: number;
  originalVendedor: VendedorEntity | null = null;
  vendedorForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { vendedorId: number }) {
    this.vendedorId = data.vendedorId;
    
    this.vendedorForm = this.fb.group({
      employeeId: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(150)
      ]],
      phone: ['', [
        Validators.minLength(7),
        Validators.maxLength(20),
        Validators.pattern(/^[0-9+\-\s()]+$/)
      ]],
      territory: ['', Validators.maxLength(100)],
      hireDate: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadVendedor(this.vendedorId);
  }

  loadVendedor(id: number): void {
    this.loading.set(true);
    
    this.getVendedorByIdUseCase.execute(id).subscribe({
      next: (vendedor) => {
        if (vendedor) {
          this.originalVendedor = vendedor;
          
          // Convertir la fecha string a Date si existe
          let hireDate = null;
          if (vendedor.hireDate) {
            hireDate = new Date(vendedor.hireDate);
          }

          this.vendedorForm.patchValue({
            employeeId: vendedor.employeeId,
            firstName: vendedor.firstName,
            lastName: vendedor.lastName,
            email: vendedor.email,
            phone: vendedor.phone || '',
            territory: vendedor.territory || '',
            hireDate: hireDate,
            isActive: vendedor.isActive ?? true
          });
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar vendedor:', error);
        this.notificationService.error('Error al cargar vendedor');
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.vendedorForm.invalid) {
      this.vendedorForm.markAllAsTouched();
      this.notificationService.warning('Por favor complete los campos requeridos correctamente');
      return;
    }

    if (!this.vendedorId) {
      this.notificationService.error('ID de vendedor no válido');
      return;
    }

    this.loading.set(true);
    const formValue = this.vendedorForm.value;

    // Formatear la fecha si existe
    let hireDate: string | undefined = undefined;
    if (formValue.hireDate) {
      const date = new Date(formValue.hireDate);
      // Usar fecha local para evitar problemas con zona horaria
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      hireDate = `${year}-${month}-${day}`; // Formato YYYY-MM-DD
    }

    const vendedorDto: UpdateVendedorDto = {
      id: this.vendedorId,
      employeeId: formValue.employeeId,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone || undefined,
      territory: formValue.territory || undefined,
      hireDate: hireDate,
      isActive: formValue.isActive
    };

    this.updateVendedorUseCase.execute(vendedorDto).subscribe({
      next: (vendedor) => {
        this.loading.set(false);
        this.notificationService.success('Vendedor actualizado exitosamente');
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error al actualizar vendedor:', error);
        
        // Error de validación del use case
        if (error.message) {
          this.notificationService.error(error.message);
        }
        // Error HTTP 400 (duplicado)
        else if (error.status === 400) {
          this.notificationService.error('El ID de empleado o email ya existe');
        }
        // Otros errores HTTP
        else if (error.status) {
          this.notificationService.error(`Error del servidor: ${error.statusText || 'Error desconocido'}`);
        }
        // Error genérico
        else {
          this.notificationService.error('Error al actualizar vendedor');
        }
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  getErrorMessage(field: string): string {
    const control = this.vendedorForm.get(field);
    
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('maxlength')) {
      return `Máximo ${control.errors?.['maxlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('email')) {
      return 'Correo electrónico inválido';
    }
    if (control?.hasError('pattern')) {
      if (field === 'phone') {
        return 'Formato de teléfono inválido';
      }
      return 'Formato inválido';
    }
    
    return '';
  }
}

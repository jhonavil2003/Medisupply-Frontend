import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
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

import { CreateVendedorUseCase } from '../../../../core/application/use-cases/vendedor/vendedor.use-cases';
import { CreateVendedorDto } from '../../../../core/domain/entities/vendedor.entity';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-vendedor-create',
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
  templateUrl: './vendedor-create.component.html',
  styleUrls: ['./vendedor-create.component.css']
})
export class VendedorCreateComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private createVendedorUseCase = inject(CreateVendedorUseCase);
  private notificationService = inject(NotificationService);

  loading = signal(false);
  vendedorForm: FormGroup;

  constructor() {
    this.vendedorForm = this.fb.group({
      employeeId: ['', [Validators.required, Validators.minLength(2)]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      territory: [''],
      hireDate: [''],
      isActive: [true]
    });
  }

  onSubmit(): void {
    if (this.vendedorForm.invalid) {
      this.vendedorForm.markAllAsTouched();
      this.notificationService.warning('Por favor complete los campos requeridos correctamente');
      return;
    }

    this.loading.set(true);
    const formValue = this.vendedorForm.value;

    // Formatear la fecha si existe
    let hireDate: string | undefined = undefined;
    if (formValue.hireDate) {
      const date = new Date(formValue.hireDate);
      hireDate = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    }

    const vendedorDto: CreateVendedorDto = {
      employeeId: formValue.employeeId,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone || undefined,
      territory: formValue.territory || undefined,
      hireDate: hireDate,
      isActive: formValue.isActive ?? true
    };

    console.log('📝 VendedorDTO a crear:', vendedorDto);
    console.log('📧 Email a validar:', vendedorDto.email, 'Tipo:', typeof vendedorDto.email);

    this.createVendedorUseCase.execute(vendedorDto).subscribe({
      next: (vendedor) => {
        this.loading.set(false);
        this.notificationService.success('Vendedor creado exitosamente');
        this.router.navigate(['/vendedores']);
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error al crear vendedor:', error);
        
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
          this.notificationService.error('Error al crear vendedor');
        }
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/vendedores']);
  }

  getErrorMessage(field: string): string {
    const control = this.vendedorForm.get(field);
    
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('email')) {
      return 'Email inválido';
    }
    
    return '';
  }
}

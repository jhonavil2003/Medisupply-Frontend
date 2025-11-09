import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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

import {
  GetVendedorByIdUseCase,
  UpdateVendedorUseCase
} from '../../../../core/application/use-cases/vendedor/vendedor.use-cases';
import { UpdateVendedorDto } from '../../../../core/domain/entities/vendedor.entity';
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
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private getVendedorByIdUseCase = inject(GetVendedorByIdUseCase);
  private updateVendedorUseCase = inject(UpdateVendedorUseCase);
  private notificationService = inject(NotificationService);

  loading = signal(false);
  vendedorId: number | null = null;
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

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.vendedorId = parseInt(id, 10);
      this.loadVendedor(this.vendedorId);
    } else {
      this.notificationService.error('ID de vendedor no válido');
      this.router.navigate(['/vendedores']);
    }
  }

  loadVendedor(id: number): void {
    this.loading.set(true);
    
    this.getVendedorByIdUseCase.execute(id).subscribe({
      next: (vendedor) => {
        if (vendedor) {
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
        } else {
          this.notificationService.error('Vendedor no encontrado');
          this.router.navigate(['/vendedores']);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar vendedor:', error);
        this.notificationService.error('Error al cargar vendedor');
        this.loading.set(false);
        this.router.navigate(['/vendedores']);
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
      hireDate = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
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
        this.router.navigate(['/vendedores']);
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

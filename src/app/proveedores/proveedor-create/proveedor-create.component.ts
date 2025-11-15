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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { CreateProveedorUseCase } from '../../core/application/use-cases/proveedor/create-proveedor.use-case';
import { ProveedorEntity } from '../../core/domain/entities/proveedor.entity';
import { NotificationService } from '../../presentation/shared/services/notification.service';

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
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './proveedor-create.component.html',
  styleUrls: ['./proveedor-create.component.css']
})
export class ProveedorCreateComponent {
  private fb = inject(FormBuilder);
  private createProveedorUseCase = inject(CreateProveedorUseCase);
  private dialogRef = inject(MatDialogRef<ProveedorCreateComponent>);
  private translate = inject(TranslateService);
  private notificationService = inject(NotificationService);

  loading = signal(false);
  proveedorForm: FormGroup;

  monedasDisponibles = ['COP'];

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
        Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}/)
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
      ]]
    });
  }

  onSubmit(): void {
    if (this.proveedorForm.valid) {
      this.loading.set(true);
      
      // Siempre crear como activo
      const proveedorData = {
        ...this.proveedorForm.value,
        estado: 'Activo'
      };
      
      this.createProveedorUseCase.execute(proveedorData).subscribe({
        next: (proveedor) => {
          this.loading.set(false);
          this.notificationService.success(this.translate.instant('SUPPLIERS.CREATE_SUCCESS'));
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading.set(false);
          console.error('Error al crear proveedor:', error);
        }
      });
    } else {
      this.notificationService.warning(this.translate.instant('SUPPLIERS.COMPLETE_REQUIRED_FIELDS'));
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
        return this.translate.instant('VALIDATION.REQUIRED');
      }
      if (field.errors['minlength']) {
        return this.translate.instant('VALIDATION.MIN_LENGTH', { min: field.errors['minlength'].requiredLength });
      }
      if (field.errors['maxlength']) {
        return this.translate.instant('VALIDATION.MAX_LENGTH', { max: field.errors['maxlength'].requiredLength });
      }
      if (field.errors['min']) {
        return this.translate.instant('VALIDATION.MIN_VALUE', { min: field.errors['min'].min });
      }
      if (field.errors['max']) {
        return this.translate.instant('VALIDATION.MAX_VALUE', { max: field.errors['max'].max });
      }
      if (field.errors['email']) {
        return this.translate.instant('VALIDATION.INVALID_EMAIL');
      }
      if (field.errors['pattern']) {
        if (fieldName === 'ruc') {
          return this.translate.instant('VALIDATION.NUMBERS_ONLY');
        }
        if (fieldName === 'telefono') {
          return this.translate.instant('VALIDATION.INVALID_PHONE');
        }
        if (fieldName === 'website') {
          return this.translate.instant('VALIDATION.INVALID_WEBSITE');
        }
        return this.translate.instant('VALIDATION.INVALID_FORMAT');
      }
    }
    return '';
  }
}

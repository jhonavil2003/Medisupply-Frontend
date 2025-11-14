import { Component, inject, signal, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { GetProveedorByIdUseCase } from '../../core/application/use-cases/proveedor/get-proveedor-by-id.use-case';
import { UpdateProveedorUseCase } from '../../core/application/use-cases/proveedor/update-proveedor.use-case';
import { ProveedorEntity } from '../../core/domain/entities/proveedor.entity';

@Component({
  selector: 'app-proveedor-edit',
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
  templateUrl: './proveedor-edit.component.html',
  styleUrls: ['./proveedor-edit.component.css']
})
export class ProveedorEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private getProveedorByIdUseCase = inject(GetProveedorByIdUseCase);
  private updateProveedorUseCase = inject(UpdateProveedorUseCase);
  private dialogRef = inject(MatDialogRef<ProveedorEditComponent>);
  private translate = inject(TranslateService);

  loading = signal(false);
  proveedorForm: FormGroup;
  proveedorId: number;
  originalProveedor: ProveedorEntity | null = null;

  monedasDisponibles = ['COP'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { proveedorId: number }) {
    this.proveedorId = data.proveedorId;
    
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

  ngOnInit(): void {
    this.loadProveedor();
  }

  loadProveedor(): void {
    this.loading.set(true);
    this.getProveedorByIdUseCase.execute(this.proveedorId.toString()).subscribe({
      next: (proveedor) => {
        if (!proveedor) {
          console.error('Proveedor no encontrado');
          this.loading.set(false);
          return;
        }
        this.originalProveedor = proveedor;
        this.proveedorForm.patchValue({
          razonSocial: proveedor.razonSocial,
          ruc: proveedor.ruc,
          country: proveedor.country,
          telefono: proveedor.telefono,
          correoContacto: proveedor.correoContacto,
          website: proveedor.website || '',
          currency: proveedor.currency || '',
          addressLine1: proveedor.addressLine1,
          city: proveedor.city,
          state: proveedor.state || '',
          paymentTerms: proveedor.paymentTerms || '',
          creditLimit: proveedor.creditLimit
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar proveedor:', error);
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.proveedorForm.valid) {
      this.loading.set(true);
      
      const changedFields = this.getChangedFields();
      
      if (Object.keys(changedFields).length === 0) {
        this.dialogRef.close(false);
        return;
      }

      const updateDto = { id: this.proveedorId.toString(), ...changedFields };

      this.updateProveedorUseCase.execute(updateDto).subscribe({
        next: () => {
          this.loading.set(false);
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          console.error('Error al actualizar proveedor:', error);
          this.loading.set(false);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  private getChangedFields(): Partial<ProveedorEntity> {
    const changedFields: any = {};
    const formValue = this.proveedorForm.value;

    if (!this.originalProveedor) return changedFields;

    Object.keys(formValue).forEach(key => {
      const originalValue = (this.originalProveedor as any)[key];
      const newValue = formValue[key];
      
      if (originalValue !== newValue) {
        changedFields[key] = newValue;
      }
    });

    return changedFields;
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

import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogRef } from '@angular/material/dialog';

import { CreateProductUseCase } from '../../../../core/application/use-cases/producto/create-product.use-case';
import { CreateProductRequest } from '../../../../core/domain/repositories/producto.repository';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-producto-create',
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
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './producto-create.component.html',
  styleUrls: ['./producto-create.component.css']
})
export class ProductoCreateComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private createProductUseCase = inject(CreateProductUseCase);
  private notificationService = inject(NotificationService);
  private dialogRef = inject(MatDialogRef<ProductoCreateComponent>);

  loading = signal(false);
  productForm: FormGroup;

  categories = [
    'Medicamentos',
    'Instrumental',
    'Equipos médicos',
    'Suministros',
    'Reactivos',
    'Material quirúrgico',
    'Otros'
  ];

  unitsOfMeasure = [
    'unidad',
    'caja',
    'paquete',
    'botella',
    'frasco',
    'ampolla',
    'vial',
    'tubo',
    'ml',
    'gr',
    'kg'
  ];

  currencies = [
    'USD',
    'COP',
    'EUR'
  ];

  constructor() {
    this.productForm = this.fb.group({
      sku: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z0-9\-_]+$/)
      ]],
      name: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(200)
      ]],
      description: ['', [
        Validators.maxLength(1000)
      ]],
      category: ['', Validators.required],
      subcategory: ['', [
        Validators.maxLength(100)
      ]],
      unit_price: [null, [
        Validators.required, 
        Validators.min(0.01),
        Validators.max(999999999.99)
      ]],
      currency: ['USD', Validators.required],
      unit_of_measure: ['', Validators.required],
      supplier_id: [null, [
        Validators.required, 
        Validators.min(1),
        Validators.pattern(/^[0-9]+$/)
      ]],
      requires_cold_chain: [false],
      manufacturer: ['', [
        Validators.maxLength(200)
      ]],
      country_of_origin: ['', [
        Validators.maxLength(100)
      ]],
      barcode: ['', [
        Validators.minLength(8),
        Validators.maxLength(50),
        Validators.pattern(/^[0-9]+$/)
      ]],
      image_url: ['', [
        Validators.maxLength(500),
        Validators.pattern(/^https?:\/\/.+/)
      ]]
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.loading.set(true);
      
      const productData: CreateProductRequest = this.productForm.value;
      
      this.createProductUseCase.execute(productData).subscribe({
        next: (product) => {
          this.loading.set(false);
          this.notificationService.success('Producto creado exitosamente');
          this.dialogRef.close(true); // Cerrar modal y retornar true
        },
        error: (error) => {
          this.loading.set(false);
          this.notificationService.error(`Error al crear producto: ${error.message}`);
        }
      });
    } else {
      this.markFormGroupTouched();
      this.notificationService.warning('Por favor, complete todos los campos requeridos');
    }
  }

  onCancel(): void {
    this.dialogRef.close(false); // Cerrar modal sin guardar
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
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
      if (field.errors['pattern']) {
        if (fieldName === 'sku') {
          return 'Solo letras, números, guiones y guiones bajos';
        }
        if (fieldName === 'barcode') {
          return 'Solo números permitidos';
        }
        if (fieldName === 'supplier_id') {
          return 'Solo números enteros';
        }
        if (fieldName === 'image_url') {
          return 'Debe ser una URL válida (http:// o https://)';
        }
        return 'Formato inválido';
      }
    }
    return '';
  }
}
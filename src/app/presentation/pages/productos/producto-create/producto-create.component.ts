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
      sku: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      category: ['', Validators.required],
      subcategory: [''],
      unit_price: [0, [Validators.required, Validators.min(0.01)]],
      currency: ['USD', Validators.required],
      unit_of_measure: ['', Validators.required],
      supplier_id: [1, [Validators.required, Validators.min(1)]],
      requires_cold_chain: [false],
      manufacturer: [''],
      country_of_origin: [''],
      barcode: [''],
      image_url: ['']
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
          this.router.navigate(['/producto-list']);
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
    this.router.navigate(['/producto-list']);
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
        return `${fieldName} es requerido`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `${fieldName} debe ser mayor a ${field.errors['min'].min}`;
      }
    }
    return '';
  }
}
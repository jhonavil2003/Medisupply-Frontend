import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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

import { GetProductByIdUseCase } from '../../../../core/application/use-cases/producto/get-product-by-id.use-case';
import { UpdateProductUseCase } from '../../../../core/application/use-cases/producto/update-product.use-case';
import { UpdateProductRequest } from '../../../../core/domain/repositories/producto.repository';
import { ProductoDetailedEntity } from '../../../../core/domain/entities/producto.entity';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-producto-edit',
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
  templateUrl: './producto-edit.component.html',
  styleUrls: ['./producto-edit.component.css']
})
export class ProductoEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private getProductByIdUseCase = inject(GetProductByIdUseCase);
  private updateProductUseCase = inject(UpdateProductUseCase);
  private notificationService = inject(NotificationService);

  loading = signal(false);
  loadingProduct = signal(true);
  productForm: FormGroup;
  productId: number | null = null;
  originalProduct: ProductoDetailedEntity | null = null;

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
      image_url: [''],
      is_active: [true],
      is_discontinued: [false]
    });
  }

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.productId) {
      this.loadProduct();
    } else {
      this.notificationService.error('ID de producto no válido');
      this.router.navigate(['/producto-list']);
    }
  }

  loadProduct(): void {
    if (!this.productId) return;

    this.loadingProduct.set(true);
    this.getProductByIdUseCase.execute(this.productId).subscribe({
      next: (product) => {
        this.originalProduct = product;
        this.populateForm(product);
        this.loadingProduct.set(false);
      },
      error: (error) => {
        this.loadingProduct.set(false);
        this.notificationService.error(`Error al cargar producto: ${error.message}`);
        this.router.navigate(['/producto-list']);
      }
    });
  }

  populateForm(product: ProductoDetailedEntity): void {
    this.productForm.patchValue({
      sku: product.sku,
      name: product.name,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory,
      unit_price: product.unit_price,
      currency: product.currency,
      unit_of_measure: product.unit_of_measure,
      supplier_id: product.supplier_id,
      requires_cold_chain: product.requires_cold_chain,
      manufacturer: product.manufacturer,
      country_of_origin: product.country_of_origin,
      barcode: product.barcode,
      image_url: product.image_url,
      is_active: product.is_active,
      is_discontinued: product.is_discontinued
    });
  }

  onSubmit(): void {
    if (this.productForm.valid && this.productId) {
      this.loading.set(true);
      
      const updateData: UpdateProductRequest = this.getChangedFields();
      
      this.updateProductUseCase.execute(this.productId, updateData).subscribe({
        next: (product) => {
          this.loading.set(false);
          this.notificationService.success('Producto actualizado exitosamente');
          this.router.navigate(['/producto-list']);
        },
        error: (error) => {
          this.loading.set(false);
          this.notificationService.error(`Error al actualizar producto: ${error.message}`);
        }
      });
    } else {
      this.markFormGroupTouched();
      this.notificationService.warning('Por favor, complete todos los campos requeridos');
    }
  }

  getChangedFields(): UpdateProductRequest {
    const formValue = this.productForm.value;
    const changedFields: UpdateProductRequest = {};
    
    if (!this.originalProduct) return formValue;

    // Compare each field and only include changed ones
    Object.keys(formValue).forEach(key => {
      const originalValue = (this.originalProduct as any)[key];
      const newValue = formValue[key];
      
      if (originalValue !== newValue) {
        (changedFields as any)[key] = newValue;
      }
    });

    return changedFields;
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
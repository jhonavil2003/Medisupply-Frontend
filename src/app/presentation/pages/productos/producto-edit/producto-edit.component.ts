import { Component, inject, signal, OnInit, Inject } from '@angular/core';
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
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

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
  private dialogRef = inject(MatDialogRef<ProductoEditComponent>);

  loading = signal(false);
  loadingProduct = signal(true);
  productForm: FormGroup;
  productId: number;
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

  constructor(@Inject(MAT_DIALOG_DATA) public data: { productId: number }) {
    this.productId = data.productId;
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
      ]],
      is_discontinued: [false]
    });
  }

  ngOnInit(): void {
    this.loadProduct();
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
        this.dialogRef.close(false);
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
          this.dialogRef.close(true); // Cerrar modal y retornar true
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
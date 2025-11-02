import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { ProductoCreateComponent } from './producto-create.component';
import { CreateProductUseCase } from '../../../../core/application/use-cases/producto/create-product.use-case';
import { NotificationService } from '../../../shared/services/notification.service';
import { CreateProductRequest } from '../../../../core/domain/repositories/producto.repository';
import { ProductoDetailedEntity } from '../../../../core/domain/entities/producto.entity';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

describe('ProductoCreateComponent', () => {
  let component: ProductoCreateComponent;
  let fixture: ComponentFixture<ProductoCreateComponent>;
  let mockRouter: any;
  let mockCreateProductUseCase: any;
  let mockNotificationService: any;

  const mockProduct: ProductoDetailedEntity = {
    id: 1,
    sku: 'TEST-001',
    name: 'Test Product',
    description: 'Test Description',
    category: 'Medicamentos',
    subcategory: 'Test Subcategory',
    unit_price: 100,
    currency: 'USD',
    unit_of_measure: 'unidad',
    supplier_id: 1,
    supplier_name: 'Test Supplier',
    requires_cold_chain: false,
    storage_conditions: {
      temperature_min: null,
      temperature_max: null,
      humidity_max: null
    },
    regulatory_info: {
      sanitary_registration: null,
      requires_prescription: false,
      regulatory_class: null
    },
    physical_dimensions: {
      weight_kg: null,
      length_cm: null,
      width_cm: null,
      height_cm: null
    },
    manufacturer: 'Test Manufacturer',
    country_of_origin: 'Colombia',
    barcode: '123456789',
    image_url: 'https://test.com/image.jpg',
    is_active: true,
    is_discontinued: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    certifications: [],
    regulatory_conditions: []
  };

  beforeEach(async () => {
    const routerSpy = {
      navigate: jest.fn().mockReturnValue(Promise.resolve(true))
    };
    const createProductUseCaseSpy = {
      execute: jest.fn()
    };
    const notificationServiceSpy = {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        ProductoCreateComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: CreateProductUseCase, useValue: createProductUseCaseSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoCreateComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as any;
    mockCreateProductUseCase = TestBed.inject(CreateProductUseCase) as any;
    mockNotificationService = TestBed.inject(NotificationService) as any;

    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default form values', () => {
      expect(component.productForm).toBeDefined();
      expect(component.productForm.get('sku')?.value).toBe('');
      expect(component.productForm.get('name')?.value).toBe('');
      expect(component.productForm.get('category')?.value).toBe('');
      expect(component.productForm.get('unit_price')?.value).toBe(0);
      expect(component.productForm.get('currency')?.value).toBe('USD');
      expect(component.productForm.get('supplier_id')?.value).toBe(1);
      expect(component.productForm.get('requires_cold_chain')?.value).toBe(false);
      expect(component.loading()).toBe(false);
    });

    it('should have proper form validation setup', () => {
      const form = component.productForm;
      
      expect(form.get('sku')?.hasError('required')).toBe(true);
      expect(form.get('name')?.hasError('required')).toBe(true);
      expect(form.get('category')?.hasError('required')).toBe(true);
      expect(form.get('unit_of_measure')?.hasError('required')).toBe(true);
      
      // unit_price has default value 0, so it doesn't have required error
      // but it should have min error since 0 < 0.01
      expect(form.get('unit_price')?.hasError('min')).toBe(true);
    });

    it('should initialize arrays with correct values', () => {
      expect(component.categories).toContain('Medicamentos');
      expect(component.categories).toContain('Instrumental');
      expect(component.unitsOfMeasure).toContain('unidad');
      expect(component.unitsOfMeasure).toContain('caja');
      expect(component.currencies).toContain('USD');
      expect(component.currencies).toContain('COP');
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      // Setup valid form data
      component.productForm.patchValue({
        sku: 'TEST-001',
        name: 'Test Product',
        category: 'Medicamentos',
        unit_price: 100,
        unit_of_measure: 'unidad',
        supplier_id: 1
      });
    });

    it('should submit valid form successfully', fakeAsync(() => {
      mockCreateProductUseCase.execute.mockReturnValue(of(mockProduct));

      component.onSubmit();
      tick();

      expect(component.loading()).toBe(false);
      expect(mockCreateProductUseCase.execute).toHaveBeenCalledWith(expect.any(Object));
      expect(mockNotificationService.success).toHaveBeenCalledWith('Producto creado exitosamente');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/producto-list']);
    }));

    it('should handle loading state during submission', fakeAsync(() => {
      const delayedObservable = of(mockProduct).pipe(delay(1));
      mockCreateProductUseCase.execute.mockReturnValue(delayedObservable);
      
      component.onSubmit();
      
      // Loading should be true immediately after calling onSubmit
      expect(component.loading()).toBe(true);
      expect(mockCreateProductUseCase.execute).toHaveBeenCalled();
      
      tick(1); // Complete the observable
      
      expect(component.loading()).toBe(false);
    }));

    it('should handle submission error', fakeAsync(() => {
      const errorMessage = 'Error creating product';
      mockCreateProductUseCase.execute.mockReturnValue(throwError(() => new Error(errorMessage)));

      component.onSubmit();
      tick();

      expect(component.loading()).toBe(false);
      expect(mockNotificationService.error).toHaveBeenCalledWith(`Error al crear producto: ${errorMessage}`);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));

    it('should not submit invalid form', () => {
      component.productForm.patchValue({
        sku: '', // Invalid - required
        name: 'Test Product',
        category: 'Medicamentos'
      });

      component.onSubmit();

      expect(mockCreateProductUseCase.execute).not.toHaveBeenCalled();
      expect(mockNotificationService.warning).toHaveBeenCalledWith('Por favor, complete todos los campos requeridos');
    });

    it('should mark form controls as touched when form is invalid', () => {
      component.productForm.patchValue({
        sku: '', // Invalid
        name: ''  // Invalid
      });

      component.onSubmit();

      expect(component.productForm.get('sku')?.touched).toBe(true);
      expect(component.productForm.get('name')?.touched).toBe(true);
    });
  });

  describe('Form Validation', () => {
    it('should validate SKU field', () => {
      const skuControl = component.productForm.get('sku');
      
      // Test required validation
      skuControl?.setValue('');
      skuControl?.markAsTouched();
      expect(component.getFieldError('sku')).toContain('sku es requerido');
      
      // Test minLength validation
      skuControl?.setValue('AB');
      expect(component.getFieldError('sku')).toContain('debe tener al menos 3 caracteres');
      
      // Test valid value
      skuControl?.setValue('ABC-123');
      expect(component.getFieldError('sku')).toBe('');
    });

    it('should validate name field', () => {
      const nameControl = component.productForm.get('name');
      
      nameControl?.setValue('');
      nameControl?.markAsTouched();
      expect(component.getFieldError('name')).toContain('name es requerido');
      
      nameControl?.setValue('A');
      expect(component.getFieldError('name')).toContain('debe tener al menos 2 caracteres');
      
      nameControl?.setValue('Valid Name');
      expect(component.getFieldError('name')).toBe('');
    });

    it('should validate unit_price field', () => {
      const priceControl = component.productForm.get('unit_price');
      
      priceControl?.setValue(null);
      priceControl?.markAsTouched();
      expect(component.getFieldError('unit_price')).toContain('unit_price es requerido');
      
      priceControl?.setValue(0);
      expect(component.getFieldError('unit_price')).toContain('debe ser mayor a 0.01');
      
      priceControl?.setValue(10.50);
      expect(component.getFieldError('unit_price')).toBe('');
    });

    it('should validate supplier_id field', () => {
      const supplierControl = component.productForm.get('supplier_id');
      
      supplierControl?.setValue(null);
      supplierControl?.markAsTouched();
      expect(component.getFieldError('supplier_id')).toContain('supplier_id es requerido');
      
      supplierControl?.setValue(0);
      expect(component.getFieldError('supplier_id')).toContain('debe ser mayor a 1');
      
      supplierControl?.setValue(5);
      expect(component.getFieldError('supplier_id')).toBe('');
    });

    it('should return empty string for untouched fields', () => {
      const skuControl = component.productForm.get('sku');
      skuControl?.setValue('');
      // Don't mark as touched
      
      expect(component.getFieldError('sku')).toBe('');
    });

    it('should return empty string for valid fields', () => {
      const skuControl = component.productForm.get('sku');
      skuControl?.setValue('VALID-SKU');
      skuControl?.markAsTouched();
      
      expect(component.getFieldError('sku')).toBe('');
    });
  });

  describe('Navigation', () => {
    it('should navigate to product list on cancel', () => {
      component.onCancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/producto-list']);
    });
  });

  describe('Private Methods', () => {
    it('should mark all form controls as touched', () => {
      // Initially, controls should not be touched
      Object.keys(component.productForm.controls).forEach(key => {
        expect(component.productForm.get(key)?.touched).toBe(false);
      });

      // Call the private method through onSubmit with invalid form
      component.productForm.patchValue({ sku: '' }); // Make form invalid
      component.onSubmit();

      // All controls should now be touched
      Object.keys(component.productForm.controls).forEach(key => {
        expect(component.productForm.get(key)?.touched).toBe(true);
      });
    });
  });

  describe('Data Arrays', () => {
    it('should have all required categories', () => {
      const expectedCategories = [
        'Medicamentos',
        'Instrumental', 
        'Equipos médicos',
        'Suministros',
        'Reactivos',
        'Material quirúrgico',
        'Otros'
      ];
      
      expectedCategories.forEach(category => {
        expect(component.categories).toContain(category);
      });
    });

    it('should have all required units of measure', () => {
      const expectedUnits = [
        'unidad', 'caja', 'paquete', 'botella', 'frasco',
        'ampolla', 'vial', 'tubo', 'ml', 'gr', 'kg'
      ];
      
      expectedUnits.forEach(unit => {
        expect(component.unitsOfMeasure).toContain(unit);
      });
    });

    it('should have all required currencies', () => {
      const expectedCurrencies = ['USD', 'COP', 'EUR'];
      
      expectedCurrencies.forEach(currency => {
        expect(component.currencies).toContain(currency);
      });
    });
  });
});
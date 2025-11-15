import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MockTranslateService } from '../../../../../testing/translate.mock';

import { ProductoEditComponent } from './producto-edit.component';
import { GetProductByIdUseCase } from '../../../../core/application/use-cases/producto/get-product-by-id.use-case';
import { UpdateProductUseCase } from '../../../../core/application/use-cases/producto/update-product.use-case';
import { NotificationService } from '../../../shared/services/notification.service';
import { ProductoDetailedEntity } from '../../../../core/domain/entities/producto.entity';

// Material modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

describe('ProductoEditComponent', () => {
  let component: ProductoEditComponent;
  let fixture: ComponentFixture<ProductoEditComponent>;
  let mockDialogRef: any;
  let mockGetProductByIdUseCase: any;
  let mockUpdateProductUseCase: any;
  let mockNotificationService: any;

  const mockProduct: ProductoDetailedEntity = {
    id: 1,
    sku: 'TEST-001',
    name: 'Test Product',
    description: 'Test Description',
    category: 'Medicamentos',
    subcategory: 'Analgésicos',
    unit_price: 25.99,
    currency: 'USD',
    unit_of_measure: 'unidad',
    supplier_id: 1,
    supplier_name: 'Test Supplier',
    requires_cold_chain: false,
    storage_conditions: {
      temperature_min: 15,
      temperature_max: 25,
      humidity_max: 60
    },
    regulatory_info: {
      sanitary_registration: 'REG-001',
      requires_prescription: false,
      regulatory_class: 'CLASS-A'
    },
    physical_dimensions: {
      weight_kg: 0.5,
      length_cm: 10,
      width_cm: 5,
      height_cm: 2
    },
    manufacturer: 'Test Manufacturer',
    country_of_origin: 'Colombia',
    barcode: '1234567890123',
    image_url: 'https://example.com/test.jpg',
    is_active: true,
    is_discontinued: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
    certifications: [
      {
        id: 1,
        certification_type: 'ISO',
        certification_number: 'ISO-9001',
        certifying_body: 'ISO Organization',
        issue_date: '2024-01-01T00:00:00Z',
        expiry_date: '2027-01-01T00:00:00Z',
        is_valid: true,
        created_at: '2024-01-01T00:00:00Z'
      }
    ],
    regulatory_conditions: [
      {
        id: 1,
        condition_type: 'Storage',
        description: 'Store in cool, dry place',
        authority: 'Health Authority',
        reference_number: 'REF-001',
        effective_date: '2024-01-01T00:00:00Z',
        expiry_date: null,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      }
    ]
  };

  beforeEach(async () => {
    const dialogRefSpy = {
      close: jest.fn()
    };

    const getProductByIdUseCaseSpy = {
      execute: jest.fn()
    };

    const updateProductUseCaseSpy = {
      execute: jest.fn()
    };

    const notificationServiceSpy = {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        ProductoEditComponent,
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
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { productId: 1 } },
        { provide: GetProductByIdUseCase, useValue: getProductByIdUseCaseSpy },
        { provide: UpdateProductUseCase, useValue: updateProductUseCaseSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: jest.fn() } } } },
        { provide: TranslateService, useClass: MockTranslateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoEditComponent);
    component = fixture.componentInstance;
    mockDialogRef = TestBed.inject(MatDialogRef);
    mockGetProductByIdUseCase = TestBed.inject(GetProductByIdUseCase);
    mockUpdateProductUseCase = TestBed.inject(UpdateProductUseCase);
    mockNotificationService = TestBed.inject(NotificationService);
    mockNotificationService = TestBed.inject(NotificationService);
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default form values', () => {
      expect(component.productForm).toBeDefined();
      expect(component.productForm.get('currency')?.value).toBe('USD');
      expect(component.productForm.get('is_discontinued')?.value).toBe(false);
    });

    it('should have proper form validation setup', () => {
      const form = component.productForm;
      
      expect(form.get('sku')?.hasError('required')).toBe(true);
      expect(form.get('name')?.hasError('required')).toBe(true);
      expect(form.get('category')?.hasError('required')).toBe(true);
      // unit_price has default value null, so it should have required error
      expect(form.get('unit_price')?.hasError('required')).toBe(true);
      expect(form.get('currency')?.hasError('required')).toBe(false); // has default value 'USD'
      expect(form.get('unit_of_measure')?.hasError('required')).toBe(true);
      // supplier_id has default value null, so it should have required error
      expect(form.get('supplier_id')?.hasError('required')).toBe(true);
    });

    it('should initialize arrays with correct values', () => {
      expect(component.categories).toContain('Medicamentos');
      expect(component.categories).toContain('Instrumental');
      expect(component.unitsOfMeasure).toContain('unidad');
      expect(component.unitsOfMeasure).toContain('caja');
      expect(component.currencies).toContain('COP');
    });
  });

  describe('ngOnInit', () => {
    it('should load product on initialization with valid ID', () => {
      mockGetProductByIdUseCase.execute.mockReturnValue(of(mockProduct));
      
      component.ngOnInit();
      
      expect(component.productId).toBe(1);
      expect(mockGetProductByIdUseCase.execute).toHaveBeenCalledWith(1);
    });
  });

  describe('loadProduct', () => {
    beforeEach(() => {
      component.productId = 1;
    });

    it('should load product successfully', () => {
      mockGetProductByIdUseCase.execute.mockReturnValue(of(mockProduct));
      
      component.loadProduct();
      
      expect(component.loadingProduct()).toBe(false);
      expect(component.originalProduct).toEqual(mockProduct);
      expect(component.productForm.get('sku')?.value).toBe(mockProduct.sku);
      expect(component.productForm.get('name')?.value).toBe(mockProduct.name);
    });

    it('should handle loading state correctly', () => {
      const productSubject = new Subject<ProductoDetailedEntity>();
      mockGetProductByIdUseCase.execute.mockReturnValue(productSubject.asObservable());
      
      component.loadProduct();
      
      expect(component.loadingProduct()).toBe(true);
      
      productSubject.next(mockProduct);
      productSubject.complete();
      
      expect(component.loadingProduct()).toBe(false);
    });

    it('should handle error when loading product', () => {
      const errorMessage = 'Product not found';
      mockGetProductByIdUseCase.execute.mockReturnValue(throwError(() => new Error(errorMessage)));
      
      component.loadProduct();
      
      expect(component.loadingProduct()).toBe(false);
      expect(mockNotificationService.error).toHaveBeenCalledWith(`Error al cargar producto: ${errorMessage}`);
      expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });
  });

  describe('populateForm', () => {
    it('should populate form with product data', () => {
      component.populateForm(mockProduct);
      
      expect(component.productForm.get('sku')?.value).toBe(mockProduct.sku);
      expect(component.productForm.get('name')?.value).toBe(mockProduct.name);
      expect(component.productForm.get('description')?.value).toBe(mockProduct.description);
      expect(component.productForm.get('category')?.value).toBe(mockProduct.category);
      expect(component.productForm.get('unit_price')?.value).toBe(mockProduct.unit_price);
      expect(component.productForm.get('currency')?.value).toBe(mockProduct.currency);
      expect(component.productForm.get('requires_cold_chain')?.value).toBe(mockProduct.requires_cold_chain);
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component.productId = 1;
      component.originalProduct = mockProduct;
      component.populateForm(mockProduct);
    });

    it('should submit valid form successfully', () => {
      mockUpdateProductUseCase.execute.mockReturnValue(of(mockProduct));
      
      // Make a change to trigger update
      component.productForm.get('name')?.setValue('Updated Product Name');
      
      component.onSubmit();
      
      expect(component.loading()).toBe(false);
      expect(mockNotificationService.success).toHaveBeenCalledWith('Producto actualizado exitosamente');
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should handle loading state during submission', () => {
      const updateSubject = new Subject<ProductoDetailedEntity>();
      mockUpdateProductUseCase.execute.mockReturnValue(updateSubject.asObservable());
      
      // Make a change to trigger update
      component.productForm.get('name')?.setValue('Updated Product Name');
      
      component.onSubmit();
      
      expect(component.loading()).toBe(true);
      
      updateSubject.next(mockProduct);
      updateSubject.complete();
      
      expect(component.loading()).toBe(false);
    });

    it('should handle submission error', () => {
      const errorMessage = 'Update failed';
      mockUpdateProductUseCase.execute.mockReturnValue(throwError(() => new Error(errorMessage)));
      
      // Make a change to trigger update
      component.productForm.get('name')?.setValue('Updated Product Name');
      
      component.onSubmit();
      
      expect(component.loading()).toBe(false);
      expect(mockNotificationService.error).toHaveBeenCalledWith(`Error al actualizar producto: ${errorMessage}`);
    });

    it('should not submit invalid form', () => {
      component.productForm.get('sku')?.setValue('');
      component.productForm.get('name')?.setValue('');
      
      component.onSubmit();
      
      expect(mockUpdateProductUseCase.execute).not.toHaveBeenCalled();
      expect(mockNotificationService.warning).toHaveBeenCalledWith('Por favor, complete todos los campos requeridos');
    });

    it('should mark form controls as touched when form is invalid', () => {
      component.productForm.get('sku')?.setValue('');
      const skuControl = component.productForm.get('sku');
      expect(skuControl?.touched).toBe(false);
      
      component.onSubmit();
      
      expect(skuControl?.touched).toBe(true);
    });
  });

  describe('getChangedFields', () => {
    beforeEach(() => {
      component.originalProduct = mockProduct;
      component.populateForm(mockProduct);
    });

    it('should return only changed fields', () => {
      component.productForm.get('name')?.setValue('Updated Name');
      component.productForm.get('unit_price')?.setValue(99.99);
      
      const changedFields = component.getChangedFields();
      
      expect(changedFields.name).toBe('Updated Name');
      expect(changedFields.unit_price).toBe(99.99);
      expect(changedFields.sku).toBeUndefined();
    });

    it('should return empty object when no fields changed', () => {
      const changedFields = component.getChangedFields();
      
      expect(Object.keys(changedFields)).toHaveLength(0);
    });

    it('should return all fields when originalProduct is null', () => {
      component.originalProduct = null;
      
      const changedFields = component.getChangedFields();
      
      expect(changedFields.sku).toBe(mockProduct.sku);
      expect(changedFields.name).toBe(mockProduct.name);
    });

    it('should detect boolean field changes correctly', () => {
      component.productForm.get('requires_cold_chain')?.setValue(true);
      component.productForm.get('is_discontinued')?.setValue(true);
      
      const changedFields = component.getChangedFields();
      
      expect(changedFields.requires_cold_chain).toBe(true);
      expect(changedFields.is_discontinued).toBe(true);
    });
  });

  describe('Navigation', () => {
    it('should close dialog with false on cancel', () => {
      component.onCancel();
      
      expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });
  });

  describe('Form Validation', () => {
    it('should validate SKU field', () => {
      const skuControl = component.productForm.get('sku');
      
      skuControl?.setValue('');
      skuControl?.markAsTouched();
      expect(component.getFieldError('sku')).toBe('Este campo es requerido');
      
      skuControl?.setValue('AB');
      expect(component.getFieldError('sku')).toBe('Mínimo 3 caracteres');
      
      skuControl?.setValue('ABC123');
      expect(component.getFieldError('sku')).toBe('');
    });

    it('should validate name field', () => {
      const nameControl = component.productForm.get('name');
      
      nameControl?.setValue('');
      nameControl?.markAsTouched();
      expect(component.getFieldError('name')).toBe('Este campo es requerido');
      
      nameControl?.setValue('A');
      expect(component.getFieldError('name')).toBe('Mínimo 3 caracteres');
      
      nameControl?.setValue('Valid Name');
      expect(component.getFieldError('name')).toBe('');
    });

    it('should validate unit_price field', () => {
      const priceControl = component.productForm.get('unit_price');
      
      priceControl?.setValue('');
      priceControl?.markAsTouched();
      expect(component.getFieldError('unit_price')).toBe('Este campo es requerido');
      
      priceControl?.setValue(0);
      expect(component.getFieldError('unit_price')).toBe('El valor mínimo es 0.01');
      
      priceControl?.setValue(25.99);
      expect(component.getFieldError('unit_price')).toBe('');
    });

    it('should validate supplier_id field', () => {
      const supplierControl = component.productForm.get('supplier_id');
      
      supplierControl?.setValue('');
      supplierControl?.markAsTouched();
      expect(component.getFieldError('supplier_id')).toBe('Este campo es requerido');
      
      supplierControl?.setValue(0);
      expect(component.getFieldError('supplier_id')).toBe('El valor mínimo es 1');
      
      supplierControl?.setValue(1);
      expect(component.getFieldError('supplier_id')).toBe('');
    });

    it('should return empty string for untouched fields', () => {
      const skuControl = component.productForm.get('sku');
      skuControl?.setValue('');
      
      expect(component.getFieldError('sku')).toBe('');
    });

    it('should return empty string for valid fields', () => {
      const skuControl = component.productForm.get('sku');
      skuControl?.setValue('VALID-SKU');
      skuControl?.markAsTouched();
      
      expect(component.getFieldError('sku')).toBe('');
    });
  });

  describe('Private Methods', () => {
    it('should mark all form controls as touched', () => {
      const controls = Object.keys(component.productForm.controls);
      
      // Verify controls are initially untouched
      controls.forEach(key => {
        expect(component.productForm.get(key)?.touched).toBe(false);
      });
      
      // Call private method through public method that uses it
      component.onSubmit();
      
      // Verify all controls are now touched
      controls.forEach(key => {
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
      
      expect(component.categories).toEqual(expectedCategories);
    });

    it('should have all required units of measure', () => {
      const expectedUnits = [
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
      
      expect(component.unitsOfMeasure).toEqual(expectedUnits);
    });

    it('should have all required currencies', () => {
      const expectedCurrencies = ['COP'];
      
      expect(component.currencies).toEqual(expectedCurrencies);
    });
  });
});
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatBadgeModule } from '@angular/material/badge';

// Component and dependencies
import { ProductoDetailComponent } from './producto-detail.component';
import { GetProductByIdUseCase } from '../../../../core/application/use-cases/producto/get-product-by-id.use-case';
import { NotificationService } from '../../../shared/services/notification.service';
import { ProductoDetailedEntity } from '../../../../core/domain/entities/producto.entity';

describe('ProductoDetailComponent', () => {
  let component: ProductoDetailComponent;
  let fixture: ComponentFixture<ProductoDetailComponent>;
  let getProductByIdUseCaseMock: jest.Mocked<GetProductByIdUseCase>;
  let notificationServiceMock: jest.Mocked<NotificationService>;
  let routerMock: jest.Mocked<Router>;
  let activatedRouteMock: any;

  // Mock data
  const mockProduct: ProductoDetailedEntity = {
    id: 1,
    sku: 'MED001',
    name: 'Paracetamol 500mg',
    description: 'Analgésico y antipirético',
    category: 'Medicamentos',
    subcategory: 'Analgésicos',
    unit_price: 2.50,
    currency: 'USD',
    unit_of_measure: 'Caja',
    supplier_id: 1,
    supplier_name: 'Farmacéutica ABC',
    requires_cold_chain: false,
    storage_conditions: {
      temperature_min: 15,
      temperature_max: 25,
      humidity_max: 60
    },
    regulatory_info: {
      sanitary_registration: 'INVIMA123',
      requires_prescription: false,
      regulatory_class: 'OTC'
    },
    physical_dimensions: {
      weight_kg: 0.1,
      length_cm: 10,
      width_cm: 5,
      height_cm: 2
    },
    manufacturer: 'Lab Pharma',
    country_of_origin: 'Colombia',
    barcode: '1234567890',
    image_url: null,
    is_active: true,
    is_discontinued: false,
    certifications: [],
    regulatory_conditions: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  beforeEach(async () => {
    // Create mocks
    getProductByIdUseCaseMock = {
      execute: jest.fn().mockReturnValue(of(mockProduct))
    } as any;

    notificationServiceMock = {
      error: jest.fn(),
      info: jest.fn(),
      success: jest.fn(),
      warning: jest.fn()
    } as any;

    routerMock = {
      navigate: jest.fn()
    } as any;

    activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        ProductoDetailComponent,
        NoopAnimationsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatDividerModule,
        MatProgressBarModule,
        MatGridListModule,
        MatBadgeModule
      ],
      providers: [
        { provide: GetProductByIdUseCase, useValue: getProductByIdUseCaseMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoDetailComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.product()).toBeNull();
      expect(component.loading()).toBe(false);
      expect(component.errorMessage()).toBeNull();
    });

    it('should load product on initialization with valid ID', () => {
      fixture.detectChanges(); // This triggers ngOnInit

      expect(getProductByIdUseCaseMock.execute).toHaveBeenCalledWith(1);
      expect(component.product()).toEqual(mockProduct);
      expect(component.loading()).toBe(false);
    });

    it('should set error message when no ID is provided', () => {
      activatedRouteMock.snapshot.paramMap.get.mockReturnValue(null);
      
      fixture.detectChanges();

      expect(component.errorMessage()).toBe('ID de producto no válido');
      expect(getProductByIdUseCaseMock.execute).not.toHaveBeenCalled();
    });
  });

  describe('Data Loading', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle loading state correctly', () => {
      getProductByIdUseCaseMock.execute.mockReturnValue(of(mockProduct));
      
      component.loadProduct(1);

      expect(component.loading()).toBe(false); // Should be false after observable completes
      expect(component.errorMessage()).toBeNull();
    });

    it('should handle error state correctly', () => {
      const errorMessage = 'Product not found';
      getProductByIdUseCaseMock.execute.mockReturnValue(throwError(() => new Error(errorMessage)));

      component.loadProduct(1);

      expect(component.loading()).toBe(false);
      expect(component.errorMessage()).toBe(errorMessage);
      expect(notificationServiceMock.error).toHaveBeenCalledWith(`Error al cargar el producto: ${errorMessage}`);
    });
  });

  describe('Utility Methods', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return correct temperature range when values are present', () => {
      expect(component.getTemperatureRange()).toBe('15°C - 25°C');
    });

    it('should return null when product is null', () => {
      component.product.set(null);
      expect(component.getTemperatureRange()).toBeNull();
    });

    it('should return null when temperature values are null', () => {
      const productWithNullTemp = {
        ...mockProduct,
        storage_conditions: {
          temperature_min: null,
          temperature_max: null,
          humidity_max: 60
        }
      };
      component.product.set(productWithNullTemp);
      expect(component.getTemperatureRange()).toBeNull();
    });

    it('should format date correctly', () => {
      const formattedDate = component.formatDate('2024-01-01T12:00:00Z');
      expect(formattedDate).toContain('2024');
      expect(formattedDate).toMatch(/enero|january/i); // Accept both Spanish and English
    });

    it('should return N/A for undefined date', () => {
      expect(component.formatDate(undefined)).toBe('N/A');
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should navigate back to products list', () => {
      component.goBack();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/producto-list']);
    });

    it('should navigate to edit product page', () => {
      component.editProduct();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/producto-edit', mockProduct.id]);
    });

    it('should not navigate to edit when product is null', () => {
      component.product.set(null);
      component.editProduct();
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display product name', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain(mockProduct.name);
    });

    it('should display basic product information', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain(mockProduct.sku);
      expect(compiled.textContent).toContain(mockProduct.category);
      expect(compiled.textContent).toContain(mockProduct.supplier_name);
    });

    it('should display price information', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain(mockProduct.currency);
      expect(compiled.textContent).toContain('2.50');
      expect(compiled.textContent).toContain(mockProduct.unit_of_measure);
    });

    it('should show loading bar when loading', () => {
      component.loading.set(true);
      fixture.detectChanges();

      const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
      expect(progressBar).toBeTruthy();
    });

    it('should show error message when error occurs', () => {
      const errorMessage = 'Test error';
      component.errorMessage.set(errorMessage);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain(errorMessage);
    });

    it('should display cold chain badge when required', () => {
      const coldChainProduct = { ...mockProduct, requires_cold_chain: true };
      component.product.set(coldChainProduct);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Cadena de Frío');
    });

    it('should display prescription badge when required', () => {
      const prescriptionProduct = {
        ...mockProduct,
        regulatory_info: { ...mockProduct.regulatory_info, requires_prescription: true }
      };
      component.product.set(prescriptionProduct);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Requiere Receta');
    });
  });

  describe('Component Lifecycle', () => {
    it('should call loadProduct on ngOnInit when ID is available', () => {
      const loadProductSpy = jest.spyOn(component, 'loadProduct');
      component.ngOnInit();
      expect(loadProductSpy).toHaveBeenCalledWith(1);
    });
  });
});
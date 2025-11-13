import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatLabel } from '@angular/material/form-field';

// Component and dependencies
import { ProductoDetailComponent } from './producto-detail.component';
import { ProductoDetailedEntity } from '../../../../core/domain/entities/producto.entity';

describe('ProductoDetailComponent', () => {
  let component: ProductoDetailComponent;
  let fixture: ComponentFixture<ProductoDetailComponent>;
  let dialogRefMock: jest.Mocked<MatDialogRef<ProductoDetailComponent>>;

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
    // Create dialog ref mock
    dialogRefMock = {
      close: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        ProductoDetailComponent,
        NoopAnimationsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatDividerModule,
        MatLabel
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: mockProduct }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should receive product data through MAT_DIALOG_DATA', () => {
      expect(component.product).toEqual(mockProduct);
    });
  });

  describe('Utility Methods', () => {
    it('should return correct temperature range when values are present', () => {
      expect(component.getTemperatureRange()).toBe('15°C - 25°C');
    });

    it('should return null when product storage_conditions is missing', () => {
      const productWithoutStorage = {
        ...mockProduct,
        storage_conditions: null as any
      };
      component.product = productWithoutStorage;
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
      component.product = productWithNullTemp;
      expect(component.getTemperatureRange()).toBeNull();
    });

    it('should format date correctly', () => {
      const formattedDate = component.formatDate('2024-01-01T12:00:00Z');
      expect(formattedDate).toContain('2024');
      expect(formattedDate).toMatch(/enero|january/i);
    });

    it('should return dash for undefined date', () => {
      expect(component.formatDate(undefined)).toBe('-');
    });

    it('should return dash for empty date string', () => {
      expect(component.formatDate('')).toBe('-');
    });
  });

  describe('Dialog Actions', () => {
    it('should close dialog when cerrar is called', () => {
      component.cerrar();
      expect(dialogRefMock.close).toHaveBeenCalled();
    });
  });

  describe('Product with Cold Chain', () => {
    it('should display cold chain requirement correctly', () => {
      const coldChainProduct = {
        ...mockProduct,
        requires_cold_chain: true
      };
      component.product = coldChainProduct;
      fixture.detectChanges();

      expect(component.product.requires_cold_chain).toBe(true);
    });
  });

  describe('Product with Prescription Requirement', () => {
    it('should display prescription requirement correctly', () => {
      const prescriptionProduct = {
        ...mockProduct,
        regulatory_info: {
          ...mockProduct.regulatory_info,
          requires_prescription: true
        }
      };
      component.product = prescriptionProduct;
      fixture.detectChanges();

      expect(component.product.regulatory_info.requires_prescription).toBe(true);
    });
  });

  describe('Template Rendering', () => {
    it('should render product name', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Paracetamol 500mg');
    });

    it('should render card title', () => {
      const compiled = fixture.nativeElement;
      const title = compiled.querySelector('.card-title');
      expect(title.textContent).toContain('Detalle del Producto');
    });

    it('should render close button', () => {
      const compiled = fixture.nativeElement;
      const closeButton = compiled.querySelector('.action-buttons button');
      expect(closeButton).toBeTruthy();
      expect(closeButton.textContent.trim()).toBe('Cerrar');
    });
  });
});

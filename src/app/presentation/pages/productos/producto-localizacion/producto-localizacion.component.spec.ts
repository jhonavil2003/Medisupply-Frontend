import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MockTranslateService } from '../../../../../testing/translate.mock';

import { ProductoLocalizacionComponent } from './producto-localizacion.component';
import { SearchProductLocationUseCase } from '../../../../core/application/use-cases/product-location/product-location.use-cases';
import { NotificationService } from '../../../shared/services/notification.service';
import { ProductLocationItem, ProductLocationResponse } from '../../../../core/domain/entities/product-location.entity';

// Test Host Component para simular el entorno del componente
@Component({
  template: '<app-producto-localizacion></app-producto-localizacion>'
})
class TestHostComponent {}

describe('ProductoLocalizacionComponent', () => {
  let component: ProductoLocalizacionComponent;
  let fixture: ComponentFixture<ProductoLocalizacionComponent>;
  let mockSearchUseCase: jest.Mocked<SearchProductLocationUseCase>;
  let mockNotificationService: jest.Mocked<NotificationService>;

  // Mock data
  const mockLocation: ProductLocationItem = {
    batch: {
      id: 1,
      product_sku: 'TEST-001',
      location_id: 1,
      distribution_center_id: 1,
      batch_info: {
        barcode: '123456789',
        batch_number: 'BATCH-001',
        internal_code: 'INT-001',
        qr_code: 'QR-001',
        quantity: 100
      },
      dates: {
        days_until_expiry: 30,
        expiry_date: '2024-12-31',
        manufactured_date: '2024-01-01'
      },
      status: {
        expiry_status: 'valid',
        is_available: true,
        is_expired: false,
        is_near_expiry: false,
        is_quarantine: false
      },
      temperature_requirements: {
        min: 2,
        max: 8,
        range: '2-8°C'
      },
      notes: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      created_by: null
    },
    physical_location: {
      location_code: 'A1-B2-C3',
      aisle: 'A1',
      shelf: 'B2',
      level_position: 'C3',
      zone_type: 'refrigerated',
      is_refrigerated: true
    },
    distribution_center: {
      id: 1,
      code: 'DC001',
      name: 'Centro Principal',
      city: 'Bogotá',
      supports_cold_chain: true
    }
  };

  const mockExpiredLocation: ProductLocationItem = {
    ...mockLocation,
    batch: {
      ...mockLocation.batch,
      id: 2,
      product_sku: 'TEST-002',
      batch_info: {
        ...mockLocation.batch.batch_info,
        batch_number: 'BATCH-002'
      },
      dates: {
        ...mockLocation.batch.dates,
        days_until_expiry: -365,
        expiry_date: '2023-01-01'
      },
      status: {
        ...mockLocation.batch.status,
        expiry_status: 'expired',
        is_expired: true,
        is_available: false
      }
    }
  };

  const mockResponse: ProductLocationResponse = {
    found: true,
    product_skus: ['TEST-001'],
    total_locations: 1,
    total_quantity: 100,
    ordering: 'fefo',
    locations: [mockLocation],
    search_criteria: {
      search_term: 'TEST-001',
      product_sku: null,
      barcode: null,
      qr_code: null,
      internal_code: null,
      batch_number: null,
      distribution_center_id: null,
      zone_type: null,
      only_available: true,
      include_expired: false,
      include_quarantine: false,
      expiry_date_from: null,
      expiry_date_to: null
    },
    timestamp: '2024-01-01T00:00:00Z'
  };

  beforeEach(async () => {
    // Create mocks
    mockSearchUseCase = {
      execute: jest.fn()
    } as any;

    mockNotificationService = {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        ProductoLocalizacionComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: SearchProductLocationUseCase, useValue: mockSearchUseCase },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: TranslateService, useClass: MockTranslateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoLocalizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.locations()).toEqual([]);
      expect(component.loading()).toBe(false);
      expect(component.errorMessage()).toBeNull();
      expect(component.selectedLocation()).toBeNull();
      expect(component.searchPerformed()).toBe(false);
    });

    it('should initialize form controls with default values', () => {
      expect(component.searchControl.value).toBe('');
      expect(component.orderByControl.value).toBe('fefo');
    });

    it('should have correct displayed columns', () => {
      expect(component.displayedColumns).toEqual([
        'product_sku',
        'batch_number',
        'location',
        'quantity',
        'expiry_date',
        'zone_type',
        'temperature',
        'distribution_center',
        'status',
        'acciones'
      ]);
    });

    it('should initialize data source', () => {
      expect(component.dataSource).toBeDefined();
      expect(component.dataSource.data).toEqual([]);
    });
  });

  describe('ngAfterViewInit', () => {
    it('should setup data source paginator and sort', () => {
      // Trigger ngAfterViewInit
      component.ngAfterViewInit();

      expect(component.dataSource.paginator).toBe(component.paginator);
      expect(component.dataSource.sort).toBe(component.sort);
    });

    it('should setup search listener', () => {
      const setupSearchSpy = jest.spyOn(component, 'setupSearchListener');
      component.ngAfterViewInit();
      expect(setupSearchSpy).toHaveBeenCalled();
    });
  });

  describe('Search Functionality', () => {
    it('should setup search listener with debounce', fakeAsync(() => {
      const searchSpy = jest.spyOn(component, 'search');
      mockSearchUseCase.execute.mockReturnValue(of(mockResponse));
      
      component.setupSearchListener();
      
      // Set search value that meets minimum length
      component.searchControl.setValue('TEST001');
      tick(400);

      expect(searchSpy).toHaveBeenCalled();
    }));

    it('should not trigger search with less than 3 characters', fakeAsync(() => {
      const searchSpy = jest.spyOn(component, 'search');
      
      component.setupSearchListener();
      
      // Set search value that doesn't meet minimum length
      component.searchControl.setValue('TE');
      tick(400);

      expect(searchSpy).not.toHaveBeenCalled();
    }));

    it('should perform search successfully', () => {
      mockSearchUseCase.execute.mockReturnValue(of(mockResponse));

      component.searchControl.setValue('TEST001');
      component.search();

      expect(component.loading()).toBe(false);
      expect(component.locations()).toEqual(mockResponse.locations);
      expect(component.dataSource.data).toEqual(mockResponse.locations);
      expect(mockNotificationService.success).toHaveBeenCalledWith('Se encontraron 1 ubicaciones');
    });

    it('should handle search with no results', () => {
      const emptyResponse: ProductLocationResponse = {
        found: false,
        product_skus: [],
        total_locations: 0,
        total_quantity: 0,
        ordering: 'fefo',
        locations: [],
        search_criteria: {
          search_term: 'TEST-999',
          product_sku: null,
          barcode: null,
          qr_code: null,
          internal_code: null,
          batch_number: null,
          distribution_center_id: null,
          zone_type: null,
          only_available: true,
          include_expired: false,
          include_quarantine: false,
          expiry_date_from: null,
          expiry_date_to: null
        },
        timestamp: '2024-01-01T00:00:00Z'
      };
      
      mockSearchUseCase.execute.mockReturnValue(of(emptyResponse));

      component.searchControl.setValue('TEST999');
      component.search();

      expect(component.locations()).toEqual([]);
      expect(component.dataSource.data).toEqual([]);
      expect(mockNotificationService.info).toHaveBeenCalledWith('No se encontraron ubicaciones para este producto');
    });

    it('should handle search error', () => {
      const error = new Error('Network error');
      mockSearchUseCase.execute.mockReturnValue(throwError(() => error));

      component.searchControl.setValue('TEST001');
      component.search();

      expect(component.loading()).toBe(false);
      expect(component.errorMessage()).toBe('Network error');
      expect(component.locations()).toEqual([]);
      expect(component.dataSource.data).toEqual([]);
      expect(mockNotificationService.error).toHaveBeenCalledWith('Network error');
    });

    it('should show warning for search term less than 3 characters', () => {
      component.searchControl.setValue('TE');
      component.search();

      expect(mockNotificationService.warning).toHaveBeenCalledWith('Ingrese al menos 3 caracteres para buscar');
      expect(mockSearchUseCase.execute).not.toHaveBeenCalled();
    });

    it('should show warning for empty search term', () => {
      component.searchControl.setValue('');
      component.search();

      expect(mockNotificationService.warning).toHaveBeenCalledWith('Ingrese al menos 3 caracteres para buscar');
      expect(mockSearchUseCase.execute).not.toHaveBeenCalled();
    });

    it('should handle search with whitespace only', () => {
      component.searchControl.setValue('   ');
      component.search();

      expect(mockNotificationService.warning).toHaveBeenCalledWith('Ingrese al menos 3 caracteres para buscar');
      expect(mockSearchUseCase.execute).not.toHaveBeenCalled();
    });

    it('should set loading state correctly during search', () => {
      mockSearchUseCase.execute.mockReturnValue(of(mockResponse));

      expect(component.loading()).toBe(false);
      
      component.searchControl.setValue('TEST001');
      component.search();

      // During search, loading should be set then unset
      expect(component.loading()).toBe(false); // After completion
      expect(component.searchPerformed()).toBe(true);
    });
  });

  describe('Computed Properties', () => {
    beforeEach(() => {
      const locations = [mockLocation, mockExpiredLocation];
      component.locations.set(locations);
    });

    it('should calculate total quantity correctly', () => {
      expect(component.totalQuantity()).toBe(200); // 100 + 100
    });

    it('should calculate total locations correctly', () => {
      expect(component.totalLocations()).toBe(2);
    });

    it('should calculate refrigerated zones correctly', () => {
      expect(component.refrigeratedZones()).toBe(2);
    });

    it('should determine if has results', () => {
      expect(component.hasResults()).toBe(true);
      
      component.locations.set([]);
      expect(component.hasResults()).toBe(false);
    });
  });

  describe('Detail Management', () => {
    it('should show location detail', () => {
      component.verDetalle(mockLocation);
      expect(component.selectedLocation()).toBe(mockLocation);
    });

    it('should close detail view', () => {
      component.selectedLocation.set(mockLocation);
      component.cerrarDetalle();
      expect(component.selectedLocation()).toBeNull();
    });
  });

  describe('Utility Methods', () => {
    it('should return correct location code', () => {
      const result = component.getLocationCode(mockLocation);
      expect(result).toBe('A1-B2-C3');
    });

    it('should return full location string', () => {
      const result = component.getFullLocation(mockLocation);
      expect(result).toBe('Pasillo A1 - Estante B2 - Nivel C3');
    });

    it('should return correct zone icon for refrigerated', () => {
      const result = component.getZoneIcon(mockLocation);
      expect(result).toBe('❄️');
    });

    it('should return correct zone icon for non-refrigerated', () => {
      const nonRefrigerated = {
        ...mockLocation,
        physical_location: {
          ...mockLocation.physical_location,
          is_refrigerated: false,
          zone_type: 'ambient' as const
        }
      };
      
      const result = component.getZoneIcon(nonRefrigerated);
      expect(result).toBe('🌡️');
    });

    it('should return correct zone label for refrigerated', () => {
      const result = component.getZoneLabel(mockLocation);
      expect(result).toBe('Refrigerado');
    });

    it('should return correct zone label for ambient', () => {
      const ambientLocation = {
        ...mockLocation,
        physical_location: {
          ...mockLocation.physical_location,
          zone_type: 'ambient' as const
        }
      };
      
      const result = component.getZoneLabel(ambientLocation);
      expect(result).toBe('Ambiente');
    });

    it('should return correct status chip color for expired', () => {
      const result = component.getStatusChipColor(mockExpiredLocation);
      expect(result).toBe('warn');
    });

    it('should return correct status chip color for unavailable', () => {
      const unavailableLocation = {
        ...mockLocation,
        batch: {
          ...mockLocation.batch,
          status: {
            ...mockLocation.batch.status,
            is_available: false,
            is_expired: false
          }
        }
      };
      
      const result = component.getStatusChipColor(unavailableLocation);
      expect(result).toBe('basic');
    });

    it('should return correct status chip color for available', () => {
      const result = component.getStatusChipColor(mockLocation);
      expect(result).toBe('primary');
    });

    it('should return correct status label for expired', () => {
      const result = component.getStatusLabel(mockExpiredLocation);
      expect(result).toBe('Vencido');
    });

    it('should return correct status label for unavailable', () => {
      const unavailableLocation = {
        ...mockLocation,
        batch: {
          ...mockLocation.batch,
          status: {
            ...mockLocation.batch.status,
            is_available: false,
            is_expired: false
          }
        }
      };
      
      const result = component.getStatusLabel(unavailableLocation);
      expect(result).toBe('No Disponible');
    });

    it('should return correct status label for available', () => {
      const result = component.getStatusLabel(mockLocation);
      expect(result).toBe('Disponible');
    });

    it('should return temperature status', () => {
      const result = component.getTemperatureStatus(mockLocation);
      expect(result).toBe('2-8°C');
    });

    it('should return N/A for missing temperature range', () => {
      const noTempLocation = {
        ...mockLocation,
        batch: {
          ...mockLocation.batch,
          temperature_requirements: {
            min: null,
            max: null,
            range: null
          }
        }
      };
      
      const result = component.getTemperatureStatus(noTempLocation);
      expect(result).toBe('N/A');
    });

    it('should return temperature color', () => {
      const result = component.getTemperatureColor(mockLocation);
      expect(result).toBe('primary');
    });

    it('should calculate days until expiry correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      const result = component.getDaysUntilExpiry(futureDateString);
      expect(result).toBeCloseTo(30, 0);
    });

    it('should return negative days for expired products', () => {
      const result = component.getDaysUntilExpiry('2023-01-01');
      expect(result).toBeLessThan(0);
    });

    it('should return correct expiry color for expired', () => {
      const result = component.getExpiryColor('2023-01-01');
      expect(result).toBe('warn');
    });

    it('should return correct expiry color for near expiry', () => {
      const nearExpiryDate = new Date();
      nearExpiryDate.setDate(nearExpiryDate.getDate() + 15);
      const nearExpiryString = nearExpiryDate.toISOString().split('T')[0];
      
      const result = component.getExpiryColor(nearExpiryString);
      expect(result).toBe('accent');
    });

    it('should return correct expiry color for far expiry', () => {
      const farExpiryDate = new Date();
      farExpiryDate.setDate(farExpiryDate.getDate() + 60);
      const farExpiryString = farExpiryDate.toISOString().split('T')[0];
      
      const result = component.getExpiryColor(farExpiryString);
      expect(result).toBe('primary');
    });
  });

  describe('Clipboard Functionality', () => {
    it('should copy location to clipboard', async () => {
      // Mock clipboard API
      const mockClipboard = {
        writeText: jest.fn().mockResolvedValue(undefined)
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      component.copiarUbicacion('A1-B2-C3');

      expect(mockClipboard.writeText).toHaveBeenCalledWith('A1-B2-C3');
      expect(mockNotificationService.success).toHaveBeenCalledWith('Ubicación A1-B2-C3 copiada al portapapeles');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset search and clear all data', () => {
      // Set some data first
      component.locations.set([mockLocation]);
      component.dataSource.data = [mockLocation];
      component.errorMessage.set('Some error');
      component.selectedLocation.set(mockLocation);
      component.searchPerformed.set(true);
      component.searchControl.setValue('TEST001');

      // Reset
      component.resetSearch();

      expect(component.searchControl.value).toBe('');
      expect(component.locations()).toEqual([]);
      expect(component.dataSource.data).toEqual([]);
      expect(component.errorMessage()).toBeNull();
      expect(component.selectedLocation()).toBeNull();
      expect(component.searchPerformed()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle use case execution error', () => {
      const error = new Error('Service unavailable');
      mockSearchUseCase.execute.mockReturnValue(throwError(() => error));

      component.searchControl.setValue('TEST001');
      component.search();

      expect(component.loading()).toBe(false);
      expect(component.errorMessage()).toBe('Service unavailable');
      expect(component.locations()).toEqual([]);
      expect(mockNotificationService.error).toHaveBeenCalledWith('Service unavailable');
    });

    it('should log error to console', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');
      mockSearchUseCase.execute.mockReturnValue(throwError(() => error));

      component.searchControl.setValue('TEST001');
      component.search();

      expect(consoleSpy).toHaveBeenCalledWith('Error al buscar ubicación:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete search workflow', fakeAsync(() => {
      mockSearchUseCase.execute.mockReturnValue(of(mockResponse));

      // Setup search listener
      component.setupSearchListener();

      // Perform search via form control
      component.searchControl.setValue('TEST001');
      tick(400);

      // Verify results
      expect(component.locations()).toEqual(mockResponse.locations);
      expect(component.dataSource.data).toEqual(mockResponse.locations);
      expect(component.searchPerformed()).toBe(true);
      expect(mockNotificationService.success).toHaveBeenCalled();
    }));

    it('should handle error in search workflow', fakeAsync(() => {
      const error = new Error('Network error');
      mockSearchUseCase.execute.mockReturnValue(throwError(() => error));

      component.setupSearchListener();
      component.searchControl.setValue('TEST001');
      tick(400);

      expect(component.errorMessage()).toBe('Network error');
      expect(component.locations()).toEqual([]);
      expect(mockNotificationService.error).toHaveBeenCalled();
    }));

    it('should maintain state consistency during multiple operations', () => {
      // Initial search
      mockSearchUseCase.execute.mockReturnValue(of(mockResponse));
      component.searchControl.setValue('TEST001');
      component.search();

      expect(component.locations()).toEqual(mockResponse.locations);

      // Select location
      component.verDetalle(mockLocation);
      expect(component.selectedLocation()).toBe(mockLocation);

      // Reset
      component.resetSearch();
      expect(component.locations()).toEqual([]);
      expect(component.selectedLocation()).toBeNull();
    });
  });

  describe('Component Lifecycle', () => {
    it('should setup search listener on initialization', () => {
      const setupSearchSpy = jest.spyOn(component, 'setupSearchListener');
      component.ngAfterViewInit();
      expect(setupSearchSpy).toHaveBeenCalled();
    });

    it('should setup data source after view init', () => {
      component.ngAfterViewInit();
      expect(component.dataSource.paginator).toBe(component.paginator);
      expect(component.dataSource.sort).toBe(component.sort);
    });
  });
});
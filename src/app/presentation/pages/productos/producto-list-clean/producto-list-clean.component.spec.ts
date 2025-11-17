import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError, Subject } from 'rxjs';

import { ProductoListCleanComponent } from './producto-list-clean.component';
import { GetAllProductosUseCase } from '../../../../core/application/use-cases/producto/get-products.use-case';
import { SearchProductosUseCase } from '../../../../core/application/use-cases/producto/search-products.use-case';
import { NotificationService } from '../../../shared/services/notification.service';
import { ProductoEntity, ProductListResponse, Pagination } from '../../../../core/domain/entities/producto.entity';

// Material modules
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';

describe('ProductoListCleanComponent', () => {
  let component: ProductoListCleanComponent;
  let fixture: ComponentFixture<ProductoListCleanComponent>;
  let mockGetAllProductosUseCase: any;
  let mockSearchProductosUseCase: any;
  let mockNotificationService: any;

  const mockProducts: ProductoEntity[] = [
    {
      id: 1,
      sku: 'CLEAN-001',
      name: 'Clean Product 1',
      description: 'Clean test product 1',
      category: 'Medicamentos',
      subcategory: 'Analgésicos',
      unit_price: 99.99,
      currency: 'USD',
      unit_of_measure: 'unidad',
      supplier_id: 1,
      supplier_name: 'Clean Supplier 1',
      requires_cold_chain: true,
      storage_conditions: {
        temperature_min: 2,
        temperature_max: 8,
        humidity_max: 70
      },
      regulatory_info: {
        sanitary_registration: 'REG-CLEAN-001',
        requires_prescription: true,
        regulatory_class: 'CLASS-A'
      },
      physical_dimensions: {
        weight_kg: 0.5,
        length_cm: 10,
        width_cm: 5,
        height_cm: 2
      },
      manufacturer: 'Clean Manufacturer',
      country_of_origin: 'Colombia',
      barcode: '1234567890123',
      image_url: 'https://example.com/clean1.jpg',
      is_active: true,
      is_discontinued: false,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z'
    },
    {
      id: 2,
      sku: 'CLEAN-002',
      name: 'Clean Product 2',
      description: 'Clean test product 2',
      category: 'Instrumental',
      subcategory: 'Quirúrgico',
      unit_price: 199.99,
      currency: 'USD',
      unit_of_measure: 'caja',
      supplier_id: 2,
      supplier_name: 'Clean Supplier 2',
      requires_cold_chain: false,
      storage_conditions: {
        temperature_min: 15,
        temperature_max: 25,
        humidity_max: 60
      },
      regulatory_info: {
        sanitary_registration: 'REG-CLEAN-002',
        requires_prescription: false,
        regulatory_class: 'CLASS-B'
      },
      physical_dimensions: {
        weight_kg: 1.2,
        length_cm: 20,
        width_cm: 10,
        height_cm: 5
      },
      manufacturer: 'Instrument Manufacturer',
      country_of_origin: 'Germany',
      barcode: '9876543210987',
      image_url: 'https://example.com/clean2.jpg',
      is_active: true,
      is_discontinued: false,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z'
    }
  ];

  const mockPagination: Pagination = {
    page: 1,
    per_page: 20,
    total_pages: 1,
    total_items: 2,
    has_next: false,
    has_prev: false
  };

  const mockResponse: ProductListResponse = {
    products: mockProducts,
    pagination: mockPagination
  };

  beforeEach(async () => {
    const getAllProductosUseCaseSpy = {
      execute: jest.fn()
    };

    const searchProductosUseCaseSpy = {
      execute: jest.fn()
    };

    const notificationServiceSpy = {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        ProductoListCleanComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        RouterTestingModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatProgressBarModule,
        MatChipsModule,
        MatCheckboxModule
      ],
      providers: [
        { provide: GetAllProductosUseCase, useValue: getAllProductosUseCaseSpy },
        { provide: SearchProductosUseCase, useValue: searchProductosUseCaseSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoListCleanComponent);
    component = fixture.componentInstance;
    mockGetAllProductosUseCase = TestBed.inject(GetAllProductosUseCase);
    mockSearchProductosUseCase = TestBed.inject(SearchProductosUseCase);
    mockNotificationService = TestBed.inject(NotificationService);
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.products()).toEqual([]);
      expect(component.pagination()).toBeNull();
      expect(component.loading()).toBe(false);
      expect(component.errorMessage()).toBeNull();
    });

    it('should initialize form controls with default values', () => {
      expect(component.searchControl.value).toBe('');
      expect(component.filterForm.get('category')?.value).toBe('');
      expect(component.filterForm.get('is_active')?.value).toBe(true);
      expect(component.filterForm.get('per_page')?.value).toBe(20);
    });

    it('should have correct categories array', () => {
      const expectedCategories = [
        'Instrumental',
        'Medicamentos',
        'Protección Personal',
        'Equipos Médicos'
      ];
      expect(component.categories).toEqual(expectedCategories);
    });

    it('should have correct displayed columns', () => {
      const expectedColumns = ['sku', 'name', 'category', 'supplier_name', 'unit_price', 'cold_chain', 'is_active', 'acciones'];
      expect(component.displayedColumns).toEqual(expectedColumns);
    });
  });

  describe('ngOnInit', () => {
    it('should load products and setup search listener on init', () => {
      mockGetAllProductosUseCase.execute.mockReturnValue(of(mockResponse));
      const loadProductsSpy = jest.spyOn(component, 'loadProducts');
      const setupSearchListenerSpy = jest.spyOn(component, 'setupSearchListener');

      component.ngOnInit();

      expect(loadProductsSpy).toHaveBeenCalledWith(1);
      expect(setupSearchListenerSpy).toHaveBeenCalled();
    });
  });

  describe('ngAfterViewInit', () => {
    it('should setup data source paginator and sort', () => {
      component.ngAfterViewInit();

      expect(component.dataSource.paginator).toBe(component.paginator);
      expect(component.dataSource.sort).toBe(component.sort);
    });
  });

  describe('Data Loading', () => {
    it('should load products successfully', () => {
      mockGetAllProductosUseCase.execute.mockReturnValue(of(mockResponse));

      component.loadProducts();

      expect(component.loading()).toBe(false);
      expect(component.products()).toEqual(mockProducts);
      expect(component.pagination()).toEqual(mockPagination);
      expect(component.dataSource.data).toEqual(mockProducts);
      expect(component.errorMessage()).toBeNull();
    });

    it('should handle loading state correctly', () => {
      const productSubject = new Subject<ProductListResponse>();
      mockGetAllProductosUseCase.execute.mockReturnValue(productSubject.asObservable());

      component.loadProducts();

      expect(component.loading()).toBe(true);
      expect(component.errorMessage()).toBeNull();

      productSubject.next(mockResponse);
      productSubject.complete();

      expect(component.loading()).toBe(false);
    });

    it('should handle error state correctly', () => {
      const errorMessage = 'Failed to load products';
      mockGetAllProductosUseCase.execute.mockReturnValue(throwError(() => new Error(errorMessage)));

      component.loadProducts();

      expect(component.loading()).toBe(false);
      expect(component.errorMessage()).toBe(errorMessage);
      expect(mockNotificationService.error).toHaveBeenCalledWith(errorMessage);
    });

    it('should load products with specific page', () => {
      mockGetAllProductosUseCase.execute.mockReturnValue(of(mockResponse));

      component.loadProducts(2);

      expect(mockGetAllProductosUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });

    it('should include current filters when loading products', () => {
      mockGetAllProductosUseCase.execute.mockReturnValue(of(mockResponse));
      
      component.searchControl.setValue('test search');
      component.filterForm.patchValue({
        category: 'Medicamentos',
        requires_cold_chain: true
      });

      component.loadProducts();

      expect(mockGetAllProductosUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'test search',
          category: 'Medicamentos',
          requires_cold_chain: true,
          page: 1
        })
      );
    });
  });

  describe('Search Functionality', () => {
    it('should setup search listener with debounce', fakeAsync(() => {
      mockGetAllProductosUseCase.execute.mockReturnValue(of(mockResponse));
      const loadProductsSpy = jest.spyOn(component, 'loadProducts');

      component.setupSearchListener();

      // First search
      component.searchControl.setValue('test');
      tick(250); // Less than debounce time
      expect(loadProductsSpy).not.toHaveBeenCalled();

      tick(100); // Complete debounce time (300ms total)
      expect(loadProductsSpy).toHaveBeenCalledWith(1);

      // Second search with same value (should not trigger due to distinctUntilChanged)
      loadProductsSpy.mockClear();
      component.searchControl.setValue('test');
      tick(300);
      expect(loadProductsSpy).not.toHaveBeenCalled();

      // Third search with different value
      component.searchControl.setValue('new search');
      tick(300);
      expect(loadProductsSpy).toHaveBeenCalledWith(1);
    }));
  });

  describe('Filter Functionality', () => {
    it('should trigger product reload on filter change', () => {
      mockGetAllProductosUseCase.execute.mockReturnValue(of(mockResponse));
      const loadProductsSpy = jest.spyOn(component, 'loadProducts');

      component.onFilterChange();

      expect(loadProductsSpy).toHaveBeenCalledWith(1);
    });

    it('should reset filters to default values', () => {
      mockGetAllProductosUseCase.execute.mockReturnValue(of(mockResponse));
      
      // Set some filter values
      component.searchControl.setValue('test search');
      component.filterForm.patchValue({
        category: 'Medicamentos',
        subcategory: 'Analgésicos',
        requires_cold_chain: true,
        is_active: false,
        per_page: 50
      });

      component.resetFilters();

      expect(component.searchControl.value).toBe('');
      expect(component.filterForm.get('category')?.value).toBeNull();
      expect(component.filterForm.get('subcategory')?.value).toBeNull();
      expect(component.filterForm.get('requires_cold_chain')?.value).toBeNull();
      expect(component.filterForm.get('is_active')?.value).toBe(true);
      expect(component.filterForm.get('per_page')?.value).toBe(20);
    });

    it('should compute current filters correctly', () => {
      component.searchControl.setValue('search term');
      component.filterForm.patchValue({
        category: 'Medicamentos',
        subcategory: '',
        requires_cold_chain: true,
        is_active: false,
        per_page: 30
      });

      const filters = component.currentFilters();

      expect(filters.search).toBe('search term');
      expect(filters.category).toBe('Medicamentos');
      expect(filters.subcategory).toBeUndefined();
      expect(filters.requires_cold_chain).toBe(true);
      expect(filters.is_active).toBe(false);
      expect(filters.per_page).toBe(30);
    });

    it('should filter out empty, null and undefined values from currentFilters', () => {
      component.searchControl.setValue('');
      component.filterForm.patchValue({
        category: '',
        subcategory: null,
        requires_cold_chain: null,
        is_active: true,
        per_page: 20
      });

      const filters = component.currentFilters();

      expect(filters.search).toBeUndefined();
      expect(filters.category).toBeUndefined();
      expect(filters.subcategory).toBeUndefined();
      expect(filters.requires_cold_chain).toBeUndefined();
      expect(filters.is_active).toBe(true);
      expect(filters.per_page).toBe(20);
    });
  });

  describe('Pagination', () => {
    it('should handle page change correctly', () => {
      mockGetAllProductosUseCase.execute.mockReturnValue(of(mockResponse));
      const loadProductsSpy = jest.spyOn(component, 'loadProducts');

      const pageEvent: PageEvent = {
        pageIndex: 1,
        pageSize: 30,
        length: 100
      };

      component.onPageChange(pageEvent);

      expect(component.filterForm.get('per_page')?.value).toBe(30);
      expect(loadProductsSpy).toHaveBeenCalledWith(2); // pageIndex + 1
    });

    it('should handle page size change', () => {
      mockGetAllProductosUseCase.execute.mockReturnValue(of(mockResponse));

      const pageEvent: PageEvent = {
        pageIndex: 0,
        pageSize: 50,
        length: 100
      };

      component.onPageChange(pageEvent);

      expect(component.filterForm.get('per_page')?.value).toBe(50);
    });
  });

  describe('Utility Methods', () => {
    it('should return correct cold chain icon', () => {
      const coldChainProduct = { ...mockProducts[0], requires_cold_chain: true };
      const normalProduct = { ...mockProducts[1], requires_cold_chain: false };

      expect(component.getColdChainIcon(coldChainProduct)).toBe('❄️');
      expect(component.getColdChainIcon(normalProduct)).toBe('');
    });

    it('should return correct prescription icon', () => {
      const prescriptionProduct = {
        ...mockProducts[0],
        regulatory_info: { ...mockProducts[0].regulatory_info, requires_prescription: true }
      };
      const nonPrescriptionProduct = {
        ...mockProducts[1],
        regulatory_info: { ...mockProducts[1].regulatory_info, requires_prescription: false }
      };

      expect(component.getPrescriptionIcon(prescriptionProduct)).toBe('📋');
      expect(component.getPrescriptionIcon(nonPrescriptionProduct)).toBe('');
    });

    it('should return correct temperature range', () => {
      const productWithRange = {
        ...mockProducts[0],
        storage_conditions: {
          temperature_min: 2,
          temperature_max: 8,
          humidity_max: 70
        }
      };

      expect(component.getTemperatureRange(productWithRange)).toBe('2°C - 8°C');
    });

    it('should return null when temperature values are null', () => {
      const productWithoutRange = {
        ...mockProducts[0],
        storage_conditions: {
          temperature_min: null,
          temperature_max: null,
          humidity_max: 70
        }
      };

      expect(component.getTemperatureRange(productWithoutRange)).toBeNull();
    });

    it('should return null when only one temperature value is null', () => {
      const productWithPartialRange = {
        ...mockProducts[0],
        storage_conditions: {
          temperature_min: 2,
          temperature_max: null,
          humidity_max: 70
        }
      };

      expect(component.getTemperatureRange(productWithPartialRange)).toBeNull();
    });

    it('should handle verDetalle method', () => {
      const product = mockProducts[0];

      component.verDetalle(product);

      expect(mockNotificationService.info).toHaveBeenCalledWith(`Ver detalle de: ${product.name}`);
    });
  });

  describe('Component Lifecycle', () => {
    it('should setup search listener on initialization', () => {
      const setupSearchListenerSpy = jest.spyOn(component, 'setupSearchListener');
      mockGetAllProductosUseCase.execute.mockReturnValue(of(mockResponse));

      component.ngOnInit();

      expect(setupSearchListenerSpy).toHaveBeenCalled();
    });

    it('should setup data source after view init', () => {
      component.ngAfterViewInit();

      expect(component.dataSource.paginator).toBe(component.paginator);
      expect(component.dataSource.sort).toBe(component.sort);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', () => {
      const networkError = new Error('Network error');
      mockGetAllProductosUseCase.execute.mockReturnValue(throwError(() => networkError));

      component.loadProducts();

      expect(component.loading()).toBe(false);
      expect(component.errorMessage()).toBe('Network error');
      expect(mockNotificationService.error).toHaveBeenCalledWith('Network error');
    });

    it('should handle service unavailable errors', () => {
      const serviceError = new Error('Service temporarily unavailable');
      mockGetAllProductosUseCase.execute.mockReturnValue(throwError(() => serviceError));

      component.loadProducts();

      expect(component.errorMessage()).toBe('Service temporarily unavailable');
    });
  });

  describe('Data Source Integration', () => {
    it('should update data source when products are loaded', () => {
      mockGetAllProductosUseCase.execute.mockReturnValue(of(mockResponse));

      component.loadProducts();

      expect(component.dataSource.data).toEqual(mockProducts);
      expect(component.dataSource.data.length).toBe(2);
    });

    it('should maintain data source structure', () => {
      expect(component.dataSource).toBeInstanceOf(MatTableDataSource);
      expect(component.displayedColumns).toContain('sku');
      expect(component.displayedColumns).toContain('name');
      expect(component.displayedColumns).toContain('acciones');
    });
  });

  describe('Form Validation', () => {
    it('should have valid initial form state', () => {
      expect(component.filterForm.valid).toBe(true);
      expect(component.searchControl.valid).toBe(true);
    });

    it('should handle form control updates', () => {
      component.filterForm.patchValue({
        category: 'Medicamentos',
        per_page: 50
      });

      expect(component.filterForm.get('category')?.value).toBe('Medicamentos');
      expect(component.filterForm.get('per_page')?.value).toBe(50);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete filter and search workflow', fakeAsync(() => {
      mockGetAllProductosUseCase.execute.mockReturnValue(of(mockResponse));

      // Setup component
      component.ngOnInit();
      tick(100);

      // Apply search
      component.searchControl.setValue('test product');
      tick(300);

      // Apply filters
      component.filterForm.patchValue({
        category: 'Medicamentos',
        requires_cold_chain: true
      });
      component.onFilterChange();
      tick(100);

      // Verify final state
      expect(component.products()).toEqual(mockProducts);
      expect(mockGetAllProductosUseCase.execute).toHaveBeenCalled();
      
      // Check that filters were applied
      expect(component.filterForm.get('category')?.value).toBe('Medicamentos');
      expect(component.filterForm.get('requires_cold_chain')?.value).toBe(true);
      expect(component.searchControl.value).toBe('test product');
    }));

    it('should handle pagination with filters', () => {
      mockGetAllProductosUseCase.execute.mockReturnValue(of(mockResponse));

      // Set filters
      component.searchControl.setValue('filtered search');
      component.filterForm.patchValue({ category: 'Instrumental' });

      // Change page
      const pageEvent: PageEvent = {
        pageIndex: 2,
        pageSize: 25,
        length: 100
      };
      component.onPageChange(pageEvent);

      expect(mockGetAllProductosUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'filtered search',
          category: 'Instrumental',
          page: 3,
          per_page: 25
        })
      );
    });
  });
});
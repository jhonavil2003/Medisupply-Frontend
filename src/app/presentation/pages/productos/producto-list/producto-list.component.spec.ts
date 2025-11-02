import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

// Material Modules
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';

// Component and dependencies
import { ProductoListComponent } from './producto-list.component';
import { GetAllProductosUseCase } from '../../../../core/application/use-cases/producto/get-products.use-case';
import { SearchProductosUseCase } from '../../../../core/application/use-cases/producto/search-products.use-case';
import { DeleteProductUseCase } from '../../../../core/application/use-cases/producto/delete-product.use-case';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { ProductoEntity, ProductListResponse, Pagination } from '../../../../core/domain/entities/producto.entity';
import { Router } from '@angular/router';

describe('ProductoListComponent', () => {
  let component: ProductoListComponent;
  let fixture: ComponentFixture<ProductoListComponent>;
  let getAllProductosUseCaseMock: jest.Mocked<GetAllProductosUseCase>;
  let searchProductosUseCaseMock: jest.Mocked<SearchProductosUseCase>;
  let deleteProductUseCaseMock: jest.Mocked<DeleteProductUseCase>;
  let notificationServiceMock: jest.Mocked<NotificationService>;
  let confirmDialogServiceMock: jest.Mocked<ConfirmDialogService>;
  let routerMock: jest.Mocked<Router>;

  // Mock data
  const mockProducts: ProductoEntity[] = [
    {
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
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  const mockPagination: Pagination = {
    page: 1,
    per_page: 20,
    total_pages: 1,
    total_items: 1,
    has_next: false,
    has_prev: false
  };

  const mockResponse: ProductListResponse = {
    products: mockProducts,
    pagination: mockPagination
  };

  beforeEach(async () => {
    // Create mocks for Jest
    getAllProductosUseCaseMock = {
      execute: jest.fn().mockReturnValue(of(mockResponse))
    } as any;
    
    searchProductosUseCaseMock = {
      execute: jest.fn().mockReturnValue(of(mockResponse))
    } as any;
    
    deleteProductUseCaseMock = {
      execute: jest.fn().mockReturnValue(of(undefined))
    } as any;
    
    notificationServiceMock = {
      error: jest.fn(),
      info: jest.fn(),
      success: jest.fn(),
      warning: jest.fn()
    } as any;

    confirmDialogServiceMock = {
      confirmDelete: jest.fn().mockReturnValue(of(true)),
      confirmAction: jest.fn().mockReturnValue(of(true)),
      confirm: jest.fn().mockReturnValue(of(true))
    } as any;

    routerMock = {
      navigate: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        ProductoListComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatTableModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatProgressBarModule,
        MatChipsModule,
        MatCheckboxModule,
        MatTooltipModule
      ],
      providers: [
        { provide: GetAllProductosUseCase, useValue: getAllProductosUseCaseMock },
        { provide: SearchProductosUseCase, useValue: searchProductosUseCaseMock },
        { provide: DeleteProductUseCase, useValue: deleteProductUseCaseMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: ConfirmDialogService, useValue: confirmDialogServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoListComponent);
    component = fixture.componentInstance;
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
      expect(component.searchControl.value).toBe('');
      expect(component.filterForm.get('is_active')?.value).toBe(true);
      expect(component.filterForm.get('per_page')?.value).toBe(20);
    });
  });

  describe('Data Loading', () => {
    it('should load products on initialization', () => {
      fixture.detectChanges(); // This triggers ngOnInit
      
      expect(getAllProductosUseCaseMock.execute).toHaveBeenCalled();
      expect(component.products()).toEqual(mockProducts);
      expect(component.pagination()).toEqual(mockPagination);
      expect(component.loading()).toBe(false);
    });

    it('should handle loading state correctly', () => {
      component.loadProducts();
      
      expect(component.loading()).toBe(false); // Should be false after observable completes
      expect(component.errorMessage()).toBeNull();
    });

    it('should handle error state correctly', () => {
      const errorMessage = 'Error loading products';
      getAllProductosUseCaseMock.execute.mockReturnValue(throwError(() => new Error(errorMessage)));
      
      component.loadProducts();
      
      expect(component.loading()).toBe(false);
      expect(component.errorMessage()).toBe(errorMessage);
      expect(notificationServiceMock.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should trigger search when search control value changes with debounce', fakeAsync(() => {
      // Reset call count
      getAllProductosUseCaseMock.execute.mockClear();
      
      component.searchControl.setValue('Paracetamol');
      
      // Before debounce time, shouldn't call
      expect(getAllProductosUseCaseMock.execute).not.toHaveBeenCalled();
      
      // After debounce time, should call
      tick(300);
      
      expect(getAllProductosUseCaseMock.execute).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Paracetamol' })
      );
    }));

    it('should clear search when reset is called', () => {
      component.searchControl.setValue('test');
      component.resetFilters();
      
      expect(component.searchControl.value).toBe('');
      expect(getAllProductosUseCaseMock.execute).toHaveBeenCalled();
    });
  });

  describe('Filter Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should apply category filter', () => {
      component.filterForm.patchValue({ category: 'Medicamentos' });
      component.onFilterChange();
      
      expect(getAllProductosUseCaseMock.execute).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'Medicamentos' })
      );
    });

    it('should apply cold chain filter', () => {
      component.filterForm.patchValue({ requires_cold_chain: true });
      component.onFilterChange();
      
      expect(getAllProductosUseCaseMock.execute).toHaveBeenCalledWith(
        expect.objectContaining({ requires_cold_chain: true })
      );
    });

    it('should reset filters to default values', () => {
      component.filterForm.patchValue({
        category: 'Medicamentos',
        subcategory: 'Test',
        requires_cold_chain: true
      });
      
      component.resetFilters();
      
      expect(component.filterForm.get('category')?.value).toBeNull();
      expect(component.filterForm.get('subcategory')?.value).toBeNull();
      expect(component.filterForm.get('requires_cold_chain')?.value).toBeNull();
      expect(component.filterForm.get('is_active')?.value).toBe(true);
      expect(component.filterForm.get('per_page')?.value).toBe(20);
    });

    it('should filter out empty, null and undefined values from currentFilters', () => {
      component.searchControl.setValue('');
      component.filterForm.patchValue({
        category: '',
        subcategory: null,
        requires_cold_chain: undefined,
        is_active: true
      });

      const filters = component.currentFilters();
      
      expect(filters.search).toBeUndefined();
      expect(filters.category).toBeUndefined();
      expect(filters.subcategory).toBeUndefined();
      expect(filters.requires_cold_chain).toBeUndefined();
      expect(filters.is_active).toBe(true);
    });

    it('should use default values when form values are falsy', () => {
      // Test fallback values in currentFilters
      component.searchControl.setValue(null);
      component.filterForm.patchValue({
        category: null,
        subcategory: null,
        per_page: null
      });
      component.pagination.set(null);

      const filters = component.currentFilters();
      
      expect(filters.search).toBeUndefined();
      expect(filters.category).toBeUndefined();
      expect(filters.subcategory).toBeUndefined();
      expect(filters.page).toBe(1); // fallback for pagination()?.page || 1
      expect(filters.per_page).toBe(20); // fallback for formValues.per_page || 20
    });

    it('should use default page value when pagination page is falsy', () => {
      // Set pagination with falsy page value to test the || 1 fallback
      component.pagination.set({
        page: 0, // falsy value
        per_page: 20,
        total_pages: 1,
        total_items: 1,
        has_next: false,
        has_prev: false
      });

      const filters = component.currentFilters();
      expect(filters.page).toBe(1); // Should fallback to 1 when page is 0 (falsy)
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle page change correctly', () => {
      const pageEvent = { pageIndex: 1, pageSize: 10, length: 100 };
      
      component.onPageChange(pageEvent);
      
      expect(component.filterForm.get('per_page')?.value).toBe(10);
      expect(getAllProductosUseCaseMock.execute).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, per_page: 10 })
      );
    });
  });

  describe('Utility Methods', () => {
    it('should return correct cold chain icon', () => {
      expect(component.getColdChainIcon(mockProducts[0])).toBe('');
      
      const coldChainProduct = { ...mockProducts[0], requires_cold_chain: true };
      expect(component.getColdChainIcon(coldChainProduct)).toBe('❄️');
    });

    it('should return correct prescription icon', () => {
      expect(component.getPrescriptionIcon(mockProducts[0])).toBe('');
      
      const prescriptionProduct = {
        ...mockProducts[0],
        regulatory_info: { ...mockProducts[0].regulatory_info, requires_prescription: true }
      };
      expect(component.getPrescriptionIcon(prescriptionProduct)).toBe('📋');
    });

    it('should return correct temperature range', () => {
      expect(component.getTemperatureRange(mockProducts[0])).toBe('15°C - 25°C');
    });

    it('should return null when temperature values are null', () => {
      const productWithNullTemp = {
        ...mockProducts[0],
        storage_conditions: {
          temperature_min: null,
          temperature_max: null,
          humidity_max: 60
        }
      };
      expect(component.getTemperatureRange(productWithNullTemp)).toBeNull();
    });

    it('should return null when only one temperature value is null', () => {
      const productWithPartialTemp = {
        ...mockProducts[0],
        storage_conditions: {
          temperature_min: 15,
          temperature_max: null,
          humidity_max: 60
        }
      };
      expect(component.getTemperatureRange(productWithPartialTemp)).toBeNull();
    });

    it('should handle verDetalle method', () => {
      component.verDetalle(mockProducts[0]);
      
      expect(routerMock.navigate).toHaveBeenCalledWith(['/producto-detail', mockProducts[0].id]);
    });

    it('should handle editarProducto method', () => {
      component.editarProducto(mockProducts[0]);
      
      expect(routerMock.navigate).toHaveBeenCalledWith(['/producto-edit', mockProducts[0].id]);
    });

    it('should handle navigateToCreate method', () => {
      component.navigateToCreate();
      
      expect(routerMock.navigate).toHaveBeenCalledWith(['/producto-create']);
    });
  });

  describe('Form Validation', () => {
    it('should have valid initial form state', () => {
      expect(component.filterForm.valid).toBeTruthy();
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

  describe('Component Lifecycle', () => {
    it('should setup search listener on initialization', () => {
      const setupSpy = jest.spyOn(component, 'setupSearchListener');
      component.ngOnInit();
      expect(setupSpy).toHaveBeenCalled();
    });

    it('should setup paginator and sort after view init', () => {
      component.ngAfterViewInit();
      expect(component.dataSource).toBeDefined();
    });
  });

  describe('Delete Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call delete product use case when confirmed', async () => {
      confirmDialogServiceMock.confirmDelete.mockReturnValue(of(true));
      deleteProductUseCaseMock.execute.mockReturnValue(of(undefined));
      
      await component.eliminarProducto(mockProducts[0]);
      
      expect(confirmDialogServiceMock.confirmDelete).toHaveBeenCalledWith(mockProducts[0].name);
      expect(deleteProductUseCaseMock.execute).toHaveBeenCalledWith(mockProducts[0].id);
      expect(notificationServiceMock.success).toHaveBeenCalledWith(
        `Producto "${mockProducts[0].name}" eliminado correctamente`
      );
    });

    it('should not call delete product use case when cancelled', async () => {
      confirmDialogServiceMock.confirmDelete.mockReturnValue(of(false));
      
      await component.eliminarProducto(mockProducts[0]);
      
      expect(confirmDialogServiceMock.confirmDelete).toHaveBeenCalledWith(mockProducts[0].name);
      expect(deleteProductUseCaseMock.execute).not.toHaveBeenCalled();
      expect(notificationServiceMock.success).not.toHaveBeenCalled();
    });

    it('should handle delete error correctly', async () => {
      const errorMessage = 'Error deleting product';
      confirmDialogServiceMock.confirmDelete.mockReturnValue(of(true));
      deleteProductUseCaseMock.execute.mockReturnValue(throwError(() => new Error(errorMessage)));
      
      await component.eliminarProducto(mockProducts[0]);
      
      expect(notificationServiceMock.error).toHaveBeenCalledWith(
        `Error al eliminar el producto: ${errorMessage}`
      );
    });

    it('should reload products after successful deletion', async () => {
      confirmDialogServiceMock.confirmDelete.mockReturnValue(of(true));
      deleteProductUseCaseMock.execute.mockReturnValue(of(undefined));
      getAllProductosUseCaseMock.execute.mockClear();
      
      await component.eliminarProducto(mockProducts[0]);
      
      expect(getAllProductosUseCaseMock.execute).toHaveBeenCalled();
    });

    it('should reload products with page 1 when pagination is null', async () => {
      confirmDialogServiceMock.confirmDelete.mockReturnValue(of(true));
      deleteProductUseCaseMock.execute.mockReturnValue(of(undefined));
      getAllProductosUseCaseMock.execute.mockClear();
      
      // Set pagination to null to test the fallback
      component.pagination.set(null);
      
      await component.eliminarProducto(mockProducts[0]);
      
      expect(getAllProductosUseCaseMock.execute).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 })
      );
    });
  });
});
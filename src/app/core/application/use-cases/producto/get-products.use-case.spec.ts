import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { 
  GetAllProductosUseCase,
  GetActiveProductosUseCase,
  GetProductosByCategoryUseCase,
  GetColdChainProductosUseCase,
  GetProductosBySupplierUseCase
} from './get-products.use-case';
import { ProductoRepository } from '../../../domain/repositories/producto.repository';
import { ProductListResponse, ProductoEntity, ProductQueryParams } from '../../../domain/entities/producto.entity';

describe('GetProductsUseCases', () => {
  let getAllUseCase: GetAllProductosUseCase;
  let getActiveUseCase: GetActiveProductosUseCase;
  let getByCategoryUseCase: GetProductosByCategoryUseCase;
  let getColdChainUseCase: GetColdChainProductosUseCase;
  let getBySupplierUseCase: GetProductosBySupplierUseCase;
  let mockProductoRepository: any;

  const mockProducts: ProductoEntity[] = [
    {
      id: 1,
      sku: 'GET-001',
      name: 'Get Product 1',
      description: 'First get result',
      category: 'Electronics',
      subcategory: 'Mobile',
      unit_price: 99.99,
      currency: 'USD',
      unit_of_measure: 'unit',
      supplier_id: 1,
      supplier_name: 'Get Supplier 1',
      requires_cold_chain: false,
      storage_conditions: {
        temperature_min: 15,
        temperature_max: 25,
        humidity_max: 60
      },
      regulatory_info: {
        sanitary_registration: 'REG-GET-001',
        requires_prescription: false,
        regulatory_class: 'CLASS-A'
      },
      physical_dimensions: {
        weight_kg: 0.5,
        length_cm: 10,
        width_cm: 5,
        height_cm: 2
      },
      manufacturer: 'Get Manufacturer',
      country_of_origin: 'Colombia',
      barcode: '1234567890123',
      image_url: 'https://example.com/get1.jpg',
      is_active: true,
      is_discontinued: false,
      created_at: '2025-11-01T10:00:00Z',
      updated_at: '2025-11-02T10:00:00Z'
    },
    {
      id: 2,
      sku: 'GET-002',
      name: 'Get Product 2',
      description: 'Second get result',
      category: 'Medical',
      subcategory: 'Instruments',
      unit_price: 199.99,
      currency: 'USD',
      unit_of_measure: 'piece',
      supplier_id: 2,
      supplier_name: 'Get Supplier 2',
      requires_cold_chain: true,
      storage_conditions: {
        temperature_min: 2,
        temperature_max: 8,
        humidity_max: 70
      },
      regulatory_info: {
        sanitary_registration: 'REG-GET-002',
        requires_prescription: true,
        regulatory_class: 'CLASS-B'
      },
      physical_dimensions: {
        weight_kg: 1.2,
        length_cm: 20,
        width_cm: 10,
        height_cm: 5
      },
      manufacturer: 'Medical Manufacturer',
      country_of_origin: 'Germany',
      barcode: '9876543210987',
      image_url: 'https://example.com/get2.jpg',
      is_active: true,
      is_discontinued: false,
      created_at: '2025-11-01T10:00:00Z',
      updated_at: '2025-11-02T10:00:00Z'
    }
  ];

  const mockPagination = {
    page: 1,
    per_page: 10,
    total_pages: 1,
    total_items: 2,
    has_next: false,
    has_prev: false
  };

  const mockResponse: ProductListResponse = {
    products: mockProducts,
    pagination: mockPagination
  };

  beforeEach(() => {
    const spy = {
      getAll: jest.fn(),
      getActiveProducts: jest.fn(),
      getProductsByCategory: jest.fn(),
      getColdChainProducts: jest.fn(),
      getProductsBySupplier: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        GetAllProductosUseCase,
        GetActiveProductosUseCase,
        GetProductosByCategoryUseCase,
        GetColdChainProductosUseCase,
        GetProductosBySupplierUseCase,
        { provide: ProductoRepository, useValue: spy }
      ]
    });

    getAllUseCase = TestBed.inject(GetAllProductosUseCase);
    getActiveUseCase = TestBed.inject(GetActiveProductosUseCase);
    getByCategoryUseCase = TestBed.inject(GetProductosByCategoryUseCase);
    getColdChainUseCase = TestBed.inject(GetColdChainProductosUseCase);
    getBySupplierUseCase = TestBed.inject(GetProductosBySupplierUseCase);
    mockProductoRepository = TestBed.inject(ProductoRepository) as any;
  });

  describe('GetAllProductosUseCase', () => {
    it('should be created', () => {
      expect(getAllUseCase).toBeTruthy();
    });

    it('should call repository getAll method without params', (done) => {
      // Arrange
      mockProductoRepository.getAll.mockReturnValue(of(mockResponse));

      // Act
      getAllUseCase.execute().subscribe({
        next: (result: ProductListResponse) => {
          // Assert
          expect(result).toEqual(mockResponse);
          expect(mockProductoRepository.getAll).toHaveBeenCalledWith(undefined);
          expect(mockProductoRepository.getAll).toHaveBeenCalledTimes(1);
          done();
        }
      });
    });

    it('should call repository getAll method with params', (done) => {
      // Arrange
      const params: ProductQueryParams = {
        search: 'test',
        category: 'Electronics',
        page: 1,
        per_page: 10
      };
      mockProductoRepository.getAll.mockReturnValue(of(mockResponse));

      // Act
      getAllUseCase.execute(params).subscribe({
        next: (result: ProductListResponse) => {
          // Assert
          expect(result).toEqual(mockResponse);
          expect(mockProductoRepository.getAll).toHaveBeenCalledWith(params);
          done();
        }
      });
    });

    it('should handle repository errors', (done) => {
      // Arrange
      const errorMessage = 'Failed to get all products';
      mockProductoRepository.getAll.mockReturnValue(throwError(() => new Error(errorMessage)));

      // Act
      getAllUseCase.execute().subscribe({
        error: (error: Error) => {
          // Assert
          expect(error.message).toBe(errorMessage);
          expect(mockProductoRepository.getAll).toHaveBeenCalledWith(undefined);
          done();
        }
      });
    });
  });

  describe('GetActiveProductosUseCase', () => {
    it('should be created', () => {
      expect(getActiveUseCase).toBeTruthy();
    });

    it('should call repository getActiveProducts method without pagination', (done) => {
      // Arrange
      mockProductoRepository.getActiveProducts.mockReturnValue(of(mockResponse));

      // Act
      getActiveUseCase.execute().subscribe({
        next: (result: ProductListResponse) => {
          // Assert
          expect(result).toEqual(mockResponse);
          expect(mockProductoRepository.getActiveProducts).toHaveBeenCalledWith(undefined, undefined);
          expect(mockProductoRepository.getActiveProducts).toHaveBeenCalledTimes(1);
          done();
        }
      });
    });

    it('should call repository getActiveProducts method with pagination', (done) => {
      // Arrange
      const page = 2;
      const perPage = 5;
      mockProductoRepository.getActiveProducts.mockReturnValue(of(mockResponse));

      // Act
      getActiveUseCase.execute(page, perPage).subscribe({
        next: (result: ProductListResponse) => {
          // Assert
          expect(result).toEqual(mockResponse);
          expect(mockProductoRepository.getActiveProducts).toHaveBeenCalledWith(page, perPage);
          done();
        }
      });
    });

    it('should handle repository errors', (done) => {
      // Arrange
      const errorMessage = 'Failed to get active products';
      mockProductoRepository.getActiveProducts.mockReturnValue(throwError(() => new Error(errorMessage)));

      // Act
      getActiveUseCase.execute().subscribe({
        error: (error: Error) => {
          // Assert
          expect(error.message).toBe(errorMessage);
          expect(mockProductoRepository.getActiveProducts).toHaveBeenCalledWith(undefined, undefined);
          done();
        }
      });
    });
  });

  describe('GetProductosByCategoryUseCase', () => {
    it('should be created', () => {
      expect(getByCategoryUseCase).toBeTruthy();
    });

    it('should call repository getProductsByCategory method', (done) => {
      // Arrange
      const category = 'Electronics';
      const page = 1;
      mockProductoRepository.getProductsByCategory.mockReturnValue(of(mockResponse));

      // Act
      getByCategoryUseCase.execute(category, page).subscribe({
        next: (result: ProductListResponse) => {
          // Assert
          expect(result).toEqual(mockResponse);
          expect(mockProductoRepository.getProductsByCategory).toHaveBeenCalledWith(category, page);
          expect(mockProductoRepository.getProductsByCategory).toHaveBeenCalledTimes(1);
          done();
        }
      });
    });

    it('should call repository getProductsByCategory method without page', (done) => {
      // Arrange
      const category = 'Medical';
      mockProductoRepository.getProductsByCategory.mockReturnValue(of(mockResponse));

      // Act
      getByCategoryUseCase.execute(category).subscribe({
        next: (result: ProductListResponse) => {
          // Assert
          expect(result).toEqual(mockResponse);
          expect(mockProductoRepository.getProductsByCategory).toHaveBeenCalledWith(category, undefined);
          done();
        }
      });
    });

    it('should throw error when category is null or undefined', () => {
      // Arrange & Act & Assert
      expect(() => getByCategoryUseCase.execute(null as any)).toThrow('La categoría es requerida');
      expect(() => getByCategoryUseCase.execute(undefined as any)).toThrow('La categoría es requerida');
    });

    it('should throw error when category is empty string', () => {
      // Arrange & Act & Assert
      expect(() => getByCategoryUseCase.execute('')).toThrow('La categoría es requerida');
    });

    it('should throw error when category is only whitespace', () => {
      // Arrange & Act & Assert
      expect(() => getByCategoryUseCase.execute('   ')).toThrow('La categoría es requerida');
      expect(() => getByCategoryUseCase.execute('\t')).toThrow('La categoría es requerida');
      expect(() => getByCategoryUseCase.execute('\n')).toThrow('La categoría es requerida');
    });

    it('should handle repository errors', (done) => {
      // Arrange
      const category = 'Electronics';
      const errorMessage = 'Failed to get products by category';
      mockProductoRepository.getProductsByCategory.mockReturnValue(throwError(() => new Error(errorMessage)));

      // Act
      getByCategoryUseCase.execute(category).subscribe({
        error: (error: Error) => {
          // Assert
          expect(error.message).toBe(errorMessage);
          expect(mockProductoRepository.getProductsByCategory).toHaveBeenCalledWith(category, undefined);
          done();
        }
      });
    });
  });

  describe('GetColdChainProductosUseCase', () => {
    it('should be created', () => {
      expect(getColdChainUseCase).toBeTruthy();
    });

    it('should call repository getColdChainProducts method without page', (done) => {
      // Arrange
      mockProductoRepository.getColdChainProducts.mockReturnValue(of(mockResponse));

      // Act
      getColdChainUseCase.execute().subscribe({
        next: (result: ProductListResponse) => {
          // Assert
          expect(result).toEqual(mockResponse);
          expect(mockProductoRepository.getColdChainProducts).toHaveBeenCalledWith(undefined);
          expect(mockProductoRepository.getColdChainProducts).toHaveBeenCalledTimes(1);
          done();
        }
      });
    });

    it('should call repository getColdChainProducts method with page', (done) => {
      // Arrange
      const page = 3;
      mockProductoRepository.getColdChainProducts.mockReturnValue(of(mockResponse));

      // Act
      getColdChainUseCase.execute(page).subscribe({
        next: (result: ProductListResponse) => {
          // Assert
          expect(result).toEqual(mockResponse);
          expect(mockProductoRepository.getColdChainProducts).toHaveBeenCalledWith(page);
          done();
        }
      });
    });

    it('should handle repository errors', (done) => {
      // Arrange
      const errorMessage = 'Failed to get cold chain products';
      mockProductoRepository.getColdChainProducts.mockReturnValue(throwError(() => new Error(errorMessage)));

      // Act
      getColdChainUseCase.execute().subscribe({
        error: (error: Error) => {
          // Assert
          expect(error.message).toBe(errorMessage);
          expect(mockProductoRepository.getColdChainProducts).toHaveBeenCalledWith(undefined);
          done();
        }
      });
    });
  });

  describe('GetProductosBySupplierUseCase', () => {
    it('should be created', () => {
      expect(getBySupplierUseCase).toBeTruthy();
    });

    it('should call repository getProductsBySupplier method', (done) => {
      // Arrange
      const supplierId = 123;
      const page = 1;
      mockProductoRepository.getProductsBySupplier.mockReturnValue(of(mockResponse));

      // Act
      getBySupplierUseCase.execute(supplierId, page).subscribe({
        next: (result: ProductListResponse) => {
          // Assert
          expect(result).toEqual(mockResponse);
          expect(mockProductoRepository.getProductsBySupplier).toHaveBeenCalledWith(supplierId, page);
          expect(mockProductoRepository.getProductsBySupplier).toHaveBeenCalledTimes(1);
          done();
        }
      });
    });

    it('should call repository getProductsBySupplier method without page', (done) => {
      // Arrange
      const supplierId = 456;
      mockProductoRepository.getProductsBySupplier.mockReturnValue(of(mockResponse));

      // Act
      getBySupplierUseCase.execute(supplierId).subscribe({
        next: (result: ProductListResponse) => {
          // Assert
          expect(result).toEqual(mockResponse);
          expect(mockProductoRepository.getProductsBySupplier).toHaveBeenCalledWith(supplierId, undefined);
          done();
        }
      });
    });

    it('should throw error when supplierId is null, undefined, or zero', () => {
      // Arrange & Act & Assert
      expect(() => getBySupplierUseCase.execute(null as any)).toThrow('El ID del proveedor es requerido');
      expect(() => getBySupplierUseCase.execute(undefined as any)).toThrow('El ID del proveedor es requerido');
      expect(() => getBySupplierUseCase.execute(0)).toThrow('El ID del proveedor es requerido');
    });

    it('should handle repository errors', (done) => {
      // Arrange
      const supplierId = 123;
      const errorMessage = 'Failed to get products by supplier';
      mockProductoRepository.getProductsBySupplier.mockReturnValue(throwError(() => new Error(errorMessage)));

      // Act
      getBySupplierUseCase.execute(supplierId).subscribe({
        error: (error: Error) => {
          // Assert
          expect(error.message).toBe(errorMessage);
          expect(mockProductoRepository.getProductsBySupplier).toHaveBeenCalledWith(supplierId, undefined);
          done();
        }
      });
    });

    it('should work with edge case supplier IDs', (done) => {
      // Arrange
      const edgeCaseIds = [1, 999999, Number.MAX_SAFE_INTEGER];
      let completedCalls = 0;

      edgeCaseIds.forEach(supplierId => {
        mockProductoRepository.getProductsBySupplier.mockReturnValue(of(mockResponse));

        // Act
        getBySupplierUseCase.execute(supplierId).subscribe({
          next: (result: ProductListResponse) => {
            // Assert
            expect(result).toEqual(mockResponse);
            expect(mockProductoRepository.getProductsBySupplier).toHaveBeenCalledWith(supplierId, undefined);
            
            completedCalls++;
            if (completedCalls === edgeCaseIds.length) {
              done();
            }
          }
        });
      });
    });
  });

  // Integration tests for multiple use cases
  describe('Integration Tests', () => {
    it('should maintain consistent response structure across all use cases', (done) => {
      // Arrange
      mockProductoRepository.getAll.mockReturnValue(of(mockResponse));
      mockProductoRepository.getActiveProducts.mockReturnValue(of(mockResponse));
      mockProductoRepository.getProductsByCategory.mockReturnValue(of(mockResponse));
      mockProductoRepository.getColdChainProducts.mockReturnValue(of(mockResponse));
      mockProductoRepository.getProductsBySupplier.mockReturnValue(of(mockResponse));

      const promises = [
        new Promise<void>(resolve => {
          getAllUseCase.execute().subscribe(result => {
            expect(result).toEqual(mockResponse);
            resolve();
          });
        }),
        new Promise<void>(resolve => {
          getActiveUseCase.execute().subscribe(result => {
            expect(result).toEqual(mockResponse);
            resolve();
          });
        }),
        new Promise<void>(resolve => {
          getByCategoryUseCase.execute('Electronics').subscribe(result => {
            expect(result).toEqual(mockResponse);
            resolve();
          });
        }),
        new Promise<void>(resolve => {
          getColdChainUseCase.execute().subscribe(result => {
            expect(result).toEqual(mockResponse);
            resolve();
          });
        }),
        new Promise<void>(resolve => {
          getBySupplierUseCase.execute(123).subscribe(result => {
            expect(result).toEqual(mockResponse);
            resolve();
          });
        })
      ];

      // Act & Assert
      Promise.all(promises).then(() => {
        done();
      });
    });

    it('should handle complex query parameters', (done) => {
      // Arrange
      const complexParams: ProductQueryParams = {
        search: 'complex search term',
        sku: 'COMPLEX-001',
        category: 'Electronics',
        subcategory: 'Smartphones',
        supplier_id: 123,
        is_active: true,
        requires_cold_chain: false,
        page: 2,
        per_page: 20
      };
      mockProductoRepository.getAll.mockReturnValue(of(mockResponse));

      // Act
      getAllUseCase.execute(complexParams).subscribe({
        next: (result: ProductListResponse) => {
          // Assert
          expect(result).toEqual(mockResponse);
          expect(mockProductoRepository.getAll).toHaveBeenCalledWith(complexParams);
          done();
        }
      });
    });
  });
});
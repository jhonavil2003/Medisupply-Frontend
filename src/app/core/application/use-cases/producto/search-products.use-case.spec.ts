import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SearchProductosUseCase } from './search-products.use-case';
import { ProductoRepository } from '../../../domain/repositories/producto.repository';
import { ProductListResponse, ProductoEntity } from '../../../domain/entities/producto.entity';

describe('SearchProductosUseCase', () => {
  let useCase: SearchProductosUseCase;
  let mockProductoRepository: any;

  const mockProducts: ProductoEntity[] = [
    {
      id: 1,
      sku: 'SEARCH-001',
      name: 'Search Product 1',
      description: 'First search result',
      category: 'Electronics',
      subcategory: 'Mobile',
      unit_price: 99.99,
      currency: 'USD',
      unit_of_measure: 'unit',
      supplier_id: 1,
      supplier_name: 'Search Supplier 1',
      requires_cold_chain: false,
      storage_conditions: {
        temperature_min: 15,
        temperature_max: 25,
        humidity_max: 60
      },
      regulatory_info: {
        sanitary_registration: 'REG-SEARCH-001',
        requires_prescription: false,
        regulatory_class: 'CLASS-A'
      },
      physical_dimensions: {
        weight_kg: 0.5,
        length_cm: 10,
        width_cm: 5,
        height_cm: 2
      },
      manufacturer: 'Search Manufacturer',
      country_of_origin: 'Colombia',
      barcode: '1234567890123',
      image_url: 'https://example.com/search1.jpg',
      is_active: true,
      is_discontinued: false,
      created_at: '2025-11-01T10:00:00Z',
      updated_at: '2025-11-02T10:00:00Z'
    },
    {
      id: 2,
      sku: 'SEARCH-002',
      name: 'Search Product 2',
      description: 'Second search result',
      category: 'Medical',
      subcategory: 'Instruments',
      unit_price: 199.99,
      currency: 'USD',
      unit_of_measure: 'piece',
      supplier_id: 2,
      supplier_name: 'Search Supplier 2',
      requires_cold_chain: true,
      storage_conditions: {
        temperature_min: 2,
        temperature_max: 8,
        humidity_max: 70
      },
      regulatory_info: {
        sanitary_registration: 'REG-SEARCH-002',
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
      image_url: 'https://example.com/search2.jpg',
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

  const mockSearchResponse: ProductListResponse = {
    products: mockProducts,
    pagination: mockPagination
  };

  const mockActiveProductsResponse: ProductListResponse = {
    products: mockProducts.filter(p => p.is_active),
    pagination: {
      ...mockPagination,
      total_items: mockProducts.filter(p => p.is_active).length
    }
  };

  beforeEach(() => {
    const spy = {
      searchProducts: jest.fn(),
      getActiveProducts: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        SearchProductosUseCase,
        { provide: ProductoRepository, useValue: spy }
      ]
    });

    useCase = TestBed.inject(SearchProductosUseCase);
    mockProductoRepository = TestBed.inject(ProductoRepository) as any;
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should call repository searchProducts when search term is provided', (done) => {
    // Arrange
    const searchTerm = 'test product';
    const page = 1;
    const perPage = 10;
    mockProductoRepository.searchProducts.mockReturnValue(of(mockSearchResponse));

    // Act
    useCase.execute(searchTerm, page, perPage).subscribe({
      next: (result: ProductListResponse) => {
        // Assert
        expect(result).toEqual(mockSearchResponse);
        expect(mockProductoRepository.searchProducts).toHaveBeenCalledWith(searchTerm, page, perPage);
        expect(mockProductoRepository.searchProducts).toHaveBeenCalledTimes(1);
        expect(mockProductoRepository.getActiveProducts).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('should call getActiveProducts when search term is empty', (done) => {
    // Arrange
    const searchTerm = '';
    const page = 1;
    const perPage = 10;
    mockProductoRepository.getActiveProducts.mockReturnValue(of(mockActiveProductsResponse));

    // Act
    useCase.execute(searchTerm, page, perPage).subscribe({
      next: (result: ProductListResponse) => {
        // Assert
        expect(result).toEqual(mockActiveProductsResponse);
        expect(mockProductoRepository.getActiveProducts).toHaveBeenCalledWith(page, perPage);
        expect(mockProductoRepository.getActiveProducts).toHaveBeenCalledTimes(1);
        expect(mockProductoRepository.searchProducts).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('should call getActiveProducts when search term is null', (done) => {
    // Arrange
    const searchTerm = null as any;
    const page = 1;
    const perPage = 10;
    mockProductoRepository.getActiveProducts.mockReturnValue(of(mockActiveProductsResponse));

    // Act
    useCase.execute(searchTerm, page, perPage).subscribe({
      next: (result: ProductListResponse) => {
        // Assert
        expect(result).toEqual(mockActiveProductsResponse);
        expect(mockProductoRepository.getActiveProducts).toHaveBeenCalledWith(page, perPage);
        expect(mockProductoRepository.searchProducts).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('should call getActiveProducts when search term is undefined', (done) => {
    // Arrange
    const searchTerm = undefined as any;
    mockProductoRepository.getActiveProducts.mockReturnValue(of(mockActiveProductsResponse));

    // Act
    useCase.execute(searchTerm).subscribe({
      next: (result: ProductListResponse) => {
        // Assert
        expect(result).toEqual(mockActiveProductsResponse);
        expect(mockProductoRepository.getActiveProducts).toHaveBeenCalledWith(undefined, undefined);
        expect(mockProductoRepository.searchProducts).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('should call getActiveProducts when search term is only whitespace', (done) => {
    // Arrange
    const searchTerm = '   \t\n   ';
    const page = 2;
    const perPage = 5;
    mockProductoRepository.getActiveProducts.mockReturnValue(of(mockActiveProductsResponse));

    // Act
    useCase.execute(searchTerm, page, perPage).subscribe({
      next: (result: ProductListResponse) => {
        // Assert
        expect(result).toEqual(mockActiveProductsResponse);
        expect(mockProductoRepository.getActiveProducts).toHaveBeenCalledWith(page, perPage);
        expect(mockProductoRepository.searchProducts).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('should trim search term before passing to repository', (done) => {
    // Arrange
    const searchTerm = '  test search  ';
    const trimmedTerm = 'test search';
    mockProductoRepository.searchProducts.mockReturnValue(of(mockSearchResponse));

    // Act
    useCase.execute(searchTerm).subscribe({
      next: (result: ProductListResponse) => {
        // Assert
        expect(mockProductoRepository.searchProducts).toHaveBeenCalledWith(trimmedTerm, undefined, undefined);
        done();
      }
    });
  });

  it('should handle different search terms correctly', (done) => {
    // Arrange
    const testCases = [
      { term: 'electronics', expectedProducts: [mockProducts[0]] },
      { term: 'medical', expectedProducts: [mockProducts[1]] },
      { term: 'search', expectedProducts: mockProducts }
    ];

    let completedCalls = 0;

    testCases.forEach(testCase => {
      const response = {
        products: testCase.expectedProducts,
        pagination: { ...mockPagination, total_items: testCase.expectedProducts.length }
      };
      mockProductoRepository.searchProducts.mockReturnValue(of(response));

      // Act
      useCase.execute(testCase.term).subscribe({
        next: (result: ProductListResponse) => {
          // Assert
          expect(result.products).toEqual(testCase.expectedProducts);
          expect(mockProductoRepository.searchProducts).toHaveBeenCalledWith(testCase.term, undefined, undefined);
          
          completedCalls++;
          if (completedCalls === testCases.length) {
            done();
          }
        }
      });
    });
  });

  it('should handle pagination parameters correctly', (done) => {
    // Arrange
    const searchTerm = 'test';
    const testCases = [
      { page: 1, perPage: 10 },
      { page: 2, perPage: 5 },
      { page: 3, perPage: 20 }
    ];

    let completedCalls = 0;

    testCases.forEach(testCase => {
      const response = {
        ...mockSearchResponse,
        pagination: { ...mockPagination, page: testCase.page, per_page: testCase.perPage }
      };
      mockProductoRepository.searchProducts.mockReturnValue(of(response));

      // Act
      useCase.execute(searchTerm, testCase.page, testCase.perPage).subscribe({
        next: (result: ProductListResponse) => {
          // Assert
          expect(result.pagination.page).toBe(testCase.page);
          expect(result.pagination.per_page).toBe(testCase.perPage);
          expect(mockProductoRepository.searchProducts).toHaveBeenCalledWith(searchTerm, testCase.page, testCase.perPage);
          
          completedCalls++;
          if (completedCalls === testCases.length) {
            done();
          }
        }
      });
    });
  });

  it('should handle search errors', (done) => {
    // Arrange
    const searchTerm = 'error test';
    const errorMessage = 'Search failed';
    mockProductoRepository.searchProducts.mockReturnValue(throwError(() => new Error(errorMessage)));

    // Act
    useCase.execute(searchTerm).subscribe({
      error: (error: Error) => {
        // Assert
        expect(error.message).toBe(errorMessage);
        expect(mockProductoRepository.searchProducts).toHaveBeenCalledWith(searchTerm, undefined, undefined);
        done();
      }
    });
  });

  it('should handle getActiveProducts errors', (done) => {
    // Arrange
    const searchTerm = '';
    const errorMessage = 'Failed to get active products';
    mockProductoRepository.getActiveProducts.mockReturnValue(throwError(() => new Error(errorMessage)));

    // Act
    useCase.execute(searchTerm).subscribe({
      error: (error: Error) => {
        // Assert
        expect(error.message).toBe(errorMessage);
        expect(mockProductoRepository.getActiveProducts).toHaveBeenCalledWith(undefined, undefined);
        done();
      }
    });
  });

  it('should handle network errors for search', (done) => {
    // Arrange
    const searchTerm = 'network test';
    const networkError = new Error('Network timeout');
    mockProductoRepository.searchProducts.mockReturnValue(throwError(() => networkError));

    // Act
    useCase.execute(searchTerm).subscribe({
      error: (error: Error) => {
        // Assert
        expect(error.message).toBe('Network timeout');
        expect(mockProductoRepository.searchProducts).toHaveBeenCalledWith(searchTerm, undefined, undefined);
        done();
      }
    });
  });

  it('should handle empty search results', (done) => {
    // Arrange
    const searchTerm = 'nonexistent';
    const emptyResponse: ProductListResponse = {
      products: [],
      pagination: {
        page: 1,
        per_page: 10,
        total_pages: 0,
        total_items: 0,
        has_next: false,
        has_prev: false
      }
    };
    mockProductoRepository.searchProducts.mockReturnValue(of(emptyResponse));

    // Act
    useCase.execute(searchTerm).subscribe({
      next: (result: ProductListResponse) => {
        // Assert
        expect(result.products).toEqual([]);
        expect(result.pagination.total_items).toBe(0);
        expect(mockProductoRepository.searchProducts).toHaveBeenCalledWith(searchTerm, undefined, undefined);
        done();
      }
    });
  });

  it('should handle special characters in search term', (done) => {
    // Arrange
    const specialTerms = [
      'product@test.com',
      'product-with-dashes',
      'product_with_underscores',
      'product 123 números',
      'prõdüct spëcîál'
    ];

    let completedCalls = 0;

    specialTerms.forEach(term => {
      mockProductoRepository.searchProducts.mockReturnValue(of(mockSearchResponse));

      // Act
      useCase.execute(term).subscribe({
        next: (result: ProductListResponse) => {
          // Assert
          expect(mockProductoRepository.searchProducts).toHaveBeenCalledWith(term, undefined, undefined);
          
          completedCalls++;
          if (completedCalls === specialTerms.length) {
            done();
          }
        }
      });
    });
  });

  it('should work without optional pagination parameters', (done) => {
    // Arrange
    const searchTerm = 'no pagination';
    mockProductoRepository.searchProducts.mockReturnValue(of(mockSearchResponse));

    // Act
    useCase.execute(searchTerm).subscribe({
      next: (result: ProductListResponse) => {
        // Assert
        expect(result).toEqual(mockSearchResponse);
        expect(mockProductoRepository.searchProducts).toHaveBeenCalledWith(searchTerm, undefined, undefined);
        done();
      }
    });
  });

  it('should maintain repository method contract for search', (done) => {
    // Arrange
    const searchTerm = 'contract test';
    mockProductoRepository.searchProducts.mockReturnValue(of(mockSearchResponse));

    // Act
    useCase.execute(searchTerm).subscribe({
      next: (result: ProductListResponse) => {
        // Assert
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        expect(Array.isArray(result.products)).toBe(true);
        expect(result.pagination).toBeDefined();
        expect(typeof result.pagination.page).toBe('number');
        expect(typeof result.pagination.total_items).toBe('number');
        done();
      }
    });
  });

  it('should maintain repository method contract for active products', (done) => {
    // Arrange
    const searchTerm = '';
    mockProductoRepository.getActiveProducts.mockReturnValue(of(mockActiveProductsResponse));

    // Act
    useCase.execute(searchTerm).subscribe({
      next: (result: ProductListResponse) => {
        // Assert
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        expect(Array.isArray(result.products)).toBe(true);
        expect(result.pagination).toBeDefined();
        expect(typeof result.pagination.page).toBe('number');
        expect(typeof result.pagination.total_items).toBe('number');
        done();
      }
    });
  });
});
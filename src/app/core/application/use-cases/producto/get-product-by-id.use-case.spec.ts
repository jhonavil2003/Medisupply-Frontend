import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { GetProductByIdUseCase } from './get-product-by-id.use-case';
import { ProductoRepository } from '../../../domain/repositories/producto.repository';
import { ProductoDetailedEntity } from '../../../domain/entities/producto.entity';

describe('GetProductByIdUseCase', () => {
  let useCase: GetProductByIdUseCase;
  let mockProductoRepository: any;

  const mockProductDetailed: ProductoDetailedEntity = {
    id: 123,
    sku: 'PROD-123',
    name: 'Test Product',
    description: 'Test product description',
    category: 'Electronics',
    subcategory: 'Mobile',
    unit_price: 99.99,
    currency: 'USD',
    unit_of_measure: 'unit',
    supplier_id: 1,
    supplier_name: 'Test Supplier',
    requires_cold_chain: false,
    storage_conditions: {
      temperature_min: 15,
      temperature_max: 25,
      humidity_max: 60
    },
    regulatory_info: {
      sanitary_registration: 'REG-123',
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
    image_url: 'https://example.com/image.jpg',
    is_active: true,
    is_discontinued: false,
    created_at: '2025-11-02T10:00:00Z',
    updated_at: '2025-11-02T10:00:00Z',
    certifications: [
      {
        id: 1,
        certification_type: 'ISO',
        certification_number: 'ISO-9001',
        certifying_body: 'ISO Organization',
        issue_date: '2025-01-01T00:00:00Z',
        expiry_date: '2026-01-01T00:00:00Z',
        is_valid: true,
        created_at: '2025-01-01T00:00:00Z'
      }
    ],
    regulatory_conditions: [
      {
        id: 1,
        condition_type: 'Storage',
        description: 'Must be stored in dry place',
        authority: 'Health Authority',
        reference_number: 'REF-001',
        effective_date: '2025-01-01T00:00:00Z',
        expiry_date: null,
        is_active: true,
        created_at: '2025-01-01T00:00:00Z'
      }
    ]
  };

  beforeEach(() => {
    const spy = {
      getById: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        GetProductByIdUseCase,
        { provide: ProductoRepository, useValue: spy }
      ]
    });

    useCase = TestBed.inject(GetProductByIdUseCase);
    mockProductoRepository = TestBed.inject(ProductoRepository) as any;
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should call repository getById method and return product', (done) => {
    // Arrange
    const productId = 123;
    mockProductoRepository.getById.mockReturnValue(of(mockProductDetailed));

    // Act
    useCase.execute(productId).subscribe({
      next: (result) => {
        // Assert
        expect(result).toEqual(mockProductDetailed);
        expect(mockProductoRepository.getById).toHaveBeenCalledWith(productId);
        expect(mockProductoRepository.getById).toHaveBeenCalledTimes(1);
        done();
      }
    });
  });

  it('should handle different product IDs correctly', (done) => {
    // Arrange
    const testCases = [
      { id: 1, expectedProduct: { ...mockProductDetailed, id: 1, sku: 'PROD-001' } },
      { id: 999, expectedProduct: { ...mockProductDetailed, id: 999, sku: 'PROD-999' } },
      { id: 456789, expectedProduct: { ...mockProductDetailed, id: 456789, sku: 'PROD-456789' } }
    ];

    let completedCalls = 0;

    testCases.forEach(testCase => {
      mockProductoRepository.getById.mockReturnValue(of(testCase.expectedProduct));

      // Act
      useCase.execute(testCase.id).subscribe({
        next: (result) => {
          // Assert
          expect(result).toEqual(testCase.expectedProduct);
          expect(mockProductoRepository.getById).toHaveBeenCalledWith(testCase.id);
          
          completedCalls++;
          if (completedCalls === testCases.length) {
            expect(mockProductoRepository.getById).toHaveBeenCalledTimes(testCases.length);
            done();
          }
        }
      });
    });
  });

  it('should handle product not found errors', (done) => {
    // Arrange
    const productId = 999;
    const notFoundError = new Error('Product not found');
    mockProductoRepository.getById.mockReturnValue(throwError(() => notFoundError));

    // Act
    useCase.execute(productId).subscribe({
      error: (error) => {
        // Assert
        expect(error).toBe(notFoundError);
        expect(mockProductoRepository.getById).toHaveBeenCalledWith(productId);
        expect(mockProductoRepository.getById).toHaveBeenCalledTimes(1);
        done();
      }
    });
  });

  it('should handle repository errors', (done) => {
    // Arrange
    const productId = 123;
    const errorMessage = 'Database connection failed';
    mockProductoRepository.getById.mockReturnValue(throwError(() => new Error(errorMessage)));

    // Act
    useCase.execute(productId).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe(errorMessage);
        expect(mockProductoRepository.getById).toHaveBeenCalledWith(productId);
        done();
      }
    });
  });

  it('should handle network errors', (done) => {
    // Arrange
    const productId = 456;
    const networkError = new Error('Network timeout');
    mockProductoRepository.getById.mockReturnValue(throwError(() => networkError));

    // Act
    useCase.execute(productId).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe('Network timeout');
        expect(mockProductoRepository.getById).toHaveBeenCalledWith(productId);
        done();
      }
    });
  });

  it('should handle permission denied errors', (done) => {
    // Arrange
    const productId = 789;
    const permissionError = new Error('Access denied');
    mockProductoRepository.getById.mockReturnValue(throwError(() => permissionError));

    // Act
    useCase.execute(productId).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe('Access denied');
        expect(mockProductoRepository.getById).toHaveBeenCalledWith(productId);
        done();
      }
    });
  });

  it('should work with edge case product IDs', (done) => {
    // Arrange
    const edgeCaseIds = [0, 1, Number.MAX_SAFE_INTEGER];
    let completedCalls = 0;

    edgeCaseIds.forEach(productId => {
      const expectedProduct = { ...mockProductDetailed, id: productId };
      mockProductoRepository.getById.mockReturnValue(of(expectedProduct));

      // Act
      useCase.execute(productId).subscribe({
        next: (result) => {
          // Assert
          expect(result.id).toBe(productId);
          expect(mockProductoRepository.getById).toHaveBeenCalledWith(productId);
          
          completedCalls++;
          if (completedCalls === edgeCaseIds.length) {
            done();
          }
        }
      });
    });
  });

  it('should return product with all detailed information', (done) => {
    // Arrange
    const productId = 123;
    const fullProduct: ProductoDetailedEntity = {
      ...mockProductDetailed,
      certifications: [
        {
          id: 1,
          certification_type: 'ISO',
          certification_number: 'ISO-9001',
          certifying_body: 'ISO Organization',
          issue_date: '2025-01-01T00:00:00Z',
          expiry_date: '2026-01-01T00:00:00Z',
          is_valid: true,
          created_at: '2025-01-01T00:00:00Z'
        },
        {
          id: 2,
          certification_type: 'FDA',
          certification_number: 'FDA-2025-001',
          certifying_body: 'FDA',
          issue_date: '2025-02-01T00:00:00Z',
          expiry_date: null,
          is_valid: true,
          created_at: '2025-02-01T00:00:00Z'
        }
      ],
      regulatory_conditions: [
        {
          id: 1,
          condition_type: 'Storage',
          description: 'Must be stored in dry place',
          authority: 'Health Authority',
          reference_number: 'REF-001',
          effective_date: '2025-01-01T00:00:00Z',
          expiry_date: null,
          is_active: true,
          created_at: '2025-01-01T00:00:00Z'
        }
      ]
    };

    mockProductoRepository.getById.mockReturnValue(of(fullProduct));

    // Act
    useCase.execute(productId).subscribe({
      next: (result) => {
        // Assert
        expect(result).toEqual(fullProduct);
        expect(result.certifications).toHaveLength(2);
        expect(result.regulatory_conditions).toHaveLength(1);
        expect(result.certifications[0].certification_type).toBe('ISO');
        expect(result.certifications[1].certification_type).toBe('FDA');
        expect(mockProductoRepository.getById).toHaveBeenCalledWith(productId);
        done();
      }
    });
  });

  it('should handle cold chain products correctly', (done) => {
    // Arrange
    const productId = 456;
    const coldChainProduct: ProductoDetailedEntity = {
      ...mockProductDetailed,
      id: productId,
      requires_cold_chain: true,
      storage_conditions: {
        temperature_min: -20,
        temperature_max: -15,
        humidity_max: 80
      }
    };

    mockProductoRepository.getById.mockReturnValue(of(coldChainProduct));

    // Act
    useCase.execute(productId).subscribe({
      next: (result) => {
        // Assert
        expect(result.requires_cold_chain).toBe(true);
        expect(result.storage_conditions.temperature_min).toBe(-20);
        expect(result.storage_conditions.temperature_max).toBe(-15);
        expect(mockProductoRepository.getById).toHaveBeenCalledWith(productId);
        done();
      }
    });
  });

  it('should maintain repository method contract', (done) => {
    // Arrange
    const productId = 42;
    mockProductoRepository.getById.mockReturnValue(of(mockProductDetailed));

    // Act
    useCase.execute(productId).subscribe({
      next: (result) => {
        // Assert
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        expect(result.id).toBeDefined();
        expect(result.sku).toBeDefined();
        expect(result.name).toBeDefined();
        expect(Array.isArray(result.certifications)).toBe(true);
        expect(Array.isArray(result.regulatory_conditions)).toBe(true);
        expect(mockProductoRepository.getById).toHaveBeenCalledWith(productId);
        done();
      }
    });
  });
});
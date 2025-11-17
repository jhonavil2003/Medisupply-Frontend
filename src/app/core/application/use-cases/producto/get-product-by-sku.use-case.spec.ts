import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { GetProductoBySkuUseCase } from './get-product-by-sku.use-case';
import { ProductoRepository } from '../../../domain/repositories/producto.repository';
import { ProductoDetailedEntity } from '../../../domain/entities/producto.entity';

describe('GetProductoBySkuUseCase', () => {
  let useCase: GetProductoBySkuUseCase;
  let mockProductoRepository: any;

  const mockProductDetailed: ProductoDetailedEntity = {
    id: 123,
    sku: 'PROD-SKU-001',
    name: 'Product by SKU',
    description: 'Product found by SKU',
    category: 'Electronics',
    subcategory: 'Mobile',
    unit_price: 299.99,
    currency: 'USD',
    unit_of_measure: 'unit',
    supplier_id: 1,
    supplier_name: 'SKU Supplier',
    requires_cold_chain: false,
    storage_conditions: {
      temperature_min: 15,
      temperature_max: 25,
      humidity_max: 60
    },
    regulatory_info: {
      sanitary_registration: 'REG-SKU-001',
      requires_prescription: false,
      regulatory_class: 'CLASS-A'
    },
    physical_dimensions: {
      weight_kg: 0.3,
      length_cm: 12,
      width_cm: 6,
      height_cm: 2
    },
    manufacturer: 'SKU Manufacturer',
    country_of_origin: 'Colombia',
    barcode: '1234567890123',
    image_url: 'https://example.com/sku-image.jpg',
    is_active: true,
    is_discontinued: false,
    created_at: '2025-11-01T10:00:00Z',
    updated_at: '2025-11-02T10:00:00Z',
    certifications: [
      {
        id: 1,
        certification_type: 'Quality',
        certification_number: 'QC-001',
        certifying_body: 'Quality Control Board',
        issue_date: '2025-01-01T00:00:00Z',
        expiry_date: '2026-01-01T00:00:00Z',
        is_valid: true,
        created_at: '2025-01-01T00:00:00Z'
      }
    ],
    regulatory_conditions: [
      {
        id: 1,
        condition_type: 'Import',
        description: 'Import regulations apply',
        authority: 'Customs Authority',
        reference_number: 'IMP-001',
        effective_date: '2025-01-01T00:00:00Z',
        expiry_date: null,
        is_active: true,
        created_at: '2025-01-01T00:00:00Z'
      }
    ]
  };

  beforeEach(() => {
    const spy = {
      getBySku: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        GetProductoBySkuUseCase,
        { provide: ProductoRepository, useValue: spy }
      ]
    });

    useCase = TestBed.inject(GetProductoBySkuUseCase);
    mockProductoRepository = TestBed.inject(ProductoRepository) as any;
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should call repository getBySku method and return product', (done) => {
    // Arrange
    const sku = 'PROD-SKU-001';
    mockProductoRepository.getBySku.mockReturnValue(of(mockProductDetailed));

    // Act
    useCase.execute(sku).subscribe({
      next: (result) => {
        // Assert
        expect(result).toEqual(mockProductDetailed);
        expect(mockProductoRepository.getBySku).toHaveBeenCalledWith(sku);
        expect(mockProductoRepository.getBySku).toHaveBeenCalledTimes(1);
        done();
      }
    });
  });

  it('should handle different SKU formats correctly', (done) => {
    // Arrange
    const testCases = [
      { sku: 'ABC-123', expectedProduct: { ...mockProductDetailed, sku: 'ABC-123' } },
      { sku: 'PROD_456', expectedProduct: { ...mockProductDetailed, sku: 'PROD_456' } },
      { sku: '789-XYZ-001', expectedProduct: { ...mockProductDetailed, sku: '789-XYZ-001' } },
      { sku: 'SIMPLE123', expectedProduct: { ...mockProductDetailed, sku: 'SIMPLE123' } }
    ];

    let completedCalls = 0;

    testCases.forEach(testCase => {
      mockProductoRepository.getBySku.mockReturnValue(of(testCase.expectedProduct));

      // Act
      useCase.execute(testCase.sku).subscribe({
        next: (result) => {
          // Assert
          expect(result).toEqual(testCase.expectedProduct);
          expect(mockProductoRepository.getBySku).toHaveBeenCalledWith(testCase.sku);
          
          completedCalls++;
          if (completedCalls === testCases.length) {
            expect(mockProductoRepository.getBySku).toHaveBeenCalledTimes(testCases.length);
            done();
          }
        }
      });
    });
  });

  it('should throw error when SKU is null or undefined', () => {
    // Arrange & Act & Assert
    expect(() => useCase.execute(null as any)).toThrow('El SKU del producto es requerido');
    expect(() => useCase.execute(undefined as any)).toThrow('El SKU del producto es requerido');
  });

  it('should throw error when SKU is empty string', () => {
    // Arrange & Act & Assert
    expect(() => useCase.execute('')).toThrow('El SKU del producto es requerido');
  });

  it('should throw error when SKU is only whitespace', () => {
    // Arrange & Act & Assert
    expect(() => useCase.execute('   ')).toThrow('El SKU del producto es requerido');
    expect(() => useCase.execute('\t')).toThrow('El SKU del producto es requerido');
    expect(() => useCase.execute('\n')).toThrow('El SKU del producto es requerido');
    expect(() => useCase.execute('  \t\n  ')).toThrow('El SKU del producto es requerido');
  });

  it('should handle valid SKU with leading/trailing whitespace', (done) => {
    // Arrange
    const skuWithSpaces = '  VALID-SKU-001  ';
    const expectedProduct = { ...mockProductDetailed, sku: 'VALID-SKU-001' };
    mockProductoRepository.getBySku.mockReturnValue(of(expectedProduct));

    // Act
    useCase.execute(skuWithSpaces).subscribe({
      next: (result) => {
        // Assert
        expect(result).toEqual(expectedProduct);
        expect(mockProductoRepository.getBySku).toHaveBeenCalledWith(skuWithSpaces);
        done();
      }
    });
  });

  it('should handle product not found errors', (done) => {
    // Arrange
    const sku = 'NONEXISTENT-SKU';
    const notFoundError = new Error('Product with SKU not found');
    mockProductoRepository.getBySku.mockReturnValue(throwError(() => notFoundError));

    // Act
    useCase.execute(sku).subscribe({
      error: (error) => {
        // Assert
        expect(error).toBe(notFoundError);
        expect(mockProductoRepository.getBySku).toHaveBeenCalledWith(sku);
        expect(mockProductoRepository.getBySku).toHaveBeenCalledTimes(1);
        done();
      }
    });
  });

  it('should handle repository errors', (done) => {
    // Arrange
    const sku = 'VALID-SKU';
    const errorMessage = 'Database connection failed';
    mockProductoRepository.getBySku.mockReturnValue(throwError(() => new Error(errorMessage)));

    // Act
    useCase.execute(sku).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe(errorMessage);
        expect(mockProductoRepository.getBySku).toHaveBeenCalledWith(sku);
        done();
      }
    });
  });

  it('should handle network errors', (done) => {
    // Arrange
    const sku = 'NETWORK-TEST-SKU';
    const networkError = new Error('Network timeout');
    mockProductoRepository.getBySku.mockReturnValue(throwError(() => networkError));

    // Act
    useCase.execute(sku).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe('Network timeout');
        expect(mockProductoRepository.getBySku).toHaveBeenCalledWith(sku);
        done();
      }
    });
  });

  it('should handle case-sensitive SKU searches', (done) => {
    // Arrange
    const testCases = [
      { sku: 'UPPER-CASE-SKU', expectedProduct: { ...mockProductDetailed, sku: 'UPPER-CASE-SKU' } },
      { sku: 'lower-case-sku', expectedProduct: { ...mockProductDetailed, sku: 'lower-case-sku' } },
      { sku: 'Mixed-Case-Sku', expectedProduct: { ...mockProductDetailed, sku: 'Mixed-Case-Sku' } }
    ];

    let completedCalls = 0;

    testCases.forEach(testCase => {
      mockProductoRepository.getBySku.mockReturnValue(of(testCase.expectedProduct));

      // Act
      useCase.execute(testCase.sku).subscribe({
        next: (result) => {
          // Assert
          expect(result.sku).toBe(testCase.sku);
          expect(mockProductoRepository.getBySku).toHaveBeenCalledWith(testCase.sku);
          
          completedCalls++;
          if (completedCalls === testCases.length) {
            done();
          }
        }
      });
    });
  });

  it('should handle special characters in SKU', (done) => {
    // Arrange
    const specialSkus = [
      'SKU-WITH-DASHES',
      'SKU_WITH_UNDERSCORES',
      'SKU.WITH.DOTS',
      'SKU@WITH@SYMBOLS',
      'SKU123-456_789.ABC'
    ];

    let completedCalls = 0;

    specialSkus.forEach(sku => {
      const expectedProduct = { ...mockProductDetailed, sku };
      mockProductoRepository.getBySku.mockReturnValue(of(expectedProduct));

      // Act
      useCase.execute(sku).subscribe({
        next: (result) => {
          // Assert
          expect(result.sku).toBe(sku);
          expect(mockProductoRepository.getBySku).toHaveBeenCalledWith(sku);
          
          completedCalls++;
          if (completedCalls === specialSkus.length) {
            done();
          }
        }
      });
    });
  });

  it('should return product with all detailed information including certifications', (done) => {
    // Arrange
    const sku = 'DETAILED-SKU-001';
    const detailedProduct: ProductoDetailedEntity = {
      ...mockProductDetailed,
      sku,
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
          certification_type: 'CE',
          certification_number: 'CE-2025-001',
          certifying_body: 'European Conformity',
          issue_date: '2025-02-01T00:00:00Z',
          expiry_date: null,
          is_valid: true,
          created_at: '2025-02-01T00:00:00Z'
        }
      ],
      regulatory_conditions: [
        {
          id: 1,
          condition_type: 'Export',
          description: 'Export regulations apply',
          authority: 'Export Authority',
          reference_number: 'EXP-001',
          effective_date: '2025-01-01T00:00:00Z',
          expiry_date: '2025-12-31T00:00:00Z',
          is_active: true,
          created_at: '2025-01-01T00:00:00Z'
        }
      ]
    };

    mockProductoRepository.getBySku.mockReturnValue(of(detailedProduct));

    // Act
    useCase.execute(sku).subscribe({
      next: (result) => {
        // Assert
        expect(result).toEqual(detailedProduct);
        expect(result.certifications).toHaveLength(2);
        expect(result.regulatory_conditions).toHaveLength(1);
        expect(result.certifications[0].certification_type).toBe('ISO');
        expect(result.certifications[1].certification_type).toBe('CE');
        expect(mockProductoRepository.getBySku).toHaveBeenCalledWith(sku);
        done();
      }
    });
  });

  it('should maintain repository method contract', (done) => {
    // Arrange
    const sku = 'CONTRACT-TEST-SKU';
    mockProductoRepository.getBySku.mockReturnValue(of(mockProductDetailed));

    // Act
    useCase.execute(sku).subscribe({
      next: (result) => {
        // Assert
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        expect(result.id).toBeDefined();
        expect(result.sku).toBeDefined();
        expect(result.name).toBeDefined();
        expect(Array.isArray(result.certifications)).toBe(true);
        expect(Array.isArray(result.regulatory_conditions)).toBe(true);
        expect(mockProductoRepository.getBySku).toHaveBeenCalledWith(sku);
        done();
      }
    });
  });
});
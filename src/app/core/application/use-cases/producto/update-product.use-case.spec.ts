import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UpdateProductUseCase } from './update-product.use-case';
import { ProductoRepository, UpdateProductRequest } from '../../../domain/repositories/producto.repository';
import { ProductoDetailedEntity } from '../../../domain/entities/producto.entity';

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;
  let mockProductoRepository: any;

  const mockUpdateRequest: UpdateProductRequest = {
    sku: 'UPDATED-001',
    name: 'Updated Product',
    category: 'Electronics',
    unit_price: 149.99,
    unit_of_measure: 'unit',
    supplier_id: 2,
    description: 'Updated description',
    subcategory: 'Tablets',
    currency: 'EUR',
    requires_cold_chain: true,
    storage_conditions: {
      temperature_min: 2,
      temperature_max: 8,
      humidity_max: 70
    },
    regulatory_info: {
      sanitary_registration: 'REG-UPDATED',
      requires_prescription: true,
      regulatory_class: 'CLASS-B'
    },
    physical_dimensions: {
      weight_kg: 0.8,
      length_cm: 15,
      width_cm: 10,
      height_cm: 3
    },
    manufacturer: 'Updated Manufacturer',
    country_of_origin: 'Germany',
    barcode: '9876543210987',
    image_url: 'https://updated-example.com/image.jpg',
    is_active: true,
    is_discontinued: false
  };

  const mockUpdatedProduct: ProductoDetailedEntity = {
    id: 123,
    sku: 'UPDATED-001',
    name: 'Updated Product',
    description: 'Updated description',
    category: 'Electronics',
    subcategory: 'Tablets',
    unit_price: 149.99,
    currency: 'EUR',
    unit_of_measure: 'unit',
    supplier_id: 2,
    supplier_name: 'Updated Supplier',
    requires_cold_chain: true,
    storage_conditions: {
      temperature_min: 2,
      temperature_max: 8,
      humidity_max: 70
    },
    regulatory_info: {
      sanitary_registration: 'REG-UPDATED',
      requires_prescription: true,
      regulatory_class: 'CLASS-B'
    },
    physical_dimensions: {
      weight_kg: 0.8,
      length_cm: 15,
      width_cm: 10,
      height_cm: 3
    },
    manufacturer: 'Updated Manufacturer',
    country_of_origin: 'Germany',
    barcode: '9876543210987',
    image_url: 'https://updated-example.com/image.jpg',
    is_active: true,
    is_discontinued: false,
    created_at: '2025-11-01T10:00:00Z',
    updated_at: '2025-11-02T10:00:00Z',
    certifications: [],
    regulatory_conditions: []
  };

  beforeEach(() => {
    const spy = {
      update: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        UpdateProductUseCase,
        { provide: ProductoRepository, useValue: spy }
      ]
    });

    useCase = TestBed.inject(UpdateProductUseCase);
    mockProductoRepository = TestBed.inject(ProductoRepository) as any;
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should call repository update method and return updated product', (done) => {
    // Arrange
    const productId = 123;
    mockProductoRepository.update.mockReturnValue(of(mockUpdatedProduct));

    // Act
    useCase.execute(productId, mockUpdateRequest).subscribe({
      next: (result) => {
        // Assert
        expect(result).toEqual(mockUpdatedProduct);
        expect(mockProductoRepository.update).toHaveBeenCalledWith(productId, mockUpdateRequest);
        expect(mockProductoRepository.update).toHaveBeenCalledTimes(1);
        done();
      }
    });
  });

  it('should pass the exact product ID and data to repository', (done) => {
    // Arrange
    const productId = 456;
    const specificRequest: UpdateProductRequest = {
      name: 'Specific Updated Name',
      unit_price: 99.50,
      is_active: false
    };

    const expectedResponse: ProductoDetailedEntity = {
      ...mockUpdatedProduct,
      id: productId,
      name: 'Specific Updated Name',
      unit_price: 99.50,
      is_active: false
    };

    mockProductoRepository.update.mockReturnValue(of(expectedResponse));

    // Act
    useCase.execute(productId, specificRequest).subscribe({
      next: (result) => {
        // Assert
        expect(mockProductoRepository.update).toHaveBeenCalledWith(productId, specificRequest);
        expect(result).toEqual(expectedResponse);
        expect(result.id).toBe(productId);
        expect(result.name).toBe('Specific Updated Name');
        done();
      }
    });
  });

  it('should handle partial updates with minimal fields', (done) => {
    // Arrange
    const productId = 789;
    const partialRequest: UpdateProductRequest = {
      unit_price: 25.99
    };

    const partialResponse: ProductoDetailedEntity = {
      ...mockUpdatedProduct,
      id: productId,
      unit_price: 25.99
    };

    mockProductoRepository.update.mockReturnValue(of(partialResponse));

    // Act
    useCase.execute(productId, partialRequest).subscribe({
      next: (result) => {
        // Assert
        expect(mockProductoRepository.update).toHaveBeenCalledWith(productId, partialRequest);
        expect(result.unit_price).toBe(25.99);
        expect(result.id).toBe(productId);
        done();
      }
    });
  });

  it('should handle repository errors', (done) => {
    // Arrange
    const productId = 123;
    const errorMessage = 'Failed to update product';
    mockProductoRepository.update.mockReturnValue(throwError(() => new Error(errorMessage)));

    // Act
    useCase.execute(productId, mockUpdateRequest).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe(errorMessage);
        expect(mockProductoRepository.update).toHaveBeenCalledWith(productId, mockUpdateRequest);
        done();
      }
    });
  });

  it('should handle product not found errors', (done) => {
    // Arrange
    const productId = 999;
    const notFoundError = new Error('Product not found');
    mockProductoRepository.update.mockReturnValue(throwError(() => notFoundError));

    // Act
    useCase.execute(productId, mockUpdateRequest).subscribe({
      error: (error) => {
        // Assert
        expect(error).toBe(notFoundError);
        expect(mockProductoRepository.update).toHaveBeenCalledWith(productId, mockUpdateRequest);
        done();
      }
    });
  });

  it('should handle validation errors', (done) => {
    // Arrange
    const productId = 456;
    const validationError = new Error('Invalid SKU format');
    mockProductoRepository.update.mockReturnValue(throwError(() => validationError));

    // Act
    useCase.execute(productId, mockUpdateRequest).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe('Invalid SKU format');
        expect(mockProductoRepository.update).toHaveBeenCalledWith(productId, mockUpdateRequest);
        done();
      }
    });
  });

  it('should handle permission denied errors', (done) => {
    // Arrange
    const productId = 789;
    const permissionError = new Error('Permission denied');
    mockProductoRepository.update.mockReturnValue(throwError(() => permissionError));

    // Act
    useCase.execute(productId, mockUpdateRequest).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe('Permission denied');
        expect(mockProductoRepository.update).toHaveBeenCalledWith(productId, mockUpdateRequest);
        done();
      }
    });
  });

  it('should update cold chain status correctly', (done) => {
    // Arrange
    const productId = 321;
    const coldChainRequest: UpdateProductRequest = {
      requires_cold_chain: true,
      storage_conditions: {
        temperature_min: -18,
        temperature_max: -15,
        humidity_max: 85
      }
    };

    const coldChainResponse: ProductoDetailedEntity = {
      ...mockUpdatedProduct,
      id: productId,
      requires_cold_chain: true,
      storage_conditions: {
        temperature_min: -18,
        temperature_max: -15,
        humidity_max: 85
      }
    };

    mockProductoRepository.update.mockReturnValue(of(coldChainResponse));

    // Act
    useCase.execute(productId, coldChainRequest).subscribe({
      next: (result) => {
        // Assert
        expect(result.requires_cold_chain).toBe(true);
        expect(result.storage_conditions.temperature_min).toBe(-18);
        expect(mockProductoRepository.update).toHaveBeenCalledWith(productId, coldChainRequest);
        done();
      }
    });
  });

  it('should handle product status updates', (done) => {
    // Arrange
    const productId = 654;
    const statusRequest: UpdateProductRequest = {
      is_active: false,
      is_discontinued: true
    };

    const statusResponse: ProductoDetailedEntity = {
      ...mockUpdatedProduct,
      id: productId,
      is_active: false,
      is_discontinued: true
    };

    mockProductoRepository.update.mockReturnValue(of(statusResponse));

    // Act
    useCase.execute(productId, statusRequest).subscribe({
      next: (result) => {
        // Assert
        expect(result.is_active).toBe(false);
        expect(result.is_discontinued).toBe(true);
        expect(mockProductoRepository.update).toHaveBeenCalledWith(productId, statusRequest);
        done();
      }
    });
  });

  it('should work with edge case product IDs', (done) => {
    // Arrange
    const edgeCaseIds = [0, 1, Number.MAX_SAFE_INTEGER];
    let completedCalls = 0;

    edgeCaseIds.forEach(productId => {
      const expectedResponse = { ...mockUpdatedProduct, id: productId };
      mockProductoRepository.update.mockReturnValue(of(expectedResponse));

      // Act
      useCase.execute(productId, mockUpdateRequest).subscribe({
        next: (result) => {
          // Assert
          expect(result.id).toBe(productId);
          expect(mockProductoRepository.update).toHaveBeenCalledWith(productId, mockUpdateRequest);
          
          completedCalls++;
          if (completedCalls === edgeCaseIds.length) {
            done();
          }
        }
      });
    });
  });

  it('should preserve all optional fields when updating', (done) => {
    // Arrange
    const productId = 888;
    const fullRequest: UpdateProductRequest = {
      sku: 'FULL-UPDATE-001',
      name: 'Full Updated Product',
      category: 'Medical',
      unit_price: 750.00,
      unit_of_measure: 'vial',
      supplier_id: 5,
      description: 'Complete updated description',
      subcategory: 'Vaccines',
      currency: 'GBP',
      requires_cold_chain: true,
      storage_conditions: {
        temperature_min: 2,
        temperature_max: 8,
        humidity_max: 75
      },
      regulatory_info: {
        sanitary_registration: 'FULL-UPDATE-REG-001',
        requires_prescription: true,
        regulatory_class: 'PRESCRIPTION'
      },
      physical_dimensions: {
        weight_kg: 0.30,
        length_cm: 12,
        width_cm: 4,
        height_cm: 4
      },
      manufacturer: 'Full Updated Manufacturer Ltd',
      country_of_origin: 'Switzerland',
      barcode: '1111222233334',
      image_url: 'https://full-updated-example.com/product.jpg',
      is_active: true,
      is_discontinued: false
    };

    mockProductoRepository.update.mockReturnValue(of({
      ...mockUpdatedProduct,
      ...fullRequest,
      id: productId
    }));

    // Act
    useCase.execute(productId, fullRequest).subscribe({
      next: (result) => {
        // Assert
        expect(mockProductoRepository.update).toHaveBeenCalledWith(productId, fullRequest);
        expect(result.description).toBe('Complete updated description');
        expect(result.currency).toBe('GBP');
        expect(result.manufacturer).toBe('Full Updated Manufacturer Ltd');
        expect(result.country_of_origin).toBe('Switzerland');
        done();
      }
    });
  });

  it('should maintain repository method contract', (done) => {
    // Arrange
    const productId = 42;
    const updateRequest: UpdateProductRequest = { name: 'Contract Test' };
    mockProductoRepository.update.mockReturnValue(of(mockUpdatedProduct));

    // Act
    useCase.execute(productId, updateRequest).subscribe({
      next: (result) => {
        // Assert
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        expect(result.id).toBeDefined();
        expect(result.sku).toBeDefined();
        expect(result.name).toBeDefined();
        expect(Array.isArray(result.certifications)).toBe(true);
        expect(Array.isArray(result.regulatory_conditions)).toBe(true);
        expect(mockProductoRepository.update).toHaveBeenCalledWith(productId, updateRequest);
        done();
      }
    });
  });
});
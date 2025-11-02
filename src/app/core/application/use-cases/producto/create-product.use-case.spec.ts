import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CreateProductUseCase } from './create-product.use-case';
import { ProductoRepository, CreateProductRequest } from '../../../domain/repositories/producto.repository';
import { ProductoDetailedEntity } from '../../../domain/entities/producto.entity';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let mockProductoRepository: any;

  const mockCreateRequest: CreateProductRequest = {
    sku: 'TEST-001',
    name: 'Test Product',
    category: 'Electronics',
    unit_price: 99.99,
    unit_of_measure: 'unit',
    supplier_id: 1,
    description: 'Test description',
    subcategory: 'Mobile',
    currency: 'USD',
    requires_cold_chain: false,
    storage_conditions: {
      temperature_min: 15,
      temperature_max: 25,
      humidity_max: 60
    },
    regulatory_info: {
      sanitary_registration: 'REG-001',
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
    image_url: 'https://example.com/image.jpg'
  };

  const mockCreatedProduct: ProductoDetailedEntity = {
    id: 1,
    sku: 'TEST-001',
    name: 'Test Product',
    description: 'Test description',
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
      sanitary_registration: 'REG-001',
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
    certifications: [],
    regulatory_conditions: []
  };

  beforeEach(() => {
    const spy = {
      create: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        CreateProductUseCase,
        { provide: ProductoRepository, useValue: spy }
      ]
    });

    useCase = TestBed.inject(CreateProductUseCase);
    mockProductoRepository = TestBed.inject(ProductoRepository) as any;
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should call repository create method and return created product', (done) => {
    // Arrange
    mockProductoRepository.create.mockReturnValue(of(mockCreatedProduct));

    // Act
    useCase.execute(mockCreateRequest).subscribe({
      next: (result) => {
        // Assert
        expect(result).toEqual(mockCreatedProduct);
        expect(mockProductoRepository.create).toHaveBeenCalledWith(mockCreateRequest);
        expect(mockProductoRepository.create).toHaveBeenCalledTimes(1);
        done();
      }
    });
  });

  it('should pass the exact product data to repository', (done) => {
    // Arrange
    const specificRequest: CreateProductRequest = {
      sku: 'SPECIFIC-SKU',
      name: 'Specific Product',
      category: 'Medical',
      unit_price: 150.75,
      unit_of_measure: 'ml',
      supplier_id: 5
    };

    const expectedResponse: ProductoDetailedEntity = {
      ...mockCreatedProduct,
      sku: 'SPECIFIC-SKU',
      name: 'Specific Product',
      category: 'Medical',
      unit_price: 150.75,
      unit_of_measure: 'ml',
      supplier_id: 5
    };

    mockProductoRepository.create.mockReturnValue(of(expectedResponse));

    // Act
    useCase.execute(specificRequest).subscribe({
      next: (result) => {
        // Assert
        expect(mockProductoRepository.create).toHaveBeenCalledWith(specificRequest);
        expect(result).toEqual(expectedResponse);
        done();
      }
    });
  });

  it('should handle repository errors', (done) => {
    // Arrange
    const errorMessage = 'Failed to create product';
    mockProductoRepository.create.mockReturnValue(throwError(() => new Error(errorMessage)));

    // Act
    useCase.execute(mockCreateRequest).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe(errorMessage);
        expect(mockProductoRepository.create).toHaveBeenCalledWith(mockCreateRequest);
        done();
      }
    });
  });

  it('should handle validation errors from repository', (done) => {
    // Arrange
    const validationError = new Error('SKU already exists');
    mockProductoRepository.create.mockReturnValue(throwError(() => validationError));

    // Act
    useCase.execute(mockCreateRequest).subscribe({
      error: (error) => {
        // Assert
        expect(error).toBe(validationError);
        expect(mockProductoRepository.create).toHaveBeenCalledTimes(1);
        done();
      }
    });
  });

  it('should work with minimal required fields', (done) => {
    // Arrange
    const minimalRequest: CreateProductRequest = {
      sku: 'MIN-001',
      name: 'Minimal Product',
      category: 'Basic',
      unit_price: 10.00,
      unit_of_measure: 'piece',
      supplier_id: 1
    };

    const minimalResponse: ProductoDetailedEntity = {
      ...mockCreatedProduct,
      sku: 'MIN-001',
      name: 'Minimal Product',
      category: 'Basic',
      unit_price: 10.00,
      unit_of_measure: 'piece',
      supplier_id: 1,
      description: null,
      subcategory: null
    };

    mockProductoRepository.create.mockReturnValue(of(minimalResponse));

    // Act
    useCase.execute(minimalRequest).subscribe({
      next: (result) => {
        // Assert
        expect(mockProductoRepository.create).toHaveBeenCalledWith(minimalRequest);
        expect(result).toEqual(minimalResponse);
        done();
      }
    });
  });

  it('should work with cold chain products', (done) => {
    // Arrange
    const coldChainRequest: CreateProductRequest = {
      ...mockCreateRequest,
      requires_cold_chain: true,
      storage_conditions: {
        temperature_min: -20,
        temperature_max: -15,
        humidity_max: 80
      }
    };

    const coldChainResponse: ProductoDetailedEntity = {
      ...mockCreatedProduct,
      requires_cold_chain: true,
      storage_conditions: {
        temperature_min: -20,
        temperature_max: -15,
        humidity_max: 80
      }
    };

    mockProductoRepository.create.mockReturnValue(of(coldChainResponse));

    // Act
    useCase.execute(coldChainRequest).subscribe({
      next: (result) => {
        // Assert
        expect(result.requires_cold_chain).toBe(true);
        expect(result.storage_conditions.temperature_min).toBe(-20);
        expect(mockProductoRepository.create).toHaveBeenCalledWith(coldChainRequest);
        done();
      }
    });
  });

  it('should preserve all optional fields when provided', (done) => {
    // Arrange
    const fullRequest: CreateProductRequest = {
      sku: 'FULL-001',
      name: 'Full Product',
      category: 'Medical',
      unit_price: 500.00,
      unit_of_measure: 'vial',
      supplier_id: 3,
      description: 'Complete product description',
      subcategory: 'Vaccines',
      currency: 'EUR',
      requires_cold_chain: true,
      storage_conditions: {
        temperature_min: 2,
        temperature_max: 8,
        humidity_max: 75
      },
      regulatory_info: {
        sanitary_registration: 'FULL-REG-001',
        requires_prescription: true,
        regulatory_class: 'PRESCRIPTION'
      },
      physical_dimensions: {
        weight_kg: 0.25,
        length_cm: 8,
        width_cm: 3,
        height_cm: 3
      },
      manufacturer: 'Full Manufacturer Ltd',
      country_of_origin: 'Germany',
      barcode: '9876543210987',
      image_url: 'https://full-example.com/product.jpg'
    };

    mockProductoRepository.create.mockReturnValue(of({
      ...mockCreatedProduct,
      ...fullRequest,
      id: 999
    }));

    // Act
    useCase.execute(fullRequest).subscribe({
      next: (result) => {
        // Assert
        expect(mockProductoRepository.create).toHaveBeenCalledWith(fullRequest);
        expect(result.description).toBe('Complete product description');
        expect(result.currency).toBe('EUR');
        expect(result.manufacturer).toBe('Full Manufacturer Ltd');
        done();
      }
    });
  });
});
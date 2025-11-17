import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpProductoRepository } from './http-producto.repository';
import { ProductoDetailedEntity, ProductListResponse, ProductQueryParams } from '../../../domain/entities/producto.entity';
import { CreateProductRequest, UpdateProductRequest } from '../../../domain/repositories/producto.repository';
import { environment } from '../../../../../environments/environment';

describe('HttpProductoRepository', () => {
  let repository: HttpProductoRepository;
  let httpTestingController: HttpTestingController;
  let apiUrl: string;

  const mockProductoDetailed: ProductoDetailedEntity = {
    id: 1,
    sku: 'MED001',
    name: 'Producto Test',
    description: 'Descripción test',
    category: 'Medicamentos',
    subcategory: 'Analgésicos',
    unit_price: 100.50,
    currency: 'USD',
    unit_of_measure: 'unidad',
    supplier_id: 1,
    supplier_name: 'Proveedor Test',
    requires_cold_chain: false,
    storage_conditions: {
      temperature_min: null,
      temperature_max: null,
      humidity_max: null
    },
    regulatory_info: {
      sanitary_registration: 'REG123',
      requires_prescription: true,
      regulatory_class: 'Class A'
    },
    physical_dimensions: {
      weight_kg: 0.5,
      length_cm: 10,
      width_cm: 5,
      height_cm: 2
    },
    manufacturer: 'Manufacturer Test',
    country_of_origin: 'Colombia',
    barcode: '123456789',
    image_url: 'https://example.com/image.jpg',
    is_active: true,
    is_discontinued: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    certifications: [
      {
        id: 1,
        certification_type: 'ISO',
        certification_number: 'ISO-9001',
        certifying_body: 'ISO International',
        issue_date: '2024-01-01',
        expiry_date: '2025-01-01',
        is_valid: true,
        created_at: '2024-01-01T00:00:00Z'
      }
    ],
    regulatory_conditions: [
      {
        id: 1,
        condition_type: 'FDA Approval',
        description: 'FDA approved medication',
        authority: 'FDA',
        reference_number: 'FDA-001',
        effective_date: '2024-01-01',
        expiry_date: null,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      }
    ]
  };

  const mockProductListResponse: ProductListResponse = {
    products: [mockProductoDetailed],
    pagination: {
      page: 1,
      per_page: 20,
      total_pages: 1,
      total_items: 1,
      has_next: false,
      has_prev: false
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpProductoRepository]
    });

    repository = TestBed.inject(HttpProductoRepository);
    httpTestingController = TestBed.inject(HttpTestingController);
    apiUrl = `${environment.catalogApiUrl}/products`;
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(repository).toBeTruthy();
    });
  });

  describe('getAll', () => {
    it('should get all products without parameters', () => {
      repository.getAll().subscribe(response => {
        expect(response).toEqual(mockProductListResponse);
      });

      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockProductListResponse);
    });

    it('should get all products with parameters', () => {
      const params: ProductQueryParams = {
        search: 'test',
        category: 'Medicamentos',
        is_active: true,
        page: 2,
        per_page: 10
      };

      repository.getAll(params).subscribe(response => {
        expect(response).toEqual(mockProductListResponse);
      });

      const req = httpTestingController.expectOne(request => 
        request.url === apiUrl && 
        request.params.get('search') === 'test' &&
        request.params.get('category') === 'Medicamentos' &&
        request.params.get('is_active') === 'true' &&
        request.params.get('page') === '2' &&
        request.params.get('per_page') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockProductListResponse);
    });

    it('should handle null and undefined parameters correctly', () => {
      const params: ProductQueryParams = {
        search: 'test',
        category: null as any,
        is_active: undefined as any,
        page: 1,
        per_page: 0
      };

      repository.getAll(params).subscribe();

      const req = httpTestingController.expectOne(request => 
        request.url === apiUrl && 
        request.params.get('search') === 'test' &&
        request.params.get('page') === '1' &&
        request.params.get('per_page') === '0' &&
        !request.params.has('category') &&
        !request.params.has('is_active')
      );
      req.flush(mockProductListResponse);
    });

    it('should handle HTTP error responses', () => {
      repository.getAll().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.message).toBe('Error del servidor. Intente nuevamente.');
        }
      });

      const req = httpTestingController.expectOne(apiUrl);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getBySku', () => {
    it('should get product by SKU successfully', () => {
      const sku = 'MED001';

      repository.getBySku(sku).subscribe(response => {
        expect(response).toEqual(mockProductoDetailed);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/${sku}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProductoDetailed);
    });

    it('should handle product not found error', () => {
      const sku = 'NONEXISTENT';

      repository.getBySku(sku).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.message).toBe('Producto no encontrado en el catálogo');
        }
      });

      const req = httpTestingController.expectOne(`${apiUrl}/${sku}`);
      req.flush('Product not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle bad request error', () => {
      const sku = 'INVALID_SKU';

      repository.getBySku(sku).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.message).toBe('Parámetros de búsqueda inválidos');
        }
      });

      const req = httpTestingController.expectOne(`${apiUrl}/${sku}`);
      req.flush('Bad request', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getById', () => {
    it('should get product by ID successfully', () => {
      const id = 1;

      repository.getById(id).subscribe(response => {
        expect(response).toEqual(mockProductoDetailed);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProductoDetailed);
    });

    it('should handle product not found error by ID', () => {
      const id = 999;

      repository.getById(id).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.message).toBe('Producto no encontrado en el catálogo');
        }
      });

      const req = httpTestingController.expectOne(`${apiUrl}/${id}`);
      req.flush('Product not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('searchProducts', () => {
    it('should search products with default pagination', () => {
      const searchTerm = 'medicina';

      repository.searchProducts(searchTerm).subscribe(response => {
        expect(response).toEqual(mockProductListResponse);
      });

      const req = httpTestingController.expectOne(request => 
        request.url === apiUrl && 
        request.params.get('search') === searchTerm &&
        request.params.get('is_active') === 'true' &&
        request.params.get('page') === '1' &&
        request.params.get('per_page') === '20'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockProductListResponse);
    });

    it('should search products with custom pagination', () => {
      const searchTerm = 'medicina';
      const page = 2;
      const perPage = 10;

      repository.searchProducts(searchTerm, page, perPage).subscribe(response => {
        expect(response).toEqual(mockProductListResponse);
      });

      const req = httpTestingController.expectOne(request => 
        request.url === apiUrl && 
        request.params.get('search') === searchTerm &&
        request.params.get('is_active') === 'true' &&
        request.params.get('page') === '2' &&
        request.params.get('per_page') === '10'
      );
      req.flush(mockProductListResponse);
    });
  });

  describe('getActiveProducts', () => {
    it('should get active products with default pagination', () => {
      repository.getActiveProducts().subscribe(response => {
        expect(response).toEqual(mockProductListResponse);
      });

      const req = httpTestingController.expectOne(request => 
        request.url === apiUrl && 
        request.params.get('is_active') === 'true' &&
        request.params.get('page') === '1' &&
        request.params.get('per_page') === '20'
      );
      req.flush(mockProductListResponse);
    });

    it('should get active products with custom pagination', () => {
      const page = 3;
      const perPage = 15;

      repository.getActiveProducts(page, perPage).subscribe(response => {
        expect(response).toEqual(mockProductListResponse);
      });

      const req = httpTestingController.expectOne(request => 
        request.url === apiUrl && 
        request.params.get('is_active') === 'true' &&
        request.params.get('page') === '3' &&
        request.params.get('per_page') === '15'
      );
      req.flush(mockProductListResponse);
    });
  });

  describe('getProductsByCategory', () => {
    it('should get products by category with default pagination', () => {
      const category = 'Medicamentos';

      repository.getProductsByCategory(category).subscribe(response => {
        expect(response).toEqual(mockProductListResponse);
      });

      const req = httpTestingController.expectOne(request => 
        request.url === apiUrl && 
        request.params.get('category') === category &&
        request.params.get('is_active') === 'true' &&
        request.params.get('page') === '1' &&
        request.params.get('per_page') === '20'
      );
      req.flush(mockProductListResponse);
    });

    it('should get products by category with custom page', () => {
      const category = 'Equipos';
      const page = 2;

      repository.getProductsByCategory(category, page).subscribe(response => {
        expect(response).toEqual(mockProductListResponse);
      });

      const req = httpTestingController.expectOne(request => 
        request.url === apiUrl && 
        request.params.get('category') === category &&
        request.params.get('is_active') === 'true' &&
        request.params.get('page') === '2' &&
        request.params.get('per_page') === '20'
      );
      req.flush(mockProductListResponse);
    });
  });

  describe('getColdChainProducts', () => {
    it('should get cold chain products with default pagination', () => {
      repository.getColdChainProducts().subscribe(response => {
        expect(response).toEqual(mockProductListResponse);
      });

      const req = httpTestingController.expectOne(request => 
        request.url === apiUrl && 
        request.params.get('requires_cold_chain') === 'true' &&
        request.params.get('is_active') === 'true' &&
        request.params.get('page') === '1' &&
        request.params.get('per_page') === '20'
      );
      req.flush(mockProductListResponse);
    });

    it('should get cold chain products with custom page', () => {
      const page = 2;

      repository.getColdChainProducts(page).subscribe(response => {
        expect(response).toEqual(mockProductListResponse);
      });

      const req = httpTestingController.expectOne(request => 
        request.url === apiUrl && 
        request.params.get('requires_cold_chain') === 'true' &&
        request.params.get('is_active') === 'true' &&
        request.params.get('page') === '2' &&
        request.params.get('per_page') === '20'
      );
      req.flush(mockProductListResponse);
    });
  });

  describe('getProductsBySupplier', () => {
    it('should get products by supplier with default pagination', () => {
      const supplierId = 123;

      repository.getProductsBySupplier(supplierId).subscribe(response => {
        expect(response).toEqual(mockProductListResponse);
      });

      const req = httpTestingController.expectOne(request => 
        request.url === apiUrl && 
        request.params.get('supplier_id') === '123' &&
        request.params.get('is_active') === 'true' &&
        request.params.get('page') === '1' &&
        request.params.get('per_page') === '20'
      );
      req.flush(mockProductListResponse);
    });

    it('should get products by supplier with custom page', () => {
      const supplierId = 456;
      const page = 3;

      repository.getProductsBySupplier(supplierId, page).subscribe(response => {
        expect(response).toEqual(mockProductListResponse);
      });

      const req = httpTestingController.expectOne(request => 
        request.url === apiUrl && 
        request.params.get('supplier_id') === '456' &&
        request.params.get('is_active') === 'true' &&
        request.params.get('page') === '3' &&
        request.params.get('per_page') === '20'
      );
      req.flush(mockProductListResponse);
    });
  });

  describe('create', () => {
    it('should create product successfully', () => {
      const createRequest: CreateProductRequest = {
        sku: 'MED002',
        name: 'Nuevo Producto',
        description: 'Descripción del nuevo producto',
        category: 'Medicamentos',
        unit_price: 200.00,
        currency: 'USD',
        unit_of_measure: 'unidad',
        supplier_id: 1,
        requires_cold_chain: true,
        storage_conditions: {
          temperature_min: 2,
          temperature_max: 8,
          humidity_max: 60
        },
        regulatory_info: {
          requires_prescription: false,
          sanitary_registration: 'REG456',
          regulatory_class: 'Class B'
        }
      };

      repository.create(createRequest).subscribe(response => {
        expect(response).toEqual(mockProductoDetailed);
      });

      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockProductoDetailed);
    });

    it('should handle create product error', () => {
      const createRequest: CreateProductRequest = {
        sku: 'INVALID',
        name: '',
        description: '',
        category: '',
        unit_price: -1,
        currency: '',
        unit_of_measure: '',
        supplier_id: 0,
        requires_cold_chain: false
      };

      repository.create(createRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.message).toBe('Parámetros de búsqueda inválidos');
        }
      });

      const req = httpTestingController.expectOne(apiUrl);
      req.flush('Validation error', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('update', () => {
    it('should update product successfully', () => {
      const productId = 1;
      const updateRequest: UpdateProductRequest = {
        name: 'Producto Actualizado',
        description: 'Descripción actualizada',
        unit_price: 150.00
      };

      repository.update(productId, updateRequest).subscribe(response => {
        expect(response).toEqual(mockProductoDetailed);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/${productId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockProductoDetailed);
    });

    it('should handle update product not found error', () => {
      const productId = 999;
      const updateRequest: UpdateProductRequest = {
        name: 'Producto Actualizado'
      };

      repository.update(productId, updateRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.message).toBe('Producto no encontrado en el catálogo');
        }
      });

      const req = httpTestingController.expectOne(`${apiUrl}/${productId}`);
      req.flush('Product not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('delete', () => {
    it('should delete product successfully', () => {
      const productId = 1;

      repository.delete(productId).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpTestingController.expectOne(`${apiUrl}/${productId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle delete product not found error', () => {
      const productId = 999;

      repository.delete(productId).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.message).toBe('Producto no encontrado en el catálogo');
        }
      });

      const req = httpTestingController.expectOne(`${apiUrl}/${productId}`);
      req.flush('Product not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('buildHttpParams (private method integration)', () => {
    it('should build HTTP params correctly with all parameter types', () => {
      const params: ProductQueryParams = {
        search: 'test search',
        category: 'Medicamentos',
        is_active: true,
        page: 2,
        per_page: 10,
        requires_cold_chain: false,
        supplier_id: 123
      };

      repository.getAll(params).subscribe();

      const req = httpTestingController.expectOne(request => {
        const requestParams = request.params;
        return request.url === apiUrl &&
               requestParams.get('search') === 'test search' &&
               requestParams.get('category') === 'Medicamentos' &&
               requestParams.get('is_active') === 'true' &&
               requestParams.get('page') === '2' &&
               requestParams.get('per_page') === '10' &&
               requestParams.get('requires_cold_chain') === 'false' &&
               requestParams.get('supplier_id') === '123';
      });
      req.flush(mockProductListResponse);
    });
  });

  describe('handleError (private method integration)', () => {
    it('should handle client-side errors (ErrorEvent)', () => {
      repository.getAll().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.message).toBe('Error: Network error');
        }
      });

      const req = httpTestingController.expectOne(apiUrl);
      req.error(new ErrorEvent('Network error', { message: 'Network error' }));
    });

    it('should handle 400 error with custom error message', () => {
      repository.getAll().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.message).toBe('Custom validation error');
        }
      });

      const req = httpTestingController.expectOne(apiUrl);
      req.flush({ error: 'Custom validation error' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle unknown HTTP error status', () => {
      repository.getAll().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.message).toBe('Error 503: Service Unavailable');
        }
      });

      const req = httpTestingController.expectOne(apiUrl);
      req.flush('Service Unavailable', { status: 503, statusText: 'Service Unavailable' });
    });

    it('should handle unknown HTTP error with error object', () => {
      repository.getAll().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.message).toBe('Error 422: Custom error message');
        }
      });

      const req = httpTestingController.expectOne(apiUrl);
      req.flush({ error: 'Custom error message' }, { status: 422, statusText: 'Unprocessable Entity' });
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle empty parameters object', () => {
      repository.getAll({}).subscribe();

      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockProductListResponse);
    });

    it('should handle mixed valid and invalid parameters', () => {
      const params = {
        search: 'valid search',
        category: '',
        is_active: null,
        page: undefined,
        per_page: 0
      } as any;

      repository.getAll(params).subscribe();

      const req = httpTestingController.expectOne(request => 
        request.url === apiUrl && 
        request.params.get('search') === 'valid search' &&
        request.params.get('per_page') === '0' &&
        !request.params.has('category') &&
        !request.params.has('is_active') &&
        !request.params.has('page')
      );
      req.flush(mockProductListResponse);
    });

    it('should handle boolean parameters correctly', () => {
      const params: ProductQueryParams = {
        is_active: true,
        requires_cold_chain: false
      };

      repository.getAll(params).subscribe();

      const req = httpTestingController.expectOne(request => 
        request.url === apiUrl && 
        request.params.get('is_active') === 'true' &&
        request.params.get('requires_cold_chain') === 'false'
      );
      req.flush(mockProductListResponse);
    });

    it('should handle numeric parameters correctly', () => {
      const params: ProductQueryParams = {
        page: 0,
        per_page: 100,
        supplier_id: 999
      };

      repository.getAll(params).subscribe();

      const req = httpTestingController.expectOne(request => 
        request.url === apiUrl && 
        request.params.get('page') === '0' &&
        request.params.get('per_page') === '100' &&
        request.params.get('supplier_id') === '999'
      );
      req.flush(mockProductListResponse);
    });
  });
});
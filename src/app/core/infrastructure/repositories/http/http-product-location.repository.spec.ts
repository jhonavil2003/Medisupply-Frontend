import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpProductLocationRepository } from './http-product-location.repository';
import { ProductLocationResponse } from '../../../domain/entities/product-location.entity';
import { environment } from '../../../../../environments/environment';

describe('HttpProductLocationRepository', () => {
  let repository: HttpProductLocationRepository;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.logisticsApiUrl}/inventory`;

  const mockResponse: ProductLocationResponse = {
    found: true,
    product_skus: ['GLV-LAT-M'],
    total_locations: 6,
    total_quantity: 210,
    ordering: 'fefo',
    locations: [
      {
        batch: {
          id: 1,
          product_sku: 'GLV-LAT-M',
          location_id: 100,
          distribution_center_id: 1,
          batch_info: {
            barcode: '7501234567890',
            batch_number: 'BATCH-001',
            internal_code: 'INT-001',
            qr_code: 'QR-001',
            quantity: 35
          },
          dates: {
            days_until_expiry: 179,
            expiry_date: '2026-04-25',
            manufactured_date: '2025-10-01'
          },
          status: {
            expiry_status: 'valid',
            is_available: true,
            is_expired: false,
            is_near_expiry: false,
            is_quarantine: false
          },
          temperature_requirements: {
            max: null,
            min: null,
            range: null
          },
          notes: null,
          created_at: '2025-10-27T00:00:00Z',
          updated_at: '2025-10-27T00:00:00Z',
          created_by: null
        },
        physical_location: {
          location_code: 'A-01-01-01',
          aisle: 'A',
          shelf: '01',
          level_position: '01',
          zone_type: 'ambient',
          is_refrigerated: false
        },
        distribution_center: {
          id: 1,
          code: 'CD-BOG',
          name: 'Centro de Distribución Bogotá',
          city: 'Bogotá',
          supports_cold_chain: true
        }
      }
    ],
    search_criteria: {
      search_term: null,
      product_sku: 'GLV-LAT-M',
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
    timestamp: '2025-10-27T00:00:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpProductLocationRepository]
    });

    repository = TestBed.inject(HttpProductLocationRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getProductLocation', () => {
    it('debería obtener la ubicación del producto por SKU', (done) => {
      const params = { product_sku: 'GLV-LAT-M', only_available: true };

      repository.getProductLocation(params).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(response.found).toBe(true);
          expect(response.total_locations).toBe(6);
          expect(response.locations).toHaveLength(1);
          done();
        }
      });

      const req = httpMock.expectOne((request) => {
        return request.url === `${apiUrl}/product-location` &&
               request.params.get('product_sku') === 'GLV-LAT-M' &&
               request.params.get('only_available') === 'true';
      });

      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('debería obtener la ubicación del producto por término de búsqueda', (done) => {
      const params = { search_term: 'bata' };

      repository.getProductLocation(params).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          done();
        }
      });

      const req = httpMock.expectOne((request) => {
        return request.url === `${apiUrl}/product-location` &&
               request.params.get('search_term') === 'bata';
      });

      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('debería manejar error 404 cuando el producto no es encontrado', (done) => {
      const params = { product_sku: 'NONEXISTENT' };

      repository.getProductLocation(params).subscribe({
        error: (error) => {
          expect(error.message).toBe('Producto no encontrado en bodega');
          done();
        }
      });

      const req = httpMock.expectOne((request) => request.url === `${apiUrl}/product-location`);
      req.flush({ error: 'Not found' }, { status: 404, statusText: 'Not Found' });
    });

    it('debería manejar error 500 del servidor', (done) => {
      const params = { product_sku: 'TEST-001' };

      repository.getProductLocation(params).subscribe({
        error: (error) => {
          expect(error.message).toBe('Error del servidor de logística. Intente nuevamente.');
          done();
        }
      });

      const req = httpMock.expectOne((request) => request.url === `${apiUrl}/product-location`);
      req.flush({ error: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getLocationBySku', () => {
    it('debería obtener ubicación por SKU con ordenamiento predeterminado', (done) => {
      repository.getLocationBySku('GLV-LAT-M').subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          done();
        }
      });

      const req = httpMock.expectOne((request) => {
        return request.url === `${apiUrl}/product-location` &&
               request.params.get('product_sku') === 'GLV-LAT-M' &&
               request.params.get('only_available') === 'true' &&
               request.params.get('order_by') === 'fefo';
      });

      req.flush(mockResponse);
    });

    it('debería obtener ubicación por SKU con ordenamiento personalizado', (done) => {
      repository.getLocationBySku('GLV-LAT-M', 'fifo').subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          done();
        }
      });

      const req = httpMock.expectOne((request) => {
        return request.params.get('order_by') === 'fifo';
      });

      req.flush(mockResponse);
    });
  });

  describe('getLocationByBarcode', () => {
    it('debería obtener ubicación por código de barras', (done) => {
      repository.getLocationByBarcode('7501234567890').subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          done();
        }
      });

      const req = httpMock.expectOne((request) => {
        return request.url === `${apiUrl}/product-location` &&
               request.params.get('barcode') === '7501234567890' &&
               request.params.get('only_available') === 'true';
      });

      req.flush(mockResponse);
    });
  });

  describe('searchProductLocation', () => {
    it('debería buscar con onlyAvailable = true por defecto', (done) => {
      repository.searchProductLocation('bata').subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          done();
        }
      });

      const req = httpMock.expectOne((request) => {
        return request.params.get('search_term') === 'bata' &&
               request.params.get('only_available') === 'true' &&
               request.params.get('order_by') === 'fefo';
      });

      req.flush(mockResponse);
    });

    it('debería buscar con onlyAvailable = false', (done) => {
      repository.searchProductLocation('guantes', false).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          done();
        }
      });

      const req = httpMock.expectOne((request) => {
        return request.params.get('search_term') === 'guantes' &&
               request.params.get('only_available') === 'false';
      });

      req.flush(mockResponse);
    });
  });

  describe('getStockLevels', () => {
    it('debería obtener niveles de stock para un producto', (done) => {
      const mockStockResponse = {
        product_sku: 'GLV-LAT-M',
        total_available: 210,
        total_reserved: 0,
        total_in_transit: 0,
        distribution_centers: [],
        timestamp: '2025-10-27T00:00:00Z'
      };

      repository.getStockLevels('GLV-LAT-M').subscribe({
        next: (response) => {
          expect(response).toEqual(mockStockResponse);
          expect(response.total_available).toBe(210);
          done();
        }
      });

      const req = httpMock.expectOne((request) => {
        return request.url === `${apiUrl}/stock-levels` &&
               request.params.get('product_sku') === 'GLV-LAT-M';
      });

      req.flush(mockStockResponse);
    });

    it('debería obtener niveles de stock con filtro de centro de distribución', (done) => {
      const mockStockResponse = {
        total_available: 50,
        timestamp: '2025-10-27T00:00:00Z'
      };

      repository.getStockLevels('GLV-LAT-M', 1).subscribe({
        next: (response) => {
          expect(response).toEqual(mockStockResponse);
          done();
        }
      });

      const req = httpMock.expectOne((request) => {
        return request.url === `${apiUrl}/stock-levels` &&
               request.params.get('product_sku') === 'GLV-LAT-M' &&
               request.params.get('distribution_center_id') === '1';
      });

      req.flush(mockStockResponse);
    });
  });
});

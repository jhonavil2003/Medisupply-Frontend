import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import {
  GetProductLocationUseCase,
  SearchProductLocationUseCase,
  GetLocationBySkuUseCase,
  GetLocationByBarcodeUseCase,
  GetStockLevelsUseCase
} from './product-location.use-cases';
import { ProductLocationRepository } from '../../../domain/repositories/product-location.repository';
import { ProductLocationResponse } from '../../../domain/entities/product-location.entity';

describe('Casos de Uso de Localización de Productos', () => {
  let mockRepository: Partial<ProductLocationRepository>;

  const mockResponse: ProductLocationResponse = {
    found: true,
    product_skus: ['GLV-LAT-M'],
    total_locations: 6,
    total_quantity: 210,
    ordering: 'fefo',
    locations: [],
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
    mockRepository = {
      getProductLocation: jest.fn(),
      searchProductLocation: jest.fn(),
      getLocationBySku: jest.fn(),
      getLocationByBarcode: jest.fn(),
      getStockLevels: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        GetProductLocationUseCase,
        SearchProductLocationUseCase,
        GetLocationBySkuUseCase,
        GetLocationByBarcodeUseCase,
        GetStockLevelsUseCase,
        { provide: ProductLocationRepository, useValue: mockRepository }
      ]
    });
  });

  describe('GetProductLocationUseCase', () => {
    let useCase: GetProductLocationUseCase;

    beforeEach(() => {
      useCase = TestBed.inject(GetProductLocationUseCase);
    });

    it('debería ser creado', () => {
      expect(useCase).toBeTruthy();
    });

    it('debería ejecutarse exitosamente con product_sku', (done) => {
      (mockRepository.getProductLocation as jest.Mock).mockReturnValue(of(mockResponse));

      useCase.execute({ product_sku: 'GLV-LAT-M' }).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(mockRepository.getProductLocation).toHaveBeenCalledWith({ product_sku: 'GLV-LAT-M' });
          done();
        }
      });
    });

    it('debería lanzar error cuando no se proporciona criterio de búsqueda', () => {
      expect(() => {
        useCase.execute({});
      }).toThrowError('Se requiere al menos un criterio de búsqueda');
    });

    it('debería ejecutarse exitosamente con search_term', (done) => {
      (mockRepository.getProductLocation as jest.Mock).mockReturnValue(of(mockResponse));

      useCase.execute({ search_term: 'bata' }).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(mockRepository.getProductLocation).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  describe('SearchProductLocationUseCase', () => {
    let useCase: SearchProductLocationUseCase;

    beforeEach(() => {
      useCase = TestBed.inject(SearchProductLocationUseCase);
    });

    it('debería ser creado', () => {
      expect(useCase).toBeTruthy();
    });

    it('debería ejecutarse exitosamente con término de búsqueda válido', (done) => {
      (mockRepository.searchProductLocation as jest.Mock).mockReturnValue(of(mockResponse));

      useCase.execute('GLV-LAT-M').subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(mockRepository.searchProductLocation).toHaveBeenCalledWith('GLV-LAT-M', true);
          done();
        }
      });
    });

    it('debería lanzar error cuando el término de búsqueda está vacío', () => {
      expect(() => {
        useCase.execute('');
      }).toThrowError('El término de búsqueda es requerido');
    });

    it('debería lanzar error cuando el término de búsqueda tiene menos de 3 caracteres', () => {
      expect(() => {
        useCase.execute('ab');
      }).toThrowError('El término de búsqueda debe tener al menos 3 caracteres');
    });

    it('debería eliminar espacios del término de búsqueda antes de ejecutar', (done) => {
      (mockRepository.searchProductLocation as jest.Mock).mockReturnValue(of(mockResponse));

      useCase.execute('  GLV-LAT-M  ').subscribe({
        next: () => {
          expect(mockRepository.searchProductLocation).toHaveBeenCalledWith('GLV-LAT-M', true);
          done();
        }
      });
    });

    it('debería ejecutarse con onlyAvailable = false', (done) => {
      (mockRepository.searchProductLocation as jest.Mock).mockReturnValue(of(mockResponse));

      useCase.execute('bata', false).subscribe({
        next: () => {
          expect(mockRepository.searchProductLocation).toHaveBeenCalledWith('bata', false);
          done();
        }
      });
    });
  });

  describe('GetLocationBySkuUseCase', () => {
    let useCase: GetLocationBySkuUseCase;

    beforeEach(() => {
      useCase = TestBed.inject(GetLocationBySkuUseCase);
    });

    it('debería ser creado', () => {
      expect(useCase).toBeTruthy();
    });

    it('debería ejecutarse exitosamente con SKU', (done) => {
      (mockRepository.getLocationBySku as jest.Mock).mockReturnValue(of(mockResponse));

      useCase.execute('GLV-LAT-M').subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(mockRepository.getLocationBySku).toHaveBeenCalledWith('GLV-LAT-M', 'fefo');
          done();
        }
      });
    });

    it('debería lanzar error cuando el SKU está vacío', () => {
      expect(() => {
        useCase.execute('');
      }).toThrowError('El SKU es requerido');
    });

    it('debería ejecutarse con order_by personalizado', (done) => {
      (mockRepository.getLocationBySku as jest.Mock).mockReturnValue(of(mockResponse));

      useCase.execute('GLV-LAT-M', 'fifo').subscribe({
        next: () => {
          expect(mockRepository.getLocationBySku).toHaveBeenCalledWith('GLV-LAT-M', 'fifo');
          done();
        }
      });
    });

    it('debería eliminar espacios del SKU antes de ejecutar', (done) => {
      (mockRepository.getLocationBySku as jest.Mock).mockReturnValue(of(mockResponse));

      useCase.execute('  GLV-LAT-M  ').subscribe({
        next: () => {
          expect(mockRepository.getLocationBySku).toHaveBeenCalledWith('GLV-LAT-M', 'fefo');
          done();
        }
      });
    });
  });

  describe('GetLocationByBarcodeUseCase', () => {
    let useCase: GetLocationByBarcodeUseCase;

    beforeEach(() => {
      useCase = TestBed.inject(GetLocationByBarcodeUseCase);
    });

    it('debería ser creado', () => {
      expect(useCase).toBeTruthy();
    });

    it('debería ejecutarse exitosamente con código de barras', (done) => {
      (mockRepository.getLocationByBarcode as jest.Mock).mockReturnValue(of(mockResponse));

      useCase.execute('7501234567890').subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(mockRepository.getLocationByBarcode).toHaveBeenCalledWith('7501234567890');
          done();
        }
      });
    });

    it('debería lanzar error cuando el código de barras está vacío', () => {
      expect(() => {
        useCase.execute('');
      }).toThrowError('El código de barras es requerido');
    });

    it('debería eliminar espacios del código de barras antes de ejecutar', (done) => {
      (mockRepository.getLocationByBarcode as jest.Mock).mockReturnValue(of(mockResponse));

      useCase.execute('  7501234567890  ').subscribe({
        next: () => {
          expect(mockRepository.getLocationByBarcode).toHaveBeenCalledWith('7501234567890');
          done();
        }
      });
    });
  });

  describe('GetStockLevelsUseCase', () => {
    let useCase: GetStockLevelsUseCase;

    beforeEach(() => {
      useCase = TestBed.inject(GetStockLevelsUseCase);
    });

    it('debería ser creado', () => {
      expect(useCase).toBeTruthy();
    });

    it('debería ejecutarse exitosamente con SKU del producto', (done) => {
      const mockStockResponse = {
        product_sku: 'GLV-LAT-M',
        total_available: 210,
        timestamp: '2025-10-27T00:00:00Z'
      };
      (mockRepository.getStockLevels as jest.Mock).mockReturnValue(of(mockStockResponse));

      useCase.execute('GLV-LAT-M').subscribe({
        next: (response) => {
          expect(response).toEqual(mockStockResponse);
          expect(mockRepository.getStockLevels).toHaveBeenCalledWith('GLV-LAT-M', undefined);
          done();
        }
      });
    });

    it('debería lanzar error cuando el SKU del producto está vacío', () => {
      expect(() => {
        useCase.execute('');
      }).toThrowError('El SKU del producto es requerido');
    });

    it('debería ejecutarse con ID de centro de distribución', (done) => {
      const mockStockResponse = { total_available: 50, timestamp: '2025-10-27T00:00:00Z' };
      (mockRepository.getStockLevels as jest.Mock).mockReturnValue(of(mockStockResponse));

      useCase.execute('GLV-LAT-M', 1).subscribe({
        next: () => {
          expect(mockRepository.getStockLevels).toHaveBeenCalledWith('GLV-LAT-M', 1);
          done();
        }
      });
    });
  });
});

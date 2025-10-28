import {
  ProductLocationItem,
  ProductLocationResponse,
  ProductLocationQueryParams,
  Batch,
  PhysicalLocation,
  DistributionCenter
} from './product-location.entity';

describe('Entidades de Localización de Productos', () => {
  describe('ProductLocationItem', () => {
    it('debería crear un ProductLocationItem válido', () => {
      const location: ProductLocationItem = {
        batch: {
          id: 1,
          product_sku: 'TEST-001',
          location_id: 100,
          distribution_center_id: 1,
          batch_info: {
            barcode: '123456789',
            batch_number: 'BATCH-001',
            internal_code: 'INT-001',
            qr_code: 'QR-001',
            quantity: 50
          },
          dates: {
            days_until_expiry: 180,
            expiry_date: '2026-04-25',
            manufactured_date: '2025-10-25'
          },
          status: {
            expiry_status: 'valid',
            is_available: true,
            is_expired: false,
            is_near_expiry: false,
            is_quarantine: false
          },
          temperature_requirements: {
            max: 8,
            min: 2,
            range: '2°C - 8°C'
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
          zone_type: 'refrigerated',
          is_refrigerated: true
        },
        distribution_center: {
          id: 1,
          code: 'CD-BOG',
          name: 'Centro de Distribución Bogotá',
          city: 'Bogotá',
          supports_cold_chain: true
        }
      };

      expect(location).toBeDefined();
      expect(location.batch.batch_info.quantity).toBe(50);
      expect(location.physical_location.location_code).toBe('A-01-01-01');
      expect(location.distribution_center.supports_cold_chain).toBe(true);
    });
  });

  describe('ProductLocationQueryParams', () => {
    it('debería crear parámetros de consulta con search_term', () => {
      const params: ProductLocationQueryParams = {
        search_term: 'bata',
        only_available: true,
        order_by: 'fefo'
      };

      expect(params.search_term).toBe('bata');
      expect(params.only_available).toBe(true);
      expect(params.order_by).toBe('fefo');
    });

    it('debería crear parámetros de consulta con product_sku', () => {
      const params: ProductLocationQueryParams = {
        product_sku: 'GLV-LAT-M',
        zone_type: 'refrigerated'
      };

      expect(params.product_sku).toBe('GLV-LAT-M');
      expect(params.zone_type).toBe('refrigerated');
    });

    it('debería crear parámetros de consulta con barcode', () => {
      const params: ProductLocationQueryParams = {
        barcode: '7501234567890'
      };

      expect(params.barcode).toBe('7501234567890');
    });
  });

  describe('ProductLocationResponse', () => {
    it('debería crear una respuesta válida cuando el producto es encontrado', () => {
      const response: ProductLocationResponse = {
        found: true,
        product_skus: ['GLV-LAT-M'],
        total_locations: 6,
        total_quantity: 210,
        ordering: 'fefo',
        locations: [],
        search_criteria: {
          search_term: 'GLV-LAT-M',
          product_sku: null,
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

      expect(response.found).toBe(true);
      expect(response.total_locations).toBe(6);
      expect(response.total_quantity).toBe(210);
      expect(response.product_skus).toContain('GLV-LAT-M');
    });

    it('debería crear una respuesta válida cuando el producto no es encontrado', () => {
      const response: ProductLocationResponse = {
        found: false,
        product_skus: [],
        total_locations: 0,
        total_quantity: 0,
        ordering: 'fefo',
        locations: [],
        search_criteria: {
          search_term: 'NONEXISTENT',
          product_sku: null,
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

      expect(response.found).toBe(false);
      expect(response.total_locations).toBe(0);
      expect(response.locations).toHaveLength(0);
    });
  });

  describe('Estado del Lote', () => {
    it('debería validar un lote vencido', () => {
      const batch: Batch = {
        id: 1,
        product_sku: 'TEST-001',
        location_id: 100,
        distribution_center_id: 1,
        batch_info: {
          barcode: '123456789',
          batch_number: 'BATCH-001',
          internal_code: 'INT-001',
          qr_code: 'QR-001',
          quantity: 10
        },
        dates: {
          days_until_expiry: -5,
          expiry_date: '2025-10-20',
          manufactured_date: '2025-09-01'
        },
        status: {
          expiry_status: 'expired',
          is_available: false,
          is_expired: true,
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
      };

      expect(batch.status.is_expired).toBe(true);
      expect(batch.status.is_available).toBe(false);
      expect(batch.dates.days_until_expiry).toBeLessThan(0);
    });

    it('debería validar un lote próximo a vencer', () => {
      const batch: Batch = {
        id: 2,
        product_sku: 'TEST-002',
        location_id: 101,
        distribution_center_id: 1,
        batch_info: {
          barcode: '987654321',
          batch_number: 'BATCH-002',
          internal_code: 'INT-002',
          qr_code: 'QR-002',
          quantity: 20
        },
        dates: {
          days_until_expiry: 25,
          expiry_date: '2025-11-21',
          manufactured_date: '2025-09-15'
        },
        status: {
          expiry_status: 'near_expiry',
          is_available: true,
          is_expired: false,
          is_near_expiry: true,
          is_quarantine: false
        },
        temperature_requirements: {
          max: 25,
          min: 15,
          range: '15°C - 25°C'
        },
        notes: 'Producto próximo a vencer',
        created_at: '2025-10-27T00:00:00Z',
        updated_at: '2025-10-27T00:00:00Z',
        created_by: 'admin'
      };

      expect(batch.status.is_near_expiry).toBe(true);
      expect(batch.status.is_available).toBe(true);
      expect(batch.dates.days_until_expiry).toBeGreaterThan(0);
      expect(batch.dates.days_until_expiry).toBeLessThan(30);
    });
  });
});

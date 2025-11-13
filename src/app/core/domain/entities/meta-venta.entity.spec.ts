import { MetaVentaEntity, Region, Trimestre, TipoMeta, VendedorInfo, ProductoInfo, CreateMetaVentaDto, UpdateMetaVentaDto } from './meta-venta.entity';

describe('MetaVentaEntity', () => {
  describe('Region Enum', () => {
    it('should have correct values', () => {
      expect(Region.NORTE).toBe('Norte');
      expect(Region.SUR).toBe('Sur');
      expect(Region.ESTE).toBe('Este');
      expect(Region.OESTE).toBe('Oeste');
    });

    it('should have all regions defined', () => {
      const regions = Object.values(Region);
      expect(regions).toHaveLength(4);
      expect(regions).toContain('Norte');
      expect(regions).toContain('Sur');
      expect(regions).toContain('Este');
      expect(regions).toContain('Oeste');
    });
  });

  describe('Trimestre Enum', () => {
    it('should have correct values', () => {
      expect(Trimestre.Q1).toBe('Q1');
      expect(Trimestre.Q2).toBe('Q2');
      expect(Trimestre.Q3).toBe('Q3');
      expect(Trimestre.Q4).toBe('Q4');
    });

    it('should have all quarters defined', () => {
      const trimestres = Object.values(Trimestre);
      expect(trimestres).toHaveLength(4);
      expect(trimestres).toContain('Q1');
      expect(trimestres).toContain('Q2');
      expect(trimestres).toContain('Q3');
      expect(trimestres).toContain('Q4');
    });
  });

  describe('TipoMeta Enum', () => {
    it('should have correct values', () => {
      expect(TipoMeta.UNIDADES).toBe('unidades');
      expect(TipoMeta.MONETARIO).toBe('monetario');
    });

    it('should have all types defined', () => {
      const tipos = Object.values(TipoMeta);
      expect(tipos).toHaveLength(2);
      expect(tipos).toContain('unidades');
      expect(tipos).toContain('monetario');
    });
  });

  describe('MetaVentaEntity Interface', () => {
    it('should create a valid MetaVentaEntity object with all fields', () => {
      const vendedor: VendedorInfo = {
        employeeId: 'VE-01',
        nombreCompleto: 'Juan Pérez',
        email: 'juan.perez@example.com'
      };

      const producto: ProductoInfo = {
        sku: 'SKU-001',
        name: 'Producto A',
        description: 'Descripción del producto',
        unitPrice: 100.50,
        isActive: true
      };

      const meta: MetaVentaEntity = {
        id: 1,
        idVendedor: 'VE-01',
        idProducto: 'SKU-001',
        region: Region.NORTE,
        trimestre: Trimestre.Q1,
        valorObjetivo: 100000,
        tipo: TipoMeta.MONETARIO,
        fechaCreacion: '2024-01-01T00:00:00Z',
        fechaActualizacion: '2024-01-01T00:00:00Z',
        vendedor,
        producto
      };

      expect(meta.id).toBe(1);
      expect(meta.idVendedor).toBe('VE-01');
      expect(meta.idProducto).toBe('SKU-001');
      expect(meta.region).toBe(Region.NORTE);
      expect(meta.trimestre).toBe(Trimestre.Q1);
      expect(meta.valorObjetivo).toBe(100000);
      expect(meta.tipo).toBe(TipoMeta.MONETARIO);
      expect(meta.vendedor?.employeeId).toBe('VE-01');
      expect(meta.producto?.sku).toBe('SKU-001');
    });

    it('should create a MetaVentaEntity with minimal required fields', () => {
      const meta: MetaVentaEntity = {
        idVendedor: 'VE-01',
        idProducto: 'SKU-001',
        region: Region.SUR,
        trimestre: Trimestre.Q2,
        valorObjetivo: 50000,
        tipo: TipoMeta.UNIDADES
      };

      expect(meta).toBeDefined();
      expect(meta.idVendedor).toBe('VE-01');
      expect(meta.id).toBeUndefined();
      expect(meta.vendedor).toBeUndefined();
      expect(meta.producto).toBeUndefined();
    });

    it('should handle different regions correctly', () => {
      const metaNorte: Partial<MetaVentaEntity> = { region: Region.NORTE };
      const metaSur: Partial<MetaVentaEntity> = { region: Region.SUR };
      const metaEste: Partial<MetaVentaEntity> = { region: Region.ESTE };
      const metaOeste: Partial<MetaVentaEntity> = { region: Region.OESTE };

      expect(metaNorte.region).toBe('Norte');
      expect(metaSur.region).toBe('Sur');
      expect(metaEste.region).toBe('Este');
      expect(metaOeste.region).toBe('Oeste');
    });

    it('should handle different trimestres correctly', () => {
      const metaQ1: Partial<MetaVentaEntity> = { trimestre: Trimestre.Q1 };
      const metaQ2: Partial<MetaVentaEntity> = { trimestre: Trimestre.Q2 };
      const metaQ3: Partial<MetaVentaEntity> = { trimestre: Trimestre.Q3 };
      const metaQ4: Partial<MetaVentaEntity> = { trimestre: Trimestre.Q4 };

      expect(metaQ1.trimestre).toBe('Q1');
      expect(metaQ2.trimestre).toBe('Q2');
      expect(metaQ3.trimestre).toBe('Q3');
      expect(metaQ4.trimestre).toBe('Q4');
    });

    it('should handle different tipos correctly', () => {
      const metaUnidades: Partial<MetaVentaEntity> = { tipo: TipoMeta.UNIDADES };
      const metaMonetario: Partial<MetaVentaEntity> = { tipo: TipoMeta.MONETARIO };

      expect(metaUnidades.tipo).toBe('unidades');
      expect(metaMonetario.tipo).toBe('monetario');
    });

    it('should handle ISO date strings correctly', () => {
      const meta: Partial<MetaVentaEntity> = {
        fechaCreacion: '2024-01-01T00:00:00Z',
        fechaActualizacion: '2024-03-31T23:59:59Z'
      };

      expect(meta.fechaCreacion).toBe('2024-01-01T00:00:00Z');
      expect(meta.fechaActualizacion).toBe('2024-03-31T23:59:59Z');
    });

    it('should handle numeric valores correctly', () => {
      const meta: Partial<MetaVentaEntity> = {
        id: 100,
        valorObjetivo: 150000.50
      };

      expect(typeof meta.id).toBe('number');
      expect(typeof meta.valorObjetivo).toBe('number');
      expect(meta.valorObjetivo).toBeGreaterThan(0);
    });
  });

  describe('VendedorInfo Interface', () => {
    it('should create valid VendedorInfo object', () => {
      const vendedor: VendedorInfo = {
        employeeId: 'VE-01',
        nombreCompleto: 'Juan Pérez',
        email: 'juan.perez@example.com'
      };

      expect(vendedor.employeeId).toBe('VE-01');
      expect(vendedor.nombreCompleto).toBe('Juan Pérez');
      expect(vendedor.email).toBe('juan.perez@example.com');
    });
  });

  describe('ProductoInfo Interface', () => {
    it('should create valid ProductoInfo object', () => {
      const producto: ProductoInfo = {
        sku: 'SKU-001',
        name: 'Producto A',
        description: 'Descripción',
        unitPrice: 100.50,
        isActive: true
      };

      expect(producto.sku).toBe('SKU-001');
      expect(producto.name).toBe('Producto A');
      expect(producto.unitPrice).toBe(100.50);
      expect(producto.isActive).toBe(true);
    });

    it('should handle null values', () => {
      const producto: ProductoInfo = {
        sku: 'SKU-001',
        name: null,
        description: null,
        unitPrice: null,
        isActive: null
      };

      expect(producto.sku).toBe('SKU-001');
      expect(producto.name).toBeNull();
      expect(producto.description).toBeNull();
      expect(producto.unitPrice).toBeNull();
      expect(producto.isActive).toBeNull();
    });
  });

  describe('CreateMetaVentaDto', () => {
    it('should create valid CreateMetaVentaDto', () => {
      const dto: CreateMetaVentaDto = {
        idVendedor: 'VE-01',
        idProducto: 'SKU-001',
        region: Region.NORTE,
        trimestre: Trimestre.Q1,
        valorObjetivo: 100000,
        tipo: TipoMeta.MONETARIO
      };

      expect(dto.idVendedor).toBe('VE-01');
      expect(dto.idProducto).toBe('SKU-001');
      expect(dto.region).toBe(Region.NORTE);
      expect(dto.trimestre).toBe(Trimestre.Q1);
      expect(dto.valorObjetivo).toBe(100000);
      expect(dto.tipo).toBe(TipoMeta.MONETARIO);
    });
  });

  describe('UpdateMetaVentaDto', () => {
    it('should create valid UpdateMetaVentaDto with all fields', () => {
      const dto: UpdateMetaVentaDto = {
        id: 1,
        idVendedor: 'VE-02',
        idProducto: 'SKU-002',
        region: Region.SUR,
        trimestre: Trimestre.Q2,
        valorObjetivo: 200000,
        tipo: TipoMeta.UNIDADES
      };

      expect(dto.id).toBe(1);
      expect(dto.idVendedor).toBe('VE-02');
      expect(dto.region).toBe(Region.SUR);
    });

    it('should create valid UpdateMetaVentaDto with partial fields', () => {
      const dto: UpdateMetaVentaDto = {
        id: 1,
        valorObjetivo: 150000
      };

      expect(dto.id).toBe(1);
      expect(dto.valorObjetivo).toBe(150000);
      expect(dto.idVendedor).toBeUndefined();
      expect(dto.region).toBeUndefined();
    });
  });
});

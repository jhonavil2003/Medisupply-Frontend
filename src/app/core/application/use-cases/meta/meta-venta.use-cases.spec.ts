import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import {
  GetAllMetasUseCase,
  GetMetaByIdUseCase,
  CreateMetaVentaUseCase,
  UpdateMetaVentaUseCase,
  DeleteMetaVentaUseCase,
  CompararMetaResultadoUseCase
} from './meta-venta.use-cases';
import { MetaVentaRepository } from '../../../domain/repositories/meta-venta.repository';
import { 
  MetaVentaEntity, 
  CreateMetaVentaDto, 
  UpdateMetaVentaDto,
  ComparacionMetaResultado,
  Trimestre,
  TipoMeta
} from '../../../domain/entities/meta-venta.entity';

describe('Meta Venta Use Cases', () => {
  let mockRepository: jest.Mocked<MetaVentaRepository>;

  const mockMetaVenta: MetaVentaEntity = {
    id: 1,
    producto: 'Producto Test',
    region: 'Region Test',
    trimestre: Trimestre.Q1,
    valorObjetivo: 1000,
    tipo: TipoMeta.MONETARIO,
    usuarioResponsable: 'Usuario Test',
    editable: true
  };

  const mockComparacion: ComparacionMetaResultado = {
    meta: 1000,
    resultado: 800,
    porcentajeCumplimiento: 80,
    cumplido: false
  };

  beforeEach(() => {
    mockRepository = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      compararResultados: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        { provide: MetaVentaRepository, useValue: mockRepository },
        GetAllMetasUseCase,
        GetMetaByIdUseCase,
        CreateMetaVentaUseCase,
        UpdateMetaVentaUseCase,
        DeleteMetaVentaUseCase,
        CompararMetaResultadoUseCase
      ]
    });
  });

  describe('GetAllMetasUseCase', () => {
    let useCase: GetAllMetasUseCase;

    beforeEach(() => {
      useCase = TestBed.inject(GetAllMetasUseCase);
    });

    it('should be created', () => {
      expect(useCase).toBeTruthy();
    });

    it('should call repository getAll method', () => {
      const metas = [mockMetaVenta];
      mockRepository.getAll.mockReturnValue(of(metas));

      useCase.execute().subscribe(result => {
        expect(result).toEqual(metas);
      });

      expect(mockRepository.getAll).toHaveBeenCalled();
    });

    it('should return empty array when no metas exist', () => {
      mockRepository.getAll.mockReturnValue(of([]));

      useCase.execute().subscribe(result => {
        expect(result).toEqual([]);
      });

      expect(mockRepository.getAll).toHaveBeenCalled();
    });

    it('should handle repository errors', () => {
      const error = new Error('Repository error');
      mockRepository.getAll.mockReturnValue(throwError(() => error));

      useCase.execute().subscribe({
        error: (err) => {
          expect(err).toBe(error);
        }
      });

      expect(mockRepository.getAll).toHaveBeenCalled();
    });
  });

  describe('GetMetaByIdUseCase', () => {
    let useCase: GetMetaByIdUseCase;

    beforeEach(() => {
      useCase = TestBed.inject(GetMetaByIdUseCase);
    });

    it('should be created', () => {
      expect(useCase).toBeTruthy();
    });

    it('should call repository getById method with correct id', () => {
      const id = 1;
      mockRepository.getById.mockReturnValue(of(mockMetaVenta));

      useCase.execute(id).subscribe(result => {
        expect(result).toEqual(mockMetaVenta);
      });

      expect(mockRepository.getById).toHaveBeenCalledWith(id);
    });

    it('should return null when meta not found', () => {
      const id = 999;
      mockRepository.getById.mockReturnValue(of(null));

      useCase.execute(id).subscribe(result => {
        expect(result).toBeNull();
      });

      expect(mockRepository.getById).toHaveBeenCalledWith(id);
    });

    it('should handle different id types', () => {
      const ids = [1, 999, 0];
      
      ids.forEach(id => {
        mockRepository.getById.mockReturnValue(of(null));
        
        useCase.execute(id).subscribe();
        
        expect(mockRepository.getById).toHaveBeenCalledWith(id);
      });
    });
  });

  describe('CreateMetaVentaUseCase', () => {
    let useCase: CreateMetaVentaUseCase;

    beforeEach(() => {
      useCase = TestBed.inject(CreateMetaVentaUseCase);
    });

    it('should be created', () => {
      expect(useCase).toBeTruthy();
    });

    it('should create meta with valid data', () => {
      const createDto: CreateMetaVentaDto = {
        producto: 'Producto Test',
        region: 'Region Test',
        trimestre: Trimestre.Q1,
        valorObjetivo: 1000,
        tipo: TipoMeta.MONETARIO,
        usuarioResponsable: 'Usuario Test'
      };

      mockRepository.create.mockReturnValue(of(mockMetaVenta));

      useCase.execute(createDto).subscribe(result => {
        expect(result).toEqual(mockMetaVenta);
      });

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw error when producto is empty', () => {
      const createDto: CreateMetaVentaDto = {
        producto: '',
        region: 'Region Test',
        trimestre: Trimestre.Q1,
        valorObjetivo: 1000,
        tipo: TipoMeta.MONETARIO,
        usuarioResponsable: 'Usuario Test'
      };

      expect(() => {
        useCase.execute(createDto);
      }).toThrow('El producto es requerido');
    });

    it('should throw error when producto is whitespace only', () => {
      const createDto: CreateMetaVentaDto = {
        producto: '   ',
        region: 'Region Test',
        trimestre: Trimestre.Q1,
        valorObjetivo: 1000,
        tipo: TipoMeta.MONETARIO,
        usuarioResponsable: 'Usuario Test'
      };

      expect(() => {
        useCase.execute(createDto);
      }).toThrow('El producto es requerido');
    });

    it('should throw error when region is empty', () => {
      const createDto: CreateMetaVentaDto = {
        producto: 'Producto Test',
        region: '',
        trimestre: Trimestre.Q1,
        valorObjetivo: 1000,
        tipo: TipoMeta.MONETARIO,
        usuarioResponsable: 'Usuario Test'
      };

      expect(() => {
        useCase.execute(createDto);
      }).toThrow('La región es requerida');
    });

    it('should throw error when region is whitespace only', () => {
      const createDto: CreateMetaVentaDto = {
        producto: 'Producto Test',
        region: '   ',
        trimestre: Trimestre.Q1,
        valorObjetivo: 1000,
        tipo: TipoMeta.MONETARIO,
        usuarioResponsable: 'Usuario Test'
      };

      expect(() => {
        useCase.execute(createDto);
      }).toThrow('La región es requerida');
    });

    it('should throw error when trimestre is not provided', () => {
      const createDto: CreateMetaVentaDto = {
        producto: 'Producto Test',
        region: 'Region Test',
        trimestre: undefined as any,
        valorObjetivo: 1000,
        tipo: TipoMeta.MONETARIO,
        usuarioResponsable: 'Usuario Test'
      };

      expect(() => {
        useCase.execute(createDto);
      }).toThrow('El trimestre es requerido');
    });

    it('should throw error when valorObjetivo is zero', () => {
      const createDto: CreateMetaVentaDto = {
        producto: 'Producto Test',
        region: 'Region Test',
        trimestre: Trimestre.Q1,
        valorObjetivo: 0,
        tipo: TipoMeta.MONETARIO,
        usuarioResponsable: 'Usuario Test'
      };

      expect(() => {
        useCase.execute(createDto);
      }).toThrow('El valor objetivo debe ser mayor a 0');
    });

    it('should throw error when valorObjetivo is negative', () => {
      const createDto: CreateMetaVentaDto = {
        producto: 'Producto Test',
        region: 'Region Test',
        trimestre: Trimestre.Q1,
        valorObjetivo: -100,
        tipo: TipoMeta.MONETARIO,
        usuarioResponsable: 'Usuario Test'
      };

      expect(() => {
        useCase.execute(createDto);
      }).toThrow('El valor objetivo debe ser mayor a 0');
    });
  });

  describe('UpdateMetaVentaUseCase', () => {
    let useCase: UpdateMetaVentaUseCase;

    beforeEach(() => {
      useCase = TestBed.inject(UpdateMetaVentaUseCase);
    });

    it('should be created', () => {
      expect(useCase).toBeTruthy();
    });

    it('should update meta with valid data', () => {
      const updateDto: UpdateMetaVentaDto = {
        id: 1,
        producto: 'Producto Updated',
        region: 'Region Updated',
        trimestre: Trimestre.Q2,
        valorObjetivo: 1500
      };

      const updatedMeta = { ...mockMetaVenta, ...updateDto };
      mockRepository.update.mockReturnValue(of(updatedMeta));

      useCase.execute(updateDto).subscribe(result => {
        expect(result).toEqual(updatedMeta);
      });

      expect(mockRepository.update).toHaveBeenCalledWith(updateDto);
    });

    it('should throw error when id is not provided', () => {
      const updateDto: UpdateMetaVentaDto = {
        id: undefined as any,
        producto: 'Producto Updated'
      };

      expect(() => {
        useCase.execute(updateDto);
      }).toThrow('El ID de la meta es requerido');
    });

    it('should throw error when id is null', () => {
      const updateDto: UpdateMetaVentaDto = {
        id: null as any,
        producto: 'Producto Updated'
      };

      expect(() => {
        useCase.execute(updateDto);
      }).toThrow('El ID de la meta es requerido');
    });

    it('should throw error when id is zero', () => {
      const updateDto: UpdateMetaVentaDto = {
        id: 0,
        producto: 'Producto Updated'
      };

      expect(() => {
        useCase.execute(updateDto);
      }).toThrow('El ID de la meta es requerido');
    });
  });

  describe('DeleteMetaVentaUseCase', () => {
    let useCase: DeleteMetaVentaUseCase;

    beforeEach(() => {
      useCase = TestBed.inject(DeleteMetaVentaUseCase);
    });

    it('should be created', () => {
      expect(useCase).toBeTruthy();
    });

    it('should delete meta with valid id', () => {
      const id = 1;
      mockRepository.delete.mockReturnValue(of(true));

      useCase.execute(id).subscribe(result => {
        expect(result).toBe(true);
      });

      expect(mockRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should return false when deletion fails', () => {
      const id = 1;
      mockRepository.delete.mockReturnValue(of(false));

      useCase.execute(id).subscribe(result => {
        expect(result).toBe(false);
      });

      expect(mockRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should throw error when id is not provided', () => {
      expect(() => {
        useCase.execute(undefined as any);
      }).toThrow('El ID de la meta es requerido');
    });

    it('should throw error when id is null', () => {
      expect(() => {
        useCase.execute(null as any);
      }).toThrow('El ID de la meta es requerido');
    });

    it('should throw error when id is zero', () => {
      expect(() => {
        useCase.execute(0);
      }).toThrow('El ID de la meta es requerido');
    });
  });

  describe('CompararMetaResultadoUseCase', () => {
    let useCase: CompararMetaResultadoUseCase;

    beforeEach(() => {
      useCase = TestBed.inject(CompararMetaResultadoUseCase);
    });

    it('should be created', () => {
      expect(useCase).toBeTruthy();
    });

    it('should compare meta with valid data', () => {
      const metaId = 1;
      const resultado = 800;
      
      mockRepository.compararResultados.mockReturnValue(of(mockComparacion));

      useCase.execute(metaId, resultado).subscribe(result => {
        expect(result).toEqual(mockComparacion);
      });

      expect(mockRepository.compararResultados).toHaveBeenCalledWith(metaId, resultado);
    });

    it('should handle zero resultado', () => {
      const metaId = 1;
      const resultado = 0;
      
      const zeroComparacion = { ...mockComparacion, valorActual: 0, porcentajeCumplimiento: 0 };
      mockRepository.compararResultados.mockReturnValue(of(zeroComparacion));

      useCase.execute(metaId, resultado).subscribe(result => {
        expect(result).toEqual(zeroComparacion);
      });

      expect(mockRepository.compararResultados).toHaveBeenCalledWith(metaId, resultado);
    });

    it('should throw error when metaId is not provided', () => {
      expect(() => {
        useCase.execute(undefined as any, 800);
      }).toThrow('El ID de la meta es requerido');
    });

    it('should throw error when metaId is null', () => {
      expect(() => {
        useCase.execute(null as any, 800);
      }).toThrow('El ID de la meta es requerido');
    });

    it('should throw error when metaId is zero', () => {
      expect(() => {
        useCase.execute(0, 800);
      }).toThrow('El ID de la meta es requerido');
    });

    it('should throw error when resultado is negative', () => {
      expect(() => {
        useCase.execute(1, -100);
      }).toThrow('El resultado no puede ser negativo');
    });

    it('should handle different resultado values', () => {
      const metaId = 1;
      const resultados = [100, 500, 1000, 1500];
      
      resultados.forEach(resultado => {
        const comparacion = { ...mockComparacion, resultado: resultado };
        mockRepository.compararResultados.mockReturnValue(of(comparacion));
        
        useCase.execute(metaId, resultado).subscribe(result => {
          expect(result.resultado).toBe(resultado);
        });
        
        expect(mockRepository.compararResultados).toHaveBeenCalledWith(metaId, resultado);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should inject all use cases correctly', () => {
      const getAllUseCase = TestBed.inject(GetAllMetasUseCase);
      const getByIdUseCase = TestBed.inject(GetMetaByIdUseCase);
      const createUseCase = TestBed.inject(CreateMetaVentaUseCase);
      const updateUseCase = TestBed.inject(UpdateMetaVentaUseCase);
      const deleteUseCase = TestBed.inject(DeleteMetaVentaUseCase);
      const compareUseCase = TestBed.inject(CompararMetaResultadoUseCase);

      expect(getAllUseCase).toBeTruthy();
      expect(getByIdUseCase).toBeTruthy();
      expect(createUseCase).toBeTruthy();
      expect(updateUseCase).toBeTruthy();
      expect(deleteUseCase).toBeTruthy();
      expect(compareUseCase).toBeTruthy();
    });

    it('should handle multiple operations in sequence', () => {
      const createUseCase = TestBed.inject(CreateMetaVentaUseCase);
      const updateUseCase = TestBed.inject(UpdateMetaVentaUseCase);
      const deleteUseCase = TestBed.inject(DeleteMetaVentaUseCase);

      const createDto: CreateMetaVentaDto = {
        producto: 'Test',
        region: 'Test',
        trimestre: Trimestre.Q1,
        valorObjetivo: 1000,
        tipo: TipoMeta.MONETARIO,
        usuarioResponsable: 'Usuario Test'
      };

      mockRepository.create.mockReturnValue(of(mockMetaVenta));
      mockRepository.update.mockReturnValue(of(mockMetaVenta));
      mockRepository.delete.mockReturnValue(of(true));

      // Create
      createUseCase.execute(createDto).subscribe();
      expect(mockRepository.create).toHaveBeenCalled();

      // Update
      updateUseCase.execute({ id: 1, producto: 'Updated' }).subscribe();
      expect(mockRepository.update).toHaveBeenCalled();

      // Delete
      deleteUseCase.execute(1).subscribe();
      expect(mockRepository.delete).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle repository errors in all use cases', () => {
      const error = new Error('Repository error');
      
      const getAllUseCase = TestBed.inject(GetAllMetasUseCase);
      const getByIdUseCase = TestBed.inject(GetMetaByIdUseCase);
      const createUseCase = TestBed.inject(CreateMetaVentaUseCase);
      const updateUseCase = TestBed.inject(UpdateMetaVentaUseCase);
      const deleteUseCase = TestBed.inject(DeleteMetaVentaUseCase);
      const compareUseCase = TestBed.inject(CompararMetaResultadoUseCase);

      mockRepository.getAll.mockReturnValue(throwError(() => error));
      mockRepository.getById.mockReturnValue(throwError(() => error));
      mockRepository.create.mockReturnValue(throwError(() => error));
      mockRepository.update.mockReturnValue(throwError(() => error));
      mockRepository.delete.mockReturnValue(throwError(() => error));
      mockRepository.compararResultados.mockReturnValue(throwError(() => error));

      getAllUseCase.execute().subscribe({ error: (err) => expect(err).toBe(error) });
      getByIdUseCase.execute(1).subscribe({ error: (err) => expect(err).toBe(error) });
      
      const validCreateDto: CreateMetaVentaDto = {
        producto: 'Test',
        region: 'Test',
        trimestre: Trimestre.Q1,
        valorObjetivo: 1000,
        tipo: TipoMeta.MONETARIO,
        usuarioResponsable: 'Usuario Test'
      };
      
      createUseCase.execute(validCreateDto).subscribe({ error: (err) => expect(err).toBe(error) });
      updateUseCase.execute({ id: 1 }).subscribe({ error: (err) => expect(err).toBe(error) });
      deleteUseCase.execute(1).subscribe({ error: (err) => expect(err).toBe(error) });
      compareUseCase.execute(1, 800).subscribe({ error: (err) => expect(err).toBe(error) });
    });
  });
});
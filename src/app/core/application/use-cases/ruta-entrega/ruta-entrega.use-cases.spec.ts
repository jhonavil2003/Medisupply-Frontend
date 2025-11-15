import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import {
  GetAllRutasUseCase,
  GetRutaByIdUseCase,
  CreateRutaEntregaUseCase,
  UpdateRutaEntregaUseCase,
  FilterRutasByEstadoUseCase
} from './ruta-entrega.use-cases';
import { RutaEntregaRepository } from '../../../domain/repositories/ruta-entrega.repository';
import {
  RutaEntregaEntity,
  CreateRutaEntregaDto,
  UpdateRutaEntregaDto,
  EstadoRuta,
  EstadoPedido
} from '../../../domain/entities/ruta-entrega.entity';

describe('RutaEntrega Use Cases', () => {
  let mockRepository: jest.Mocked<RutaEntregaRepository>;

  const mockRuta: RutaEntregaEntity = {
    id: 'R-001',
    fecha: '2025-09-18T08:00:00Z',
    estado: EstadoRuta.EN_CURSO,
    vehiculos: ['VAN-12'],
    conductor: 'Carlos Pérez',
    pedidos: [
      { id: 'P-100', destino: 'Clínica San José', detalle: 'Vacunas', estado: EstadoPedido.EN_RUTA }
    ]
  };

  const mockRutas: RutaEntregaEntity[] = [
    mockRuta,
    {
      id: 'R-002',
      fecha: '2025-09-17T09:00:00Z',
      estado: EstadoRuta.COMPLETADA,
      vehiculos: ['CAM-05'],
      conductor: 'Ana Torres',
      pedidos: []
    }
  ];

  beforeEach(() => {
    mockRepository = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      filterByEstado: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        { provide: RutaEntregaRepository, useValue: mockRepository }
      ]
    });
  });

  describe('GetAllRutasUseCase', () => {
    let useCase: GetAllRutasUseCase;

    beforeEach(() => {
      useCase = TestBed.inject(GetAllRutasUseCase);
    });

    it('should be created', () => {
      expect(useCase).toBeTruthy();
    });

    it('should call repository.getAll and return all rutas', (done) => {
      mockRepository.getAll.mockReturnValue(of(mockRutas));

      useCase.execute().subscribe(rutas => {
        expect(rutas).toEqual(mockRutas);
        expect(rutas.length).toBe(2);
        expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should return empty array when no rutas exist', (done) => {
      mockRepository.getAll.mockReturnValue(of([]));

      useCase.execute().subscribe(rutas => {
        expect(rutas).toEqual([]);
        expect(rutas.length).toBe(0);
        done();
      });
    });

    it('should handle repository errors', (done) => {
      const error = new Error('Repository error');
      mockRepository.getAll.mockReturnValue(throwError(() => error));

      useCase.execute().subscribe({
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('GetRutaByIdUseCase', () => {
    let useCase: GetRutaByIdUseCase;

    beforeEach(() => {
      useCase = TestBed.inject(GetRutaByIdUseCase);
    });

    it('should be created', () => {
      expect(useCase).toBeTruthy();
    });

    it('should call repository.getById with correct id and return ruta', (done) => {
      mockRepository.getById.mockReturnValue(of(mockRuta));

      useCase.execute('R-001').subscribe(ruta => {
        expect(ruta).toEqual(mockRuta);
        expect(mockRepository.getById).toHaveBeenCalledWith('R-001');
        expect(mockRepository.getById).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should return null when ruta not found', (done) => {
      mockRepository.getById.mockReturnValue(of(null));

      useCase.execute('NON-EXISTENT').subscribe(ruta => {
        expect(ruta).toBeNull();
        expect(mockRepository.getById).toHaveBeenCalledWith('NON-EXISTENT');
        done();
      });
    });

    it('should handle repository errors', (done) => {
      const error = new Error('Not found');
      mockRepository.getById.mockReturnValue(throwError(() => error));

      useCase.execute('R-001').subscribe({
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('CreateRutaEntregaUseCase', () => {
    let useCase: CreateRutaEntregaUseCase;

    beforeEach(() => {
      useCase = TestBed.inject(CreateRutaEntregaUseCase);
    });

    it('should be created', () => {
      expect(useCase).toBeTruthy();
    });

    it('should create a valid ruta successfully', (done) => {
      const createDto: CreateRutaEntregaDto = {
        fecha: '2025-09-20T08:00:00Z',
        vehiculos: ['VAN-10'],
        conductor: 'Juan Ramírez',
        pedidos: [{ destino: 'Hospital Norte', detalle: 'Medicinas' }]
      };

      const createdRuta: RutaEntregaEntity = { 
        id: 'R-003', 
        ...createDto,
        estado: EstadoRuta.PENDIENTE,
        pedidos: [{ id: 'P-200', destino: 'Hospital Norte', detalle: 'Medicinas', estado: EstadoPedido.PENDIENTE }]
      };
      mockRepository.create.mockReturnValue(of(createdRuta));

      useCase.execute(createDto).subscribe(ruta => {
        expect(ruta).toEqual(createdRuta);
        expect(mockRepository.create).toHaveBeenCalledWith(createDto);
        expect(mockRepository.create).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should throw error when conductor is empty', () => {
      const invalidDto: CreateRutaEntregaDto = {
        fecha: '2025-09-20T08:00:00Z',
        vehiculos: ['VAN-10'],
        conductor: '',
        pedidos: [{ destino: 'Hospital', detalle: 'Med' }]
      };

      expect(() => useCase.execute(invalidDto)).toThrow('El conductor es requerido');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when conductor is whitespace only', () => {
      const invalidDto: CreateRutaEntregaDto = {
        fecha: '2025-09-20T08:00:00Z',
        vehiculos: ['VAN-10'],
        conductor: '   ',
        pedidos: [{ destino: 'Hospital', detalle: 'Med' }]
      };

      expect(() => useCase.execute(invalidDto)).toThrow('El conductor es requerido');
    });

    it('should throw error when vehiculos array is empty', () => {
      const invalidDto: CreateRutaEntregaDto = {
        fecha: '2025-09-20T08:00:00Z',
        vehiculos: [],
        conductor: 'Juan Ramírez',
        pedidos: [{ destino: 'Hospital', detalle: 'Med' }]
      };

      expect(() => useCase.execute(invalidDto)).toThrow('Debe asignar al menos un vehículo');
    });

    it('should throw error when pedidos array is empty', () => {
      const invalidDto: CreateRutaEntregaDto = {
        fecha: '2025-09-20T08:00:00Z',
        vehiculos: ['VAN-10'],
        conductor: 'Juan Ramírez',
        pedidos: []
      };

      expect(() => useCase.execute(invalidDto)).toThrow('Debe incluir al menos un pedido');
    });

    it('should handle repository errors during creation', (done) => {
      const createDto: CreateRutaEntregaDto = {
        fecha: '2025-09-20T08:00:00Z',
        vehiculos: ['VAN-10'],
        conductor: 'Juan Ramírez',
        pedidos: [{ destino: 'Hospital', detalle: 'Med' }]
      };

      const error = new Error('Database error');
      mockRepository.create.mockReturnValue(throwError(() => error));

      useCase.execute(createDto).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('UpdateRutaEntregaUseCase', () => {
    let useCase: UpdateRutaEntregaUseCase;

    beforeEach(() => {
      useCase = TestBed.inject(UpdateRutaEntregaUseCase);
    });

    it('should be created', () => {
      expect(useCase).toBeTruthy();
    });

    it('should update a ruta successfully', (done) => {
      const updateDto: UpdateRutaEntregaDto = {
        id: 'R-001',
        estado: EstadoRuta.COMPLETADA
      };

      const updatedRuta: RutaEntregaEntity = { ...mockRuta, estado: EstadoRuta.COMPLETADA };
      mockRepository.update.mockReturnValue(of(updatedRuta));

      useCase.execute(updateDto).subscribe(ruta => {
        expect(ruta.estado).toBe(EstadoRuta.COMPLETADA);
        expect(mockRepository.update).toHaveBeenCalledWith(updateDto);
        expect(mockRepository.update).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should throw error when id is missing', () => {
      const invalidDto: UpdateRutaEntregaDto = {
        estado: EstadoRuta.COMPLETADA
      } as any;

      expect(() => useCase.execute(invalidDto)).toThrow('El ID de la ruta es requerido');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should handle repository errors during update', (done) => {
      const updateDto: UpdateRutaEntregaDto = {
        id: 'R-001',
        estado: EstadoRuta.COMPLETADA
      };

      const error = new Error('Update failed');
      mockRepository.update.mockReturnValue(throwError(() => error));

      useCase.execute(updateDto).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('FilterRutasByEstadoUseCase', () => {
    let useCase: FilterRutasByEstadoUseCase;

    beforeEach(() => {
      useCase = TestBed.inject(FilterRutasByEstadoUseCase);
    });

    it('should be created', () => {
      expect(useCase).toBeTruthy();
    });

    it('should filter rutas by estado "en_curso"', (done) => {
      const filteredRutas = [mockRuta];
      mockRepository.filterByEstado.mockReturnValue(of(filteredRutas));

      useCase.execute(EstadoRuta.EN_CURSO).subscribe(rutas => {
        expect(rutas).toEqual(filteredRutas);
        expect(rutas.length).toBe(1);
        expect(rutas[0].estado).toBe(EstadoRuta.EN_CURSO);
        expect(mockRepository.filterByEstado).toHaveBeenCalledWith(EstadoRuta.EN_CURSO);
        done();
      });
    });

    it('should filter rutas by estado "completada"', (done) => {
      const completedRutas = [mockRutas[1]];
      mockRepository.filterByEstado.mockReturnValue(of(completedRutas));

      useCase.execute(EstadoRuta.COMPLETADA).subscribe(rutas => {
        expect(rutas.length).toBe(1);
        expect(rutas[0].estado).toBe(EstadoRuta.COMPLETADA);
        expect(mockRepository.filterByEstado).toHaveBeenCalledWith(EstadoRuta.COMPLETADA);
        done();
      });
    });

    it('should return empty array when no rutas match estado', (done) => {
      mockRepository.filterByEstado.mockReturnValue(of([]));

      useCase.execute(EstadoRuta.PENDIENTE).subscribe(rutas => {
        expect(rutas).toEqual([]);
        expect(rutas.length).toBe(0);
        done();
      });
    });

    it('should handle repository errors during filtering', (done) => {
      const error = new Error('Filter failed');
      mockRepository.filterByEstado.mockReturnValue(throwError(() => error));

      useCase.execute(EstadoRuta.EN_CURSO).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });
});

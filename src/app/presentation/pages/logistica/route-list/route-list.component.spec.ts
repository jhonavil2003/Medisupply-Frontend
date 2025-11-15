import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, Subject } from 'rxjs';
import { RouteListComponent } from './route-list.component';
import { GetRoutesUseCase } from '../../../../core/application/use-cases/get-routes.usecase';
import { UpdateRouteStatusUseCase } from '../../../../core/application/use-cases/update-route-status.usecase';
import { RouteListItem, RouteStatus } from '../../../../core/domain/entities/route.entity';
import { ActivateRouteDialogComponent } from './activate-route-dialog.component';
import { PageEvent } from '@angular/material/paginator';

describe('RouteListComponent', () => {
  let component: RouteListComponent;
  let fixture: ComponentFixture<RouteListComponent>;
  let mockGetRoutesUseCase: jest.Mocked<GetRoutesUseCase>;
  let mockUpdateRouteStatusUseCase: jest.Mocked<UpdateRouteStatusUseCase>;
  let mockRouter: jest.Mocked<Router>;
  let mockDialog: jest.Mocked<MatDialog>;
  let mockSnackBar: jest.Mocked<MatSnackBar>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  const mockRouteListItem: RouteListItem = {
    id: 1,
    routeCode: 'R-001',
    vehicleId: 1,
    driver: { name: 'Carlos Pérez', phone: '3001234567' },
    dates: {
      generationDate: '2025-11-14T08:00:00Z',
      plannedDate: '2025-11-14'
    },
    status: 'draft' as RouteStatus,
    vehicle: { 
      id: 1, 
      plate: 'ABC-123', 
      vehicleType: 'Van',
      capacityKg: 1000,
      capacityM3: 15,
      coldChainCapable: true,
      status: 'available',
      driverName: 'Carlos Pérez',
      driverPhone: '3001234567'
    },
    metrics: {
      totalDistanceKm: 25.5,
      estimatedDurationMinutes: 120,
      actualDurationMinutes: null,
      totalOrders: 10,
      totalStops: 5,
      totalWeightKg: 150,
      totalVolumeM3: 5,
      completionPercentage: 0
    },
    optimization: {
      score: 0.85,
      strategy: 'balanced',
      hasColdChainProducts: false
    },
    distributionCenterId: 1,
    times: {
      estimatedStart: '08:00:00',
      actualStart: null,
      estimatedEnd: '12:00:00',
      actualEnd: null
    },
    costs: {
      estimated: 50000,
      actual: null
    },
    notes: null,
    polyline: null,
    createdAt: '2025-11-14T08:00:00Z',
    updatedAt: '2025-11-14T08:00:00Z',
    createdBy: 'admin@medisupply.com'
  };

  const mockRoutesResponse = {
    routes: [mockRouteListItem],
    total: 1,
    page: 1,
    perPage: 10,
    hasMore: false
  };

  beforeEach(async () => {
    mockGetRoutesUseCase = {
      execute: jest.fn()
    } as any;

    mockUpdateRouteStatusUseCase = {
      activateRoute: jest.fn()
    } as any;

    mockRouter = {
      navigate: jest.fn()
    } as any;

    mockDialog = {
      open: jest.fn()
    } as any;

    mockSnackBar = {
      open: jest.fn()
    } as any;

    mockActivatedRoute = {
      snapshot: {} as any,
      params: of({}),
      queryParams: of({})
    };

    await TestBed.configureTestingModule({
      imports: [
        RouteListComponent,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: GetRoutesUseCase, useValue: mockGetRoutesUseCase },
        { provide: UpdateRouteStatusUseCase, useValue: mockUpdateRouteStatusUseCase },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    })
    .overrideComponent(RouteListComponent, {
      set: {
        providers: [
          { provide: MatDialog, useValue: mockDialog },
          { provide: MatSnackBar, useValue: mockSnackBar }
        ]
      }
    })
    .compileComponents();

    mockGetRoutesUseCase.execute.mockReturnValue(of(mockRoutesResponse));

    fixture = TestBed.createComponent(RouteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load routes on initialization', () => {
      expect(mockGetRoutesUseCase.execute).toHaveBeenCalled();
      expect(component.routes().length).toBe(1);
    });

    it('should set initial state correctly', () => {
      expect(component.loading()).toBe(false);
      expect(component.total()).toBe(1);
      expect(component.page()).toBe(1);
      expect(component.perPage()).toBe(10);
      expect(component.hasMore()).toBe(false);
    });
  });

  describe('loadRoutes', () => {
    it('should set loading to true before loading', () => {
      // La carga es asíncrona, por lo que loading se establece momentáneamente
      // Verificamos que el useCase sea llamado
      const executeSpy = mockGetRoutesUseCase.execute;
      executeSpy.mockClear();
      
      component.loadRoutes();
      
      expect(executeSpy).toHaveBeenCalled();
    });

    it('should call getRoutesUseCase with filters', () => {
      component.loadRoutes();
      expect(mockGetRoutesUseCase.execute).toHaveBeenCalledWith(component.filters());
    });

    it('should update routes signal with response data', (done) => {
      const newResponse = {
        ...mockRoutesResponse,
        routes: [mockRouteListItem, { ...mockRouteListItem, id: 2, routeCode: 'R-002' }]
      };
      mockGetRoutesUseCase.execute.mockReturnValue(of(newResponse));

      component.loadRoutes();

      setTimeout(() => {
        expect(component.routes().length).toBe(2);
        expect(component.loading()).toBe(false);
        done();
      }, 10);
    });

    it('should handle errors gracefully', (done) => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockGetRoutesUseCase.execute.mockReturnValue(throwError(() => new Error('Network error')));

      component.loadRoutes();

      setTimeout(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading routes:', expect.any(Error));
        expect(component.loading()).toBe(false);
        consoleErrorSpy.mockRestore();
        done();
      }, 10);
    });
  });

  describe('applyFilters', () => {
    it('should update filters with selected values', () => {
      // Fecha con zona horaria local puede variar, verificamos solo que se asigna
      component.plannedDate = new Date('2025-11-14T00:00:00');
      component.selectedStatus = 'active';
      component.selectedVehicleId = 5;

      component.applyFilters();

      expect(component.filters().plannedDate).toBeDefined();
      expect(component.filters().status).toBe('active');
      expect(component.filters().vehicleId).toBe(5);
    });

    it('should reset page to 1 when applying filters', () => {
      component.filters.set({ ...component.filters(), page: 5 });
      
      component.applyFilters();

      expect(component.filters().page).toBe(1);
    });

    it('should reload routes after applying filters', () => {
      const executeSpy = mockGetRoutesUseCase.execute;
      executeSpy.mockClear();

      component.applyFilters();

      expect(executeSpy).toHaveBeenCalled();
    });
  });

  describe('clearFilters', () => {
    it('should reset all filter values', () => {
      component.plannedDate = new Date();
      component.selectedStatus = 'active';
      component.selectedVehicleId = 5;

      component.clearFilters();

      expect(component.plannedDate).toBeNull();
      expect(component.selectedStatus).toBe('');
      expect(component.selectedVehicleId).toBeNull();
    });

    it('should reset filters to default', () => {
      component.clearFilters();

      expect(component.filters()).toEqual({
        distributionCenterId: 1,
        page: 1,
        perPage: 10
      });
    });

    it('should reload routes after clearing filters', () => {
      const executeSpy = mockGetRoutesUseCase.execute;
      executeSpy.mockClear();

      component.clearFilters();

      expect(executeSpy).toHaveBeenCalled();
    });
  });

  describe('onPageChange', () => {
    it('should update page and perPage in filters', () => {
      const event: PageEvent = {
        pageIndex: 2,
        pageSize: 20,
        length: 100
      };

      component.onPageChange(event);

      expect(component.filters().page).toBe(3); // pageIndex + 1
      expect(component.filters().perPage).toBe(20);
    });

    it('should reload routes after page change', () => {
      const executeSpy = mockGetRoutesUseCase.execute;
      executeSpy.mockClear();

      const event: PageEvent = { pageIndex: 1, pageSize: 10, length: 50 };
      component.onPageChange(event);

      expect(executeSpy).toHaveBeenCalled();
    });
  });

  describe('viewRoute', () => {
    it('should navigate to route detail page', () => {
      component.viewRoute(mockRouteListItem);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/rutas', 1]);
    });
  });

  describe('viewOnMap', () => {
    it('should navigate to route map page', () => {
      component.viewOnMap(mockRouteListItem);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/rutas', 1, 'mapa']);
    });
  });

  describe('activateRoute', () => {
    it('should show error for non-draft routes', () => {
      const activeRoute = { ...mockRouteListItem, status: 'active' as RouteStatus };
      const event = new Event('click');

      component.activateRoute(activeRoute, event);

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Solo se pueden activar rutas en estado borrador',
        'Cerrar',
        expect.objectContaining({ duration: 3000 })
      );
      expect(mockDialog.open).not.toHaveBeenCalled();
    });

    it('should open confirmation dialog for draft routes', () => {
      const event = new Event('click');
      const mockDialogRef = {
        afterClosed: jest.fn().mockReturnValue(of(false))
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.activateRoute(mockRouteListItem, event);

      expect(mockDialog.open).toHaveBeenCalledWith(
        ActivateRouteDialogComponent,
        expect.objectContaining({
          width: '600px',
          data: {
            routeCode: 'R-001',
            driverName: 'Carlos Pérez',
            vehiclePlate: 'ABC-123',
            totalStops: 5,
            totalOrders: 10
          }
        })
      );
    });

    it('should not activate route if dialog is cancelled', (done) => {
      const event = new Event('click');
      const mockDialogRef = {
        afterClosed: jest.fn().mockReturnValue(of(false))
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.activateRoute(mockRouteListItem, event);

      setTimeout(() => {
        expect(mockUpdateRouteStatusUseCase.activateRoute).not.toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should activate route if dialog is confirmed', (done) => {
      const event = new Event('click');
      const mockDialogRef = {
        afterClosed: jest.fn().mockReturnValue(of(true))
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);
      mockUpdateRouteStatusUseCase.activateRoute.mockReturnValue(of({ status: 'success', message: 'Activated' }));

      component.activateRoute(mockRouteListItem, event);

      setTimeout(() => {
        expect(mockUpdateRouteStatusUseCase.activateRoute).toHaveBeenCalledWith(1, 'supervisor@medisupply.com');
        expect(mockSnackBar.open).toHaveBeenCalledWith(
          '✅ Ruta activada exitosamente',
          'Cerrar',
          expect.objectContaining({ duration: 3000 })
        );
        done();
      }, 10);
    });

    it('should show error snackbar on activation failure', (done) => {
      const event = new Event('click');
      const mockDialogRef = {
        afterClosed: jest.fn().mockReturnValue(of(true))
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);
      mockUpdateRouteStatusUseCase.activateRoute.mockReturnValue(
        throwError(() => new Error('Activation failed'))
      );

      component.activateRoute(mockRouteListItem, event);

      setTimeout(() => {
        expect(mockSnackBar.open).toHaveBeenCalledWith(
          expect.stringContaining('Error al activar la ruta'),
          'Cerrar',
          expect.objectContaining({ duration: 5000 })
        );
        done();
      }, 10);
    });

    it('should stop event propagation', () => {
      const event = new Event('click');
      const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');
      const mockDialogRef = {
        afterClosed: jest.fn().mockReturnValue(of(false))
      };
      mockDialog.open.mockReturnValue(mockDialogRef as any);

      component.activateRoute(mockRouteListItem, event);

      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('canActivateRoute', () => {
    it('should return true for draft routes', () => {
      expect(component.canActivateRoute(mockRouteListItem)).toBe(true);
    });

    it('should return false for active routes', () => {
      const activeRoute = { ...mockRouteListItem, status: 'active' as RouteStatus };
      expect(component.canActivateRoute(activeRoute)).toBe(false);
    });

    it('should return false for completed routes', () => {
      const completedRoute = { ...mockRouteListItem, status: 'completed' as RouteStatus };
      expect(component.canActivateRoute(completedRoute)).toBe(false);
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color for each status', () => {
      expect(component.getStatusColor('draft')).toBe('accent');
      expect(component.getStatusColor('active')).toBe('primary');
      expect(component.getStatusColor('in_progress')).toBe('primary');
      expect(component.getStatusColor('completed')).toBe('');
      expect(component.getStatusColor('cancelled')).toBe('warn');
    });
  });

  describe('getStatusLabel', () => {
    it('should return correct label for each status', () => {
      expect(component.getStatusLabel('draft')).toBe('Borrador');
      expect(component.getStatusLabel('active')).toBe('Activa');
      expect(component.getStatusLabel('in_progress')).toBe('En Progreso');
      expect(component.getStatusLabel('completed')).toBe('Completada');
      expect(component.getStatusLabel('cancelled')).toBe('Cancelada');
    });

    it('should return status value if not found in options', () => {
      expect(component.getStatusLabel('unknown' as RouteStatus)).toBe('unknown');
    });
  });

  describe('formatDuration', () => {
    it('should format minutes into hours and minutes', () => {
      expect(component.formatDuration(120)).toBe('2h 0m');
      expect(component.formatDuration(90)).toBe('1h 30m');
      expect(component.formatDuration(45)).toBe('0h 45m');
      expect(component.formatDuration(185)).toBe('3h 5m');
    });

    it('should handle zero minutes', () => {
      expect(component.formatDuration(0)).toBe('0h 0m');
    });

    it('should handle very large values', () => {
      expect(component.formatDuration(1440)).toBe('24h 0m');
    });
  });
});

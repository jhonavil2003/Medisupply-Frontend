import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { VendedorDetailComponent } from './vendedor-detail.component';
import { GetVendedorByIdUseCase } from '../../../../core/application/use-cases/vendedor/vendedor.use-cases';
import { NotificationService } from '../../../shared/services/notification.service';
import { VendedorEntity } from '../../../../core/domain/entities/vendedor.entity';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('VendedorDetailComponent', () => {
  let component: VendedorDetailComponent;
  let fixture: ComponentFixture<VendedorDetailComponent>;
  let mockGetVendedorByIdUseCase: jest.Mocked<GetVendedorByIdUseCase>;
  let mockNotificationService: jest.Mocked<NotificationService>;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: any;

  const mockVendedor: VendedorEntity = {
    id: 1,
    employeeId: 'EMP001',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@test.com',
    phone: '+51987654321',
    territory: 'Lima Norte',
    isActive: true,
    hireDate: '2024-01-15',
    createdAt: '2024-01-10T10:00:00',
    updatedAt: '2024-01-15T15:30:00'
  };

  beforeEach(async () => {
    mockGetVendedorByIdUseCase = {
      execute: jest.fn()
    } as any;
    
    mockNotificationService = {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn()
    } as any;
    
    mockRouter = {
      navigate: jest.fn()
    } as any;

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [VendedorDetailComponent, NoopAnimationsModule],
      providers: [
        { provide: GetVendedorByIdUseCase, useValue: mockGetVendedorByIdUseCase },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    mockGetVendedorByIdUseCase.execute.mockReturnValue(of(mockVendedor));
    fixture = TestBed.createComponent(VendedorDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load vendedor details', () => {
      mockGetVendedorByIdUseCase.execute.mockReturnValue(of(mockVendedor));
      
      fixture = TestBed.createComponent(VendedorDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(mockGetVendedorByIdUseCase.execute).toHaveBeenCalledWith(1);
      expect(component.vendedor()).toEqual(mockVendedor);
      expect(component.loading()).toBe(false);
    });

    it('should navigate to vendedores if no ID in route', () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(null);
      
      fixture = TestBed.createComponent(VendedorDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(mockNotificationService.error).toHaveBeenCalledWith('ID de vendedor no válido');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/vendedores']);
    });

    it('should handle vendedor not found', () => {
      mockGetVendedorByIdUseCase.execute.mockReturnValue(of(null));
      
      fixture = TestBed.createComponent(VendedorDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Vendedor no encontrado');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/vendedores']);
    });

    it('should handle error loading vendedor', () => {
      const error = new Error('Load error');
      mockGetVendedorByIdUseCase.execute.mockReturnValue(throwError(() => error));
      
      fixture = TestBed.createComponent(VendedorDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Error al cargar vendedor');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/vendedores']);
    });
  });

  describe('navigateToEdit', () => {
    beforeEach(() => {
      mockGetVendedorByIdUseCase.execute.mockReturnValue(of(mockVendedor));
      fixture = TestBed.createComponent(VendedorDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should navigate to edit page', () => {
      component.navigateToEdit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/vendedores', 1, 'edit']);
    });

    it('should not navigate if vendedor has no ID', () => {
      component.vendedor.set({ ...mockVendedor, id: undefined });

      component.navigateToEdit();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('navigateBack', () => {
    beforeEach(() => {
      mockGetVendedorByIdUseCase.execute.mockReturnValue(of(mockVendedor));
      fixture = TestBed.createComponent(VendedorDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should navigate back to vendedores list', () => {
      component.navigateBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/vendedores']);
    });
  });

  describe('formatDate', () => {
    beforeEach(() => {
      mockGetVendedorByIdUseCase.execute.mockReturnValue(of(mockVendedor));
      fixture = TestBed.createComponent(VendedorDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should format date correctly', () => {
      const result = component.formatDate('2024-01-15');

      // The exact format depends on locale, but should contain the date elements
      expect(result).toBeTruthy();
      expect(result).not.toBe('-');
    });

    it('should return dash for undefined date', () => {
      const result = component.formatDate(undefined);

      expect(result).toBe('-');
    });

    it('should return dash for empty string', () => {
      const result = component.formatDate('');

      expect(result).toBe('-');
    });
  });

  describe('loading state', () => {
    it('should show loading while fetching data', () => {
      const neverObservable = new Observable<VendedorEntity | null>(() => {
        // Never completes
      });
      
      mockGetVendedorByIdUseCase.execute.mockReturnValue(neverObservable);
      
      fixture = TestBed.createComponent(VendedorDetailComponent);
      component = fixture.componentInstance;
      
      expect(component.loading()).toBe(false); // Initial state
      
      fixture.detectChanges(); // Triggers ngOnInit
      
      // After ngOnInit starts, loading should be true
      expect(component.loading()).toBe(true);
    });
  });
});

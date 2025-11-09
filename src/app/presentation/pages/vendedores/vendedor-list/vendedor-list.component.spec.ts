import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { VendedorListComponent } from './vendedor-list.component';
import {
  GetAllVendedoresUseCase,
  SearchVendedoresUseCase,
  DeleteVendedorUseCase
} from '../../../../core/application/use-cases/vendedor/vendedor.use-cases';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { VendedorEntity } from '../../../../core/domain/entities/vendedor.entity';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('VendedorListComponent', () => {
  let component: VendedorListComponent;
  let fixture: ComponentFixture<VendedorListComponent>;
  let mockGetAllVendedoresUseCase: jest.Mocked<GetAllVendedoresUseCase>;
  let mockSearchVendedoresUseCase: jest.Mocked<SearchVendedoresUseCase>;
  let mockDeleteVendedorUseCase: jest.Mocked<DeleteVendedorUseCase>;
  let mockNotificationService: jest.Mocked<NotificationService>;
  let mockConfirmDialogService: jest.Mocked<ConfirmDialogService>;
  let mockRouter: jest.Mocked<Router>;

  const mockVendedores: VendedorEntity[] = [
    {
      id: 1,
      employeeId: 'EMP001',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@test.com',
      phone: '+51987654321',
      territory: 'Lima Norte',
      isActive: true,
      hireDate: '2024-01-15'
    },
    {
      id: 2,
      employeeId: 'EMP002',
      firstName: 'María',
      lastName: 'González',
      email: 'maria.gonzalez@test.com',
      phone: '+51987654322',
      territory: 'Lima Sur',
      isActive: false,
      hireDate: '2024-02-20'
    }
  ];

  beforeEach(async () => {
    mockGetAllVendedoresUseCase = {
      execute: jest.fn()
    } as any;
    
    mockSearchVendedoresUseCase = {
      execute: jest.fn()
    } as any;
    
    mockDeleteVendedorUseCase = {
      execute: jest.fn()
    } as any;
    
    mockNotificationService = {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn()
    } as any;
    
    mockConfirmDialogService = {
      confirm: jest.fn()
    } as any;
    
    mockRouter = {
      navigate: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [VendedorListComponent, NoopAnimationsModule],
      providers: [
        { provide: GetAllVendedoresUseCase, useValue: mockGetAllVendedoresUseCase },
        { provide: SearchVendedoresUseCase, useValue: mockSearchVendedoresUseCase },
        { provide: DeleteVendedorUseCase, useValue: mockDeleteVendedorUseCase },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: ConfirmDialogService, useValue: mockConfirmDialogService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VendedorListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load vendedores on init', () => {
      mockGetAllVendedoresUseCase.execute.mockReturnValue(of(mockVendedores));

      fixture.detectChanges(); // triggers ngOnInit

      expect(mockGetAllVendedoresUseCase.execute).toHaveBeenCalled();
      expect(component.vendedores()).toEqual(mockVendedores);
      expect(component.dataSource.data).toEqual(mockVendedores);
      expect(component.loading()).toBe(false);
    });

    it('should handle error when loading vendedores', () => {
      const error = new Error('Test error');
      mockGetAllVendedoresUseCase.execute.mockReturnValue(throwError(() => error));

      fixture.detectChanges();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Error al cargar la lista de vendedores');
      expect(component.errorMessage()).toBe('Error al cargar vendedores');
      expect(component.loading()).toBe(false);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      mockGetAllVendedoresUseCase.execute.mockReturnValue(of(mockVendedores));
      fixture.detectChanges();
    });

    it('should search vendedores by criteria', () => {
      const searchResults = [mockVendedores[0]];
      mockSearchVendedoresUseCase.execute.mockReturnValue(of(searchResults));

      component.search('Juan');

      expect(mockSearchVendedoresUseCase.execute).toHaveBeenCalledWith('Juan');
      expect(component.vendedores()).toEqual(searchResults);
      expect(component.dataSource.data).toEqual(searchResults);
    });

    it('should handle search error', () => {
      const error = new Error('Search error');
      mockSearchVendedoresUseCase.execute.mockReturnValue(throwError(() => error));

      component.search('test');

      expect(mockNotificationService.error).toHaveBeenCalledWith('Error en la búsqueda');
      expect(component.errorMessage()).toBe('Error al buscar vendedores');
    });
  });

  describe('clearSearch', () => {
    it('should clear search and reload vendedores', () => {
      mockGetAllVendedoresUseCase.execute.mockReturnValue(of(mockVendedores));
      component.searchControl.setValue('test');

      component.clearSearch();

      expect(component.searchControl.value).toBe('');
      expect(mockGetAllVendedoresUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('navigation', () => {
    it('should navigate to create page', () => {
      component.navigateToCreate();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/vendedores/create']);
    });

    it('should navigate to detail page', () => {
      component.navigateToDetail(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/vendedores', 1]);
    });

    it('should navigate to edit page', () => {
      component.navigateToEdit(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/vendedores', 1, 'edit']);
    });

    it('should navigate back to dashboard', () => {
      component.navigateBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard-admin']);
    });
  });

  describe('deleteVendedor', () => {
    beforeEach(() => {
      mockGetAllVendedoresUseCase.execute.mockReturnValue(of(mockVendedores));
      fixture.detectChanges();
    });

    it('should show error if vendedor has no ID', () => {
      const vendedorWithoutId: VendedorEntity = { ...mockVendedores[0], id: undefined };

      component.deleteVendedor(vendedorWithoutId);

      expect(mockNotificationService.error).toHaveBeenCalledWith('No se puede eliminar: vendedor sin ID');
      expect(mockConfirmDialogService.confirm).not.toHaveBeenCalled();
    });

    it('should delete vendedor when confirmed', () => {
      mockConfirmDialogService.confirm.mockReturnValue(of(true));
      mockDeleteVendedorUseCase.execute.mockReturnValue(of(true));
      mockGetAllVendedoresUseCase.execute.mockReturnValue(of([mockVendedores[1]]));

      component.deleteVendedor(mockVendedores[0]);

      expect(mockConfirmDialogService.confirm).toHaveBeenCalledWith({
        title: '¿Está seguro?',
        message: '¿Desea eliminar al vendedor Juan Pérez?',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'danger'
      });
      expect(mockDeleteVendedorUseCase.execute).toHaveBeenCalledWith(1);
      expect(mockNotificationService.success).toHaveBeenCalledWith('Vendedor eliminado correctamente');
    });

    it('should not delete vendedor when cancelled', () => {
      mockConfirmDialogService.confirm.mockReturnValue(of(false));

      component.deleteVendedor(mockVendedores[0]);

      expect(mockDeleteVendedorUseCase.execute).not.toHaveBeenCalled();
    });

    it('should show error when deletion fails', () => {
      mockConfirmDialogService.confirm.mockReturnValue(of(true));
      mockDeleteVendedorUseCase.execute.mockReturnValue(of(false));

      component.deleteVendedor(mockVendedores[0]);

      expect(mockNotificationService.error).toHaveBeenCalledWith(
        'No se pudo eliminar el vendedor. Puede tener visitas asociadas.'
      );
    });

    it('should handle error when deleting vendedor', () => {
      const error = { status: 400, message: 'Cannot delete' };
      mockConfirmDialogService.confirm.mockReturnValue(of(true));
      mockDeleteVendedorUseCase.execute.mockReturnValue(throwError(() => error));

      component.deleteVendedor(mockVendedores[0]);

      expect(mockNotificationService.error).toHaveBeenCalledWith(
        'Error al eliminar vendedor. Puede tener visitas asociadas.'
      );
    });
  });

  describe('paginator and sort', () => {
    it('should set paginator after view init', () => {
      mockGetAllVendedoresUseCase.execute.mockReturnValue(of(mockVendedores));
      fixture.detectChanges();
      
      component.ngAfterViewInit();

      expect(component.dataSource.paginator).toBe(component.paginator);
      expect(component.dataSource.sort).toBe(component.sort);
    });
  });
});

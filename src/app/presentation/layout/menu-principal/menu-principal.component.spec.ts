import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { MenuPrincipalComponent } from './menu-principal.component';
import { Subject } from 'rxjs';

describe('MenuPrincipalComponent', () => {
  let component: MenuPrincipalComponent;
  let fixture: ComponentFixture<MenuPrincipalComponent>;
  let mockRouter: jest.Mocked<Router>;
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    routerEventsSubject = new Subject();
    
    mockRouter = {
      navigate: jest.fn(),
      events: routerEventsSubject.asObservable(),
      url: '/dashboard-admin'
    } as any;

    await TestBed.configureTestingModule({
      imports: [MenuPrincipalComponent],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.sidebarVisible).toBe(true);
      expect(component.gestionOpen).toBe(false);
      expect(component.ventasOpen).toBe(false);
      expect(component.logisticaOpen).toBe(false);
    });
  });

  describe('navigateTo', () => {
    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should navigate to the specified route successfully', async () => {
      const route = 'productos';
      mockRouter.navigate.mockResolvedValue(true);

      await component.navigateTo(route);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/productos']);
      expect(console.log).toHaveBeenCalledWith('Navigating to route:', route);
      expect(console.log).toHaveBeenCalledWith('Navigation success:', true);
    });

    it('should handle navigation errors', async () => {
      const route = 'invalid-route';
      const error = new Error('Navigation failed');
      mockRouter.navigate.mockRejectedValue(error);

      await component.navigateTo(route);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/invalid-route']);
      expect(console.log).toHaveBeenCalledWith('Navigating to route:', route);
      expect(console.error).toHaveBeenCalledWith('Navigation error:', error);
    });

    it('should navigate to home route', async () => {
      const route = '';
      mockRouter.navigate.mockResolvedValue(true);

      await component.navigateTo(route);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should navigate to dashboard route', async () => {
      const route = 'dashboard';
      mockRouter.navigate.mockResolvedValue(true);

      await component.navigateTo(route);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should navigate to proveedores route', async () => {
      const route = 'proveedores';
      mockRouter.navigate.mockResolvedValue(true);

      await component.navigateTo(route);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/proveedores']);
    });

    it('should navigate to vendedores route', async () => {
      const route = 'vendedores';
      mockRouter.navigate.mockResolvedValue(true);

      await component.navigateTo(route);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/vendedores']);
    });

    it('should handle navigation returning false', async () => {
      const route = 'blocked-route';
      mockRouter.navigate.mockResolvedValue(false);

      await component.navigateTo(route);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/blocked-route']);
      expect(console.log).toHaveBeenCalledWith('Navigation success:', false);
    });
  });

  describe('toggleSidebar', () => {
    it('should toggle sidebar visibility from true to false', () => {
      component.sidebarVisible = true;

      component.toggleSidebar();

      expect(component.sidebarVisible).toBe(false);
    });

    it('should toggle sidebar visibility from false to true', () => {
      component.sidebarVisible = false;

      component.toggleSidebar();

      expect(component.sidebarVisible).toBe(true);
    });

    it('should toggle sidebar multiple times correctly', () => {
      const initialState = component.sidebarVisible;

      component.toggleSidebar();
      expect(component.sidebarVisible).toBe(!initialState);

      component.toggleSidebar();
      expect(component.sidebarVisible).toBe(initialState);

      component.toggleSidebar();
      expect(component.sidebarVisible).toBe(!initialState);
    });
  });

  describe('toggleSubmenu', () => {
    describe('gestion menu', () => {
      it('should toggle gestion menu from false to true', () => {
        component.gestionOpen = false;

        component.toggleSubmenu('gestion');

        expect(component.gestionOpen).toBe(true);
      });

      it('should toggle gestion menu from true to false', () => {
        component.gestionOpen = true;

        component.toggleSubmenu('gestion');

        expect(component.gestionOpen).toBe(false);
      });

      it('should not affect other menus when toggling gestion', () => {
        component.ventasOpen = true;
        component.logisticaOpen = true;

        component.toggleSubmenu('gestion');

        expect(component.ventasOpen).toBe(true);
        expect(component.logisticaOpen).toBe(true);
      });
    });

    describe('ventas menu', () => {
      it('should toggle ventas menu from false to true', () => {
        component.ventasOpen = false;

        component.toggleSubmenu('ventas');

        expect(component.ventasOpen).toBe(true);
      });

      it('should toggle ventas menu from true to false', () => {
        component.ventasOpen = true;

        component.toggleSubmenu('ventas');

        expect(component.ventasOpen).toBe(false);
      });

      it('should not affect other menus when toggling ventas', () => {
        component.gestionOpen = true;
        component.logisticaOpen = true;

        component.toggleSubmenu('ventas');

        expect(component.gestionOpen).toBe(true);
        expect(component.logisticaOpen).toBe(true);
      });
    });

    describe('logistica menu', () => {
      it('should toggle logistica menu from false to true', () => {
        component.logisticaOpen = false;

        component.toggleSubmenu('logistica');

        expect(component.logisticaOpen).toBe(true);
      });

      it('should toggle logistica menu from true to false', () => {
        component.logisticaOpen = true;

        component.toggleSubmenu('logistica');

        expect(component.logisticaOpen).toBe(false);
      });

      it('should not affect other menus when toggling logistica', () => {
        component.gestionOpen = true;
        component.ventasOpen = true;

        component.toggleSubmenu('logistica');

        expect(component.gestionOpen).toBe(true);
        expect(component.ventasOpen).toBe(true);
      });
    });

    describe('unknown menu', () => {
      it('should not affect any menu when passing unknown menu name', () => {
        const initialGestion = component.gestionOpen;
        const initialVentas = component.ventasOpen;
        const initialLogistica = component.logisticaOpen;

        component.toggleSubmenu('unknown');

        expect(component.gestionOpen).toBe(initialGestion);
        expect(component.ventasOpen).toBe(initialVentas);
        expect(component.logisticaOpen).toBe(initialLogistica);
      });

      it('should handle empty string menu name', () => {
        const initialGestion = component.gestionOpen;
        const initialVentas = component.ventasOpen;
        const initialLogistica = component.logisticaOpen;

        component.toggleSubmenu('');

        expect(component.gestionOpen).toBe(initialGestion);
        expect(component.ventasOpen).toBe(initialVentas);
        expect(component.logisticaOpen).toBe(initialLogistica);
      });

      it('should handle null menu name', () => {
        const initialGestion = component.gestionOpen;
        const initialVentas = component.ventasOpen;
        const initialLogistica = component.logisticaOpen;

        component.toggleSubmenu(null as any);

        expect(component.gestionOpen).toBe(initialGestion);
        expect(component.ventasOpen).toBe(initialVentas);
        expect(component.logisticaOpen).toBe(initialLogistica);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle multiple menu toggles in sequence', () => {
      component.toggleSubmenu('gestion');
      expect(component.gestionOpen).toBe(true);

      component.toggleSubmenu('ventas');
      expect(component.ventasOpen).toBe(true);
      expect(component.gestionOpen).toBe(true);

      component.toggleSubmenu('logistica');
      expect(component.logisticaOpen).toBe(true);
      expect(component.ventasOpen).toBe(true);
      expect(component.gestionOpen).toBe(true);
    });

    it('should handle sidebar and menu toggles together', () => {
      component.toggleSidebar();
      component.toggleSubmenu('gestion');

      expect(component.sidebarVisible).toBe(false);
      expect(component.gestionOpen).toBe(true);
    });

    it('should maintain independent state for each menu', () => {
      // Open all menus
      component.toggleSubmenu('gestion');
      component.toggleSubmenu('ventas');
      component.toggleSubmenu('logistica');

      expect(component.gestionOpen).toBe(true);
      expect(component.ventasOpen).toBe(true);
      expect(component.logisticaOpen).toBe(true);

      // Close one menu, others should remain open
      component.toggleSubmenu('ventas');

      expect(component.gestionOpen).toBe(true);
      expect(component.ventasOpen).toBe(false);
      expect(component.logisticaOpen).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle case-sensitive menu names', () => {
      component.toggleSubmenu('GESTION');
      expect(component.gestionOpen).toBe(false);

      component.toggleSubmenu('Gestion');
      expect(component.gestionOpen).toBe(false);

      component.toggleSubmenu('gestion');
      expect(component.gestionOpen).toBe(true);
    });

    it('should handle special characters in route', async () => {
      const route = 'route-with-special/chars#hash?query=1';
      mockRouter.navigate.mockResolvedValue(true);

      await component.navigateTo(route);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/route-with-special/chars#hash?query=1']);
    });

    it('should handle navigation with async timing', async () => {
      const route = 'async-route';
      mockRouter.navigate.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(true), 10);
        });
      });

      await component.navigateTo(route);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/async-route']);
    });
  });
});
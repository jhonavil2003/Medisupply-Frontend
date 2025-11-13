import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { DashboardAdminComponent } from './dashboard-admin.component';

describe('DashboardAdminComponent', () => {
  let component: DashboardAdminComponent;
  let fixture: ComponentFixture<DashboardAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardAdminComponent,
        RouterModule.forRoot([]),
        MatButtonModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.showLangMenu).toBe(false);
      expect(component.sidebarVisible).toBe(true);
      expect(component.selectedLanguage).toBe('es');
    });

    it('should have languages array properly initialized', () => {
      expect(component.languages).toEqual([
        { code: 'es', label: 'Español' },
        { code: 'en', label: 'English' },
        { code: 'pt', label: 'Portugués' }
      ]);
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
    });
  });

  describe('texts property', () => {
    it('should have complete Spanish texts', () => {
      const esTexts = component.texts.es;
      
      expect(esTexts.registro).toBe('Registro de proveedores y productos');
      expect(esTexts.registrarNuevo).toBe('Registrar nuevo');
      expect(esTexts.gestion).toBe('Gestión de vendedores y planes de venta');
      expect(esTexts.agregarVendedor).toBe('Agregar vendedor');
      expect(esTexts.reportes).toBe('Reportes e informes de ventas');
      expect(esTexts.verReportes).toBe('Ver reportes');
      expect(esTexts.inventario).toBe('Inventario y localización de productos');
      expect(esTexts.rutas).toBe('Rutas de entrega');
      expect(esTexts.usuario).toBe('Administrador');
      expect(esTexts.ayuda).toBe('Ayuda');
      expect(esTexts.soporte).toBe('Soporte');
      expect(esTexts.privacidad).toBe('Política de privacidad');
      expect(esTexts.mediSupply).toBe('MediSupply');
      expect(esTexts.inicio).toBe('Inicio');
      expect(esTexts.gestionMenu).toBe('Gestión');
      expect(esTexts.proveedores).toBe('Proveedores');
      expect(esTexts.productos).toBe('Productos');
      expect(esTexts.vendedores).toBe('Vendedores');
      expect(esTexts.ventasReportes).toBe('Ventas y Reportes');
      expect(esTexts.planesVenta).toBe('Planes de venta');
      expect(esTexts.reportesInformes).toBe('Reportes');
      expect(esTexts.logistica).toBe('Logística');
      expect(esTexts.inventarioMenu).toBe('Inventario / Localización de productos');
      expect(esTexts.rutasMenu).toBe('Rutas de entrega');
      expect(esTexts.copyright).toBe('© Universidad de los Andes / MediSupply');
    });

    it('should have complete English texts', () => {
      const enTexts = component.texts.en;
      
      expect(enTexts.registro).toBe('Supplier and Product Registration');
      expect(enTexts.registrarNuevo).toBe('Register new');
      expect(enTexts.gestion).toBe('Salespeople and Sales Plans Management');
      expect(enTexts.agregarVendedor).toBe('Add salesperson');
      expect(enTexts.reportes).toBe('Sales Reports and Statements');
      expect(enTexts.verReportes).toBe('View reports');
      expect(enTexts.inventario).toBe('Product Inventory and Location');
      expect(enTexts.rutas).toBe('Delivery Routes');
      expect(enTexts.usuario).toBe('Administrator');
      expect(enTexts.ayuda).toBe('Help');
      expect(enTexts.soporte).toBe('Support');
      expect(enTexts.privacidad).toBe('Privacy Policy');
      expect(enTexts.mediSupply).toBe('MediSupply');
      expect(enTexts.inicio).toBe('Home');
      expect(enTexts.gestionMenu).toBe('Management');
      expect(enTexts.proveedores).toBe('Suppliers');
      expect(enTexts.productos).toBe('Products');
      expect(enTexts.vendedores).toBe('Salespeople');
      expect(enTexts.ventasReportes).toBe('Sales & Reports');
      expect(enTexts.planesVenta).toBe('Sales Plans');
      expect(enTexts.reportesInformes).toBe('Reports & Statements');
      expect(enTexts.logistica).toBe('Logistics');
      expect(enTexts.inventarioMenu).toBe('Inventory / Product Location');
      expect(enTexts.rutasMenu).toBe('Delivery Routes');
      expect(enTexts.copyright).toBe('© Universidad de los Andes / MediSupply');
    });

    it('should have complete Portuguese texts', () => {
      const ptTexts = component.texts.pt;
      
      expect(ptTexts.registro).toBe('Registro de fornecedores e produtos');
      expect(ptTexts.registrarNuevo).toBe('Registrar novo');
      expect(ptTexts.gestion).toBe('Gestão de vendedores e planos de venda');
      expect(ptTexts.agregarVendedor).toBe('Adicionar vendedor');
      expect(ptTexts.reportes).toBe('Relatórios e informes de vendas');
      expect(ptTexts.verReportes).toBe('Ver relatórios');
      expect(ptTexts.inventario).toBe('Inventário e localização de produtos');
      expect(ptTexts.rutas).toBe('Rotas de entrega');
      expect(ptTexts.usuario).toBe('Administrador');
      expect(ptTexts.ayuda).toBe('Ajuda');
      expect(ptTexts.soporte).toBe('Suporte');
      expect(ptTexts.privacidad).toBe('Política de privacidade');
      expect(ptTexts.mediSupply).toBe('MediSupply');
      expect(ptTexts.inicio).toBe('Início');
      expect(ptTexts.gestionMenu).toBe('Gestão');
      expect(ptTexts.proveedores).toBe('Fornecedores');
      expect(ptTexts.productos).toBe('Produtos');
      expect(ptTexts.vendedores).toBe('Vendedores');
      expect(ptTexts.ventasReportes).toBe('Vendas e Relatórios');
      expect(ptTexts.planesVenta).toBe('Planos de venda');
      expect(ptTexts.reportesInformes).toBe('Relatórios e informes');
      expect(ptTexts.logistica).toBe('Logística');
      expect(ptTexts.inventarioMenu).toBe('Inventário / Localização de produtos');
      expect(ptTexts.rutasMenu).toBe('Rotas de entrega');
      expect(ptTexts.copyright).toBe('© Universidad de los Andes / MediSupply');
    });
  });

  describe('t getter', () => {
    it('should return Spanish texts when selectedLanguage is es', () => {
      component.selectedLanguage = 'es';

      const texts = component.t;

      expect(texts).toBe(component.texts.es);
      expect(texts.inicio).toBe('Inicio');
    });

    it('should return English texts when selectedLanguage is en', () => {
      component.selectedLanguage = 'en';

      const texts = component.t;

      expect(texts).toBe(component.texts.en);
      expect(texts.inicio).toBe('Home');
    });

    it('should return Portuguese texts when selectedLanguage is pt', () => {
      component.selectedLanguage = 'pt';

      const texts = component.t;

      expect(texts).toBe(component.texts.pt);
      expect(texts.inicio).toBe('Início');
    });

    it('should return correct texts when language is changed multiple times', () => {
      component.selectedLanguage = 'es';
      expect(component.t.productos).toBe('Productos');

      component.selectedLanguage = 'en';
      expect(component.t.productos).toBe('Products');

      component.selectedLanguage = 'pt';
      expect(component.t.productos).toBe('Produtos');

      component.selectedLanguage = 'es';
      expect(component.t.productos).toBe('Productos');
    });
  });

  describe('onLanguageChange', () => {
    it('should change selectedLanguage to English when en is selected', () => {
      const event = {
        target: {
          value: 'en'
        }
      } as any;

      component.onLanguageChange(event);

      expect(component.selectedLanguage).toBe('en');
    });

    it('should change selectedLanguage to Portuguese when pt is selected', () => {
      const event = {
        target: {
          value: 'pt'
        }
      } as any;

      component.onLanguageChange(event);

      expect(component.selectedLanguage).toBe('pt');
    });

    it('should change selectedLanguage to Spanish when es is selected', () => {
      component.selectedLanguage = 'en'; // Start with different language
      
      const event = {
        target: {
          value: 'es'
        }
      } as any;

      component.onLanguageChange(event);

      expect(component.selectedLanguage).toBe('es');
    });

    it('should not change selectedLanguage when target is null', () => {
      const originalLanguage = component.selectedLanguage;
      const event = {
        target: null
      } as any;

      component.onLanguageChange(event);

      expect(component.selectedLanguage).toBe(originalLanguage);
    });

    it('should not change selectedLanguage when target value is empty', () => {
      const originalLanguage = component.selectedLanguage;
      const event = {
        target: {
          value: ''
        }
      } as any;

      component.onLanguageChange(event);

      expect(component.selectedLanguage).toBe(originalLanguage);
    });

    it('should not change selectedLanguage when target value is null', () => {
      const originalLanguage = component.selectedLanguage;
      const event = {
        target: {
          value: null
        }
      } as any;

      component.onLanguageChange(event);

      expect(component.selectedLanguage).toBe(originalLanguage);
    });

    it('should not change selectedLanguage when target value is undefined', () => {
      const originalLanguage = component.selectedLanguage;
      const event = {
        target: {
          value: undefined
        }
      } as any;

      component.onLanguageChange(event);

      expect(component.selectedLanguage).toBe(originalLanguage);
    });

    it('should handle invalid language codes', () => {
      component.selectedLanguage = 'es';
      const event = {
        target: {
          value: 'invalid'
        }
      } as any;

      component.onLanguageChange(event);

      expect(component.selectedLanguage).toBe('invalid');
    });

    it('should handle case-sensitive language codes', () => {
      const event = {
        target: {
          value: 'EN'
        }
      } as any;

      component.onLanguageChange(event);

      expect(component.selectedLanguage).toBe('EN');
    });
  });

  describe('Integration Tests', () => {
    it('should maintain independent state for sidebar and language', () => {
      component.toggleSidebar();
      component.selectedLanguage = 'en';

      expect(component.sidebarVisible).toBe(false);
      expect(component.selectedLanguage).toBe('en');
      expect(component.t.inicio).toBe('Home');
    });

    it('should handle multiple language changes with sidebar toggles', () => {
      component.onLanguageChange({ target: { value: 'en' } } as any);
      component.toggleSidebar();
      component.onLanguageChange({ target: { value: 'pt' } } as any);

      expect(component.selectedLanguage).toBe('pt');
      expect(component.sidebarVisible).toBe(false);
      expect(component.t.inicio).toBe('Início');
    });

    it('should preserve showLangMenu state across other operations', () => {
      component.showLangMenu = true;

      component.toggleSidebar();
      component.onLanguageChange({ target: { value: 'en' } } as any);

      expect(component.showLangMenu).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle texts getter with non-existent language code', () => {
      component.selectedLanguage = 'nonexistent';

      expect(component.t).toBeUndefined();
    });

    it('should handle event without target property', () => {
      const originalLanguage = component.selectedLanguage;
      const event = {} as any;

      component.onLanguageChange(event);

      expect(component.selectedLanguage).toBe(originalLanguage);
    });

    it('should verify all three language objects have same keys', () => {
      const esKeys = Object.keys(component.texts.es).sort();
      const enKeys = Object.keys(component.texts.en).sort();
      const ptKeys = Object.keys(component.texts.pt).sort();

      expect(esKeys).toEqual(enKeys);
      expect(enKeys).toEqual(ptKeys);
      expect(esKeys).toEqual(ptKeys);
    });

    it('should handle multiple rapid language changes', () => {
      const languages = ['es', 'en', 'pt', 'es', 'en'];
      
      languages.forEach(lang => {
        component.onLanguageChange({ target: { value: lang } } as any);
        expect(component.selectedLanguage).toBe(lang);
      });
    });

    it('should handle special characters in language selection', () => {
      const event = {
        target: {
          value: 'es-MX'
        }
      } as any;

      component.onLanguageChange(event);

      expect(component.selectedLanguage).toBe('es-MX');
    });
  });

  describe('Performance Tests', () => {
    it('should handle multiple t getter calls efficiently', () => {
      component.selectedLanguage = 'en';
      
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        const texts = component.t;
        expect(texts).toBeDefined();
      }
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should handle multiple sidebar toggles efficiently', () => {
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        component.toggleSidebar();
      }
      const end = performance.now();
      
      expect(end - start).toBeLessThan(50); // Should complete in less than 50ms
    });
  });
});
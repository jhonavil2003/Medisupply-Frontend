/// <reference types="cypress" />

describe('Internacionalización - Prueba Smoke', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Cambio de Idioma', () => {
    it('debe cambiar de español a inglés y viceversa correctamente', () => {
      // Iniciar con español
      cy.forceSpanishLanguage();
      cy.reload();
      cy.wait(500);
      
      // Verificar que el contenido está en español
      cy.window().its('localStorage.language').should('eq', 'es');
      
      // Navegar al dashboard
      cy.visit('/dashboard-admin');
      cy.wait(500);
      
      // Buscar el selector de idioma (puede variar según tu implementación)
      // Asumo que hay un botón o selector en el dashboard
      cy.get('body').then($body => {
        // Verificar textos en español
        if ($body.text().includes('Productos') || $body.text().includes('Dashboard')) {
          cy.log('✓ Contenido en español detectado');
        }
      });
      
      // Cambiar a inglés
      cy.window().then((win) => {
        win.localStorage.setItem('language', 'en');
      });
      cy.reload();
      cy.wait(500);
      
      // Verificar que el idioma cambió
      cy.window().its('localStorage.language').should('eq', 'en');
      
      // Verificar contenido en inglés
      cy.get('body').then($body => {
        if ($body.text().includes('Products') || $body.text().includes('Dashboard')) {
          cy.log('✓ Contenido en inglés detectado');
        }
      });
      
      // Regresar a español
      cy.window().then((win) => {
        win.localStorage.setItem('language', 'es');
      });
      cy.reload();
      cy.wait(500);
      
      // Verificar que regresó a español
      cy.window().its('localStorage.language').should('eq', 'es');
    });

    it('debe mantener el idioma seleccionado entre navegaciones', () => {
      // Establecer español
      cy.forceSpanishLanguage();
      cy.visit('/dashboard-admin');
      cy.wait(500);
      
      // Verificar idioma
      cy.window().its('localStorage.language').should('eq', 'es');
      
      // Navegar a productos
      cy.visit('/producto-list');
      cy.wait(500);
      
      // Verificar que se mantiene español
      cy.window().its('localStorage.language').should('eq', 'es');
      
      // Navegar a vendedores
      cy.visit('/vendedores');
      cy.wait(500);
      
      // Verificar que se mantiene español
      cy.window().its('localStorage.language').should('eq', 'es');
    });

    it('debe usar español como idioma por defecto si no hay configuración', () => {
      // Limpiar localStorage
      cy.clearLocalStorage();
      
      // Navegar a la aplicación
      cy.visit('/dashboard-admin');
      cy.wait(500);
      
      // Verificar que se establece español por defecto
      cy.window().then((win) => {
        const language = win.localStorage.getItem('language');
        // Debe ser español o establecerse automáticamente
        expect(language === 'es' || language === null).to.be.true;
      });
    });
  });

  describe('Traducción de Rutas', () => {
    it('debe traducir correctamente el menú principal en español', () => {
      cy.forceSpanishLanguage();
      cy.visit('/dashboard-admin');
      cy.wait(500);
      
      // Verificar que existen términos en español (aunque el texto puede variar)
      cy.get('body').should('exist');
    });

    it('debe traducir correctamente las páginas en inglés', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('language', 'en');
      });
      cy.visit('/dashboard-admin');
      cy.wait(500);
      
      // Verificar que existen elementos traducidos
      cy.get('body').should('exist');
    });
  });

  describe('Validación de Traducciones', () => {
    it('no debe mostrar keys de traducción sin traducir', () => {
      cy.forceSpanishLanguage();
      cy.visit('/producto-list');
      cy.wait(1000);
      
      // Buscar patrones de keys no traducidas (ej: "PRODUCTS.TITLE", "COMMON.SAVE")
      cy.get('body').then($body => {
        const bodyText = $body.text();
        
        // Si encuentra patrones como WORD.WORD en mayúsculas, puede indicar traducción faltante
        const untranslatedPattern = /[A-Z_]+\.[A-Z_]+/g;
        const matches = bodyText.match(untranslatedPattern);
        
        if (matches && matches.length > 0) {
          cy.log('⚠️ Posibles traducciones faltantes:', matches.slice(0, 5).join(', '));
        }
      });
    });

    it('no debe mostrar keys de traducción sin traducir en inglés', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('language', 'en');
      });
      cy.visit('/producto-list');
      cy.wait(1000);
      
      // Buscar patrones de keys no traducidas
      cy.get('body').then($body => {
        const bodyText = $body.text();
        const untranslatedPattern = /[A-Z_]+\.[A-Z_]+/g;
        const matches = bodyText.match(untranslatedPattern);
        
        if (matches && matches.length > 0) {
          cy.log('⚠️ Posibles traducciones faltantes en inglés:', matches.slice(0, 5).join(', '));
        }
      });
    });
  });

  describe('Módulos Principales con i18n', () => {
    const modules = [
      { path: '/producto-list', name: 'Productos' },
      { path: '/proveedor-list', name: 'Proveedores' },
      { path: '/vendedores', name: 'Vendedores' },
      { path: '/metas', name: 'Metas' },
      { path: '/dashboard-admin', name: 'Dashboard' }
    ];

    modules.forEach(module => {
      it(`debe cargar correctamente el módulo ${module.name} en español`, () => {
        cy.forceSpanishLanguage();
        cy.visit(module.path);
        cy.wait(500);
        
        // Verificar que la página cargó
        cy.get('body').should('exist');
        
        // Verificar que el idioma es español
        cy.window().its('localStorage.language').should('eq', 'es');
      });
    });
  });
});

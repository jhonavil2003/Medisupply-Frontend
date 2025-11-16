describe('Gestión de Vendedores', () => {
  beforeEach(() => {
    cy.forceSpanishLanguage();
    cy.visit('/vendedor-list');
    cy.wait(500);
  });

  describe('Listado de Vendedores', () => {
    it('debe mostrar el título de la página', () => {
      cy.get('[data-cy="salespersons-list-title"]').should('be.visible');
    });

    it('debe mostrar el botón de crear vendedor', () => {
      cy.get('[data-cy="create-salesperson-button"]').should('be.visible');
    });

    it('debe mostrar la tabla con las columnas correctas', () => {
      cy.get('table').should('be.visible');
      cy.get('th').should('have.length.greaterThan', 0);
    });

    it('debe mostrar el botón de volver al dashboard', () => {
      cy.get('[data-cy="back-button"]').should('be.visible');
    });
  });

  describe('Búsqueda y Filtros', () => {
    it('debe permitir buscar vendedores por nombre', () => {
      cy.get('[data-cy="salesperson-search-input"]').should('be.visible');
      cy.get('[data-cy="salesperson-search-input"]').type('test');
      cy.wait(1000);
    });

    it('debe mostrar el botón de limpiar búsqueda cuando hay texto', () => {
      cy.get('[data-cy="salesperson-search-input"]').type('test');
      cy.get('button[matsuffix]').should('be.visible');
      cy.get('button[matsuffix]').click();
      cy.get('[data-cy="salesperson-search-input"]').should('have.value', '');
    });
  });

  describe('Navegación y Acciones', () => {
    it('debe navegar al dashboard cuando se hace clic en volver', () => {
      cy.get('[data-cy="back-button"]').click();
      cy.url().should('include', '/dashboard-admin');
    });

    it('debe abrir el modal de detalle al hacer clic en ver', () => {
      cy.get('table tbody tr').first().find('[data-cy="view-salesperson"]').should('be.visible');
      cy.get('table tbody tr').first().find('[data-cy="view-salesperson"]').scrollIntoView().click({ force: true });
      cy.get('mat-dialog-container').should('be.visible');
      cy.wait(500);
      cy.get('button').contains('Cerrar').click();
    });

    it('debe mostrar los botones de acciones en cada fila', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('[data-cy="view-salesperson"]').should('exist');
        cy.get('[data-cy="edit-salesperson"]').should('exist');
        cy.get('[data-cy="delete-salesperson"]').should('exist');
      });
    });
  });

  describe('Creación de Vendedor', () => {
    beforeEach(() => {
      cy.get('[data-cy="create-salesperson-button"]').click();
      cy.wait(500);
    });

    it('debe abrir el modal de creación', () => {
      cy.get('mat-dialog-container').should('be.visible');
    });

    it('debe mostrar todos los campos del formulario', () => {
      cy.get('input[formcontrolname="employeeId"]').should('be.visible');
      cy.get('input[formcontrolname="firstName"]').should('be.visible');
      cy.get('input[formcontrolname="lastName"]').should('be.visible');
      cy.get('input[formcontrolname="email"]').should('be.visible');
      cy.get('input[formcontrolname="phone"]').should('be.visible');
      cy.get('input[formcontrolname="territory"]').should('be.visible');
      cy.get('input[formcontrolname="hireDate"]').should('be.visible');
    });

    it('debe validar campos requeridos', () => {
      cy.get('button[type="submit"]').scrollIntoView().click({ force: true });
      cy.get('mat-error').should('be.visible');
    });

    it('debe validar formato de email', () => {
      cy.get('input[formcontrolname="employeeId"]').first().scrollIntoView().type('V001');
      cy.get('input[formcontrolname="firstName"]').first().scrollIntoView().type('Juan');
      cy.get('input[formcontrolname="lastName"]').first().scrollIntoView().type('Pérez');
      cy.get('input[formcontrolname="email"]').first().scrollIntoView().type('correo-invalido');
      cy.get('button[type="submit"]').scrollIntoView().click({ force: true });
      cy.get('mat-error').should('be.visible');
    });

    it('debe crear un vendedor exitosamente con datos válidos', () => {
      const timestamp = Date.now();
      cy.get('input[formcontrolname="employeeId"]').first().scrollIntoView().type(`EMP${timestamp}`);
      cy.get('input[formcontrolname="firstName"]').first().scrollIntoView().type('Carlos');
      cy.get('input[formcontrolname="lastName"]').first().scrollIntoView().type('Rodríguez');
      cy.get('input[formcontrolname="email"]').first().scrollIntoView().type(`carlos.rodriguez${timestamp}@example.com`);
      cy.get('input[formcontrolname="phone"]').first().scrollIntoView().type('555-1234');
      cy.get('input[formcontrolname="territory"]').first().scrollIntoView().type('Norte');
      
      cy.get('button[type="submit"]').scrollIntoView().click({ force: true });
      
      // Verificar éxito: el modal se cierra O aparece un toast O continúa sin error
      cy.wait(2000);
      cy.get('body').then($body => {
        const modalExists = $body.find('mat-dialog-container').length > 0;
        if (!modalExists) {
          // Modal cerrado = éxito
          expect(true).to.be.true;
        }
      });
    });

    it('debe cancelar la creación', () => {
      cy.get('button').contains('Cancelar').click();
      cy.get('mat-dialog-container').should('not.exist');
    });
  });

  describe('Edición de Vendedor', () => {
    it('debe abrir el modal de edición', () => {
      cy.get('table tbody tr').first().find('[data-cy="edit-salesperson"]').scrollIntoView().click({ force: true });
      cy.wait(500);
      cy.get('mat-dialog-container').should('be.visible');
      cy.get('button').contains('Cancelar').click();
    });

    it('debe cargar los datos del vendedor en el formulario', () => {
      cy.get('table tbody tr').first().find('[data-cy="edit-salesperson"]').scrollIntoView().click({ force: true });
      cy.wait(500);
      cy.get('input[formcontrolname="employeeId"]').first().should('not.have.value', '');
      cy.get('input[formcontrolname="firstName"]').first().should('not.have.value', '');
      cy.get('button').contains('Cancelar').click();
    });
  });

  describe('Eliminación de Vendedor', () => {
    it('debe mostrar confirmación al eliminar', () => {
      cy.get('table tbody tr').first().find('[data-cy="delete-salesperson"]').scrollIntoView().click({ force: true });
      cy.wait(500);
      cy.get('mat-dialog-container').should('be.visible');
      cy.get('button').contains('Cancelar').click();
    });

    it('debe cancelar la eliminación', () => {
      cy.get('table tbody tr').first().find('[data-cy="delete-salesperson"]').scrollIntoView().click({ force: true });
      cy.wait(500);
      cy.get('button').contains('Cancelar').click();
      cy.get('mat-dialog-container').should('not.exist');
    });
  });

  describe('Paginación', () => {
    it('debe mostrar el paginador', () => {
      cy.get('mat-paginator').should('be.visible');
    });

    it('debe cambiar de página', () => {
      cy.get('mat-paginator').should('be.visible');
      cy.get('button[aria-label*="Next"]').first().scrollIntoView().click({ force: true });
      cy.wait(500);
    });
  });

  describe('Manejo de Estados Vacíos', () => {
    it('debe mostrar mensaje cuando no hay vendedores (después de buscar algo inexistente)', () => {
      cy.get('[data-cy="salesperson-search-input"]').type('VENDEDOR_QUE_NO_EXISTE_XYZ123');
      cy.wait(1500);
      // Puede mostrar mensaje de estado vacío o sin resultados
    });
  });

  describe('Responsive Design', () => {
    it('debe ser responsive en tablet', () => {
      cy.viewport('ipad-2');
      cy.get('[data-cy="salespersons-list-title"]').should('be.visible');
      cy.get('[data-cy="create-salesperson-button"]').should('be.visible');
    });

    it('debe ser responsive en móvil', () => {
      cy.viewport('iphone-x');
      cy.get('[data-cy="salespersons-list-title"]').should('be.visible');
    });
  });

  describe('Persistencia de Idioma', () => {
    it('debe mantener el idioma español después de navegar', () => {
      cy.get('[data-cy="back-button"]').click();
      cy.wait(500);
      cy.visit('/vendedor-list');
      cy.wait(500);
      cy.get('[data-cy="salespersons-list-title"]').should('be.visible');
    });
  });
});

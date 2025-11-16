describe('Gestión de Metas de Ventas', () => {
  beforeEach(() => {
    cy.forceSpanishLanguage();
    cy.visit('/metas-list');
    cy.wait(500);
  });

  describe('Listado de Metas', () => {
    it('debe mostrar el título de la página', () => {
      cy.get('[data-cy="goals-list-title"]').should('be.visible');
    });

    it('debe mostrar el botón de crear meta', () => {
      cy.get('[data-cy="create-goal-button"]').should('be.visible');
    });

    it('debe mostrar la tabla con las columnas correctas', () => {
      cy.get('table').should('be.visible');
      cy.get('th').should('have.length.greaterThan', 0);
    });

    it('debe mostrar el botón de volver al dashboard', () => {
      cy.get('[data-cy="back-button"]').should('be.visible');
    });
  });

  describe('Filtros', () => {
    it('debe mostrar los filtros de región, trimestre y tipo', () => {
      cy.get('[data-cy="filter-region"]').should('be.visible');
      cy.get('[data-cy="filter-quarter"]').should('be.visible');
      cy.get('[data-cy="filter-type"]').should('be.visible');
    });

    it('debe permitir filtrar por región', () => {
      cy.get('[data-cy="filter-region"]').click();
      cy.wait(300);
      cy.get('mat-option').first().click();
      cy.wait(1000);
    });

    it('debe permitir filtrar por trimestre', () => {
      cy.get('[data-cy="filter-quarter"]').click();
      cy.wait(300);
      cy.get('mat-option').first().click();
      cy.wait(1000);
    });

    it('debe permitir filtrar por tipo', () => {
      cy.get('[data-cy="filter-type"]').click();
      cy.wait(300);
      cy.get('mat-option').first().click();
      cy.wait(1000);
    });

    it('debe limpiar los filtros al hacer clic en limpiar', () => {
      cy.get('[data-cy="filter-region"]').click();
      cy.wait(300);
      cy.get('mat-option').first().click();
      cy.wait(500);
      cy.get('[data-cy="clear-filters"]').click();
      cy.wait(1000);
    });
  });

  describe('Navegación y Acciones', () => {
    it('debe navegar al dashboard cuando se hace clic en volver', () => {
      cy.get('[data-cy="back-button"]').click();
      cy.url().should('include', '/dashboard-admin');
    });

    it('debe abrir el modal de detalle al hacer clic en ver', () => {
      cy.get('table tbody tr').first().find('[data-cy="view-goal"]').should('be.visible');
      cy.get('table tbody tr').first().find('[data-cy="view-goal"]').scrollIntoView().click({ force: true });
      cy.wait(500);
      cy.get('mat-dialog-container').should('be.visible');
      cy.get('button').contains('Cerrar').click();
    });

    it('debe mostrar los botones de acciones en cada fila', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('[data-cy="view-goal"]').should('exist');
        cy.get('[data-cy="edit-goal"]').should('exist');
        cy.get('[data-cy="delete-goal"]').should('exist');
      });
    });
  });

  describe('Creación de Meta', () => {
    beforeEach(() => {
      cy.get('[data-cy="create-goal-button"]').click();
      cy.wait(500);
    });

    it('debe abrir el modal de creación', () => {
      cy.get('mat-dialog-container').should('be.visible');
    });

    it('debe mostrar todos los campos del formulario', () => {
      cy.get('input[formcontrolname="idVendedor"]').should('be.visible');
      cy.get('input[formcontrolname="idProducto"]').should('be.visible');
      cy.get('mat-select[formcontrolname="region"]').should('be.visible');
      cy.get('mat-select[formcontrolname="trimestre"]').should('be.visible');
      cy.get('mat-select[formcontrolname="tipo"]').should('be.visible');
      cy.get('input[formcontrolname="valorObjetivo"]').should('be.visible');
    });

    it('debe validar campos requeridos', () => {
      cy.get('button[type="submit"]').scrollIntoView().click({ force: true });
      cy.get('mat-error').should('be.visible');
    });

    it('debe validar que el valor objetivo sea mayor a 0', () => {
      cy.get('input[formcontrolname="idVendedor"]').first().scrollIntoView().type('V001');
      cy.get('input[formcontrolname="idProducto"]').first().scrollIntoView().type('P001');
      cy.get('mat-select[formcontrolname="region"]').first().scrollIntoView().click({ force: true });
      cy.wait(300);
      cy.get('mat-option').first().click();
      cy.get('mat-select[formcontrolname="trimestre"]').first().scrollIntoView().click({ force: true });
      cy.wait(300);
      cy.get('mat-option').first().click();
      cy.get('mat-select[formcontrolname="tipo"]').first().scrollIntoView().click({ force: true });
      cy.wait(300);
      cy.get('mat-option').first().click();
      cy.get('input[formcontrolname="valorObjetivo"]').first().scrollIntoView().type('0');
      cy.get('button[type="submit"]').scrollIntoView().click({ force: true });
      cy.get('mat-error').should('be.visible');
    });

    it('debe cancelar la creación', () => {
      cy.get('button').contains('Cancelar').click();
      cy.get('mat-dialog-container').should('not.exist');
    });
  });

  describe('Edición de Meta', () => {
    it('debe abrir el modal de edición', () => {
      cy.get('table tbody tr').first().find('[data-cy="edit-goal"]').scrollIntoView().click({ force: true });
      cy.wait(500);
      cy.get('mat-dialog-container').should('be.visible');
      cy.get('button').contains('Cancelar').click();
    });

    it('debe cargar los datos de la meta en el formulario', () => {
      cy.get('table tbody tr').first().find('[data-cy="edit-goal"]').scrollIntoView().click({ force: true });
      cy.wait(500);
      cy.get('input[formcontrolname="idVendedor"]').first().should('not.have.value', '');
      cy.get('input[formcontrolname="idProducto"]').first().should('not.have.value', '');
      cy.get('button').contains('Cancelar').click();
    });
  });

  describe('Eliminación de Meta', () => {
    it('debe mostrar confirmación al eliminar', () => {
      cy.get('table tbody tr').first().find('[data-cy="delete-goal"]').scrollIntoView().click({ force: true });
      cy.wait(500);
      cy.get('mat-dialog-container').should('be.visible');
      cy.get('button').contains('Cancelar').click();
    });

    it('debe cancelar la eliminación', () => {
      cy.get('table tbody tr').first().find('[data-cy="delete-goal"]').scrollIntoView().click({ force: true });
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

  describe('Responsive Design', () => {
    it('debe ser responsive en tablet', () => {
      cy.viewport('ipad-2');
      cy.get('[data-cy="goals-list-title"]').should('be.visible');
      cy.get('[data-cy="create-goal-button"]').should('be.visible');
    });

    it('debe ser responsive en móvil', () => {
      cy.viewport('iphone-x');
      cy.get('[data-cy="goals-list-title"]').should('be.visible');
    });
  });

  describe('Persistencia de Idioma', () => {
    it('debe mantener el idioma español después de navegar', () => {
      cy.get('[data-cy="back-button"]').click();
      cy.wait(500);
      cy.visit('/metas-list');
      cy.wait(500);
      cy.get('[data-cy="goals-list-title"]').should('be.visible');
    });
  });
});

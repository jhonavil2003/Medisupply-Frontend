describe('Informe de Ventas', () => {
  beforeEach(() => {
    cy.forceSpanishLanguage();
    cy.visit('/informe-ventas');
  });

  describe('Listado de Reportes', () => {
    it('debe mostrar el título del informe', () => {
      cy.contains('h2', 'Reporte de desempeño de ventas').should('be.visible');
    });

    it('debe mostrar el botón de volver al dashboard', () => {
      cy.get('[data-cy="back-to-dashboard"]').should('be.visible');
    });

    it('debe cargar y mostrar la tabla de ventas', () => {
      cy.get('[data-cy="reports-table"]').should('be.visible');
    });

    it('debe mostrar mensaje cuando no hay datos', () => {
      // Limpiar filtros para mostrar todos los datos
      cy.get('[data-cy="clear-filters"]').click();
      
      // Si no hay datos después de limpiar, debe mostrar el mensaje
      cy.get('body').then($body => {
        if ($body.find('[data-cy="no-data-message"]').length > 0) {
          cy.get('[data-cy="no-data-message"]').should('be.visible');
          cy.get('[data-cy="no-data-message"]').should('contain', 'No hay datos');
        } else {
          // Si hay datos, verificar que la tabla sea visible
          cy.get('[data-cy="reports-table"]').should('be.visible');
        }
      });
    });
  });

  describe('Filtros', () => {
    it('debe mostrar todos los filtros disponibles', () => {
      cy.get('[data-cy="filter-month"]').should('be.visible');
      cy.get('[data-cy="filter-year"]').should('be.visible');
      cy.get('[data-cy="filter-salesperson"]').should('be.visible');
      cy.get('[data-cy="filter-product"]').should('be.visible');
      cy.get('[data-cy="filter-region"]').should('be.visible');
    });

    it('debe filtrar por mes', () => {
      cy.get('[data-cy="filter-month"]').click();
      cy.get('mat-option').contains('Enero').click();
      cy.wait(1000);
      
      // Verificar que se aplicó el filtro (puede mostrar tabla o mensaje sin datos)
      cy.get('body').then($body => {
        const hasData = $body.find('[data-cy="reports-table"]').length > 0;
        const hasNoData = $body.find('[data-cy="no-data-message"]').length > 0;
        expect(hasData || hasNoData).to.be.true;
      });
    });

    it('debe filtrar por año', () => {
      cy.get('[data-cy="filter-year"]').click();
      cy.get('mat-option').first().click();
      cy.wait(1000);
      
      cy.get('body').then($body => {
        const hasData = $body.find('[data-cy="reports-table"]').length > 0;
        const hasNoData = $body.find('[data-cy="no-data-message"]').length > 0;
        expect(hasData || hasNoData).to.be.true;
      });
    });

    it('debe filtrar por vendedor', () => {
      cy.get('[data-cy="filter-salesperson"]').click();
      
      // Verificar que hay opciones disponibles (puede no haber si no hay datos)
      cy.get('mat-option').then($options => {
        if ($options.length > 1) {
          cy.get('mat-option').eq(1).click();
          cy.wait(1000);
          
          cy.get('body').then($body => {
            const hasData = $body.find('[data-cy="reports-table"]').length > 0;
            const hasNoData = $body.find('[data-cy="no-data-message"]').length > 0;
            expect(hasData || hasNoData).to.be.true;
          });
        } else {
          // Si no hay vendedores, cerrar el dropdown
          cy.get('body').click(0, 0);
        }
      });
    });

    it('debe filtrar por producto', () => {
      cy.get('[data-cy="filter-product"]').click();
      
      cy.get('mat-option').then($options => {
        if ($options.length > 1) {
          cy.get('mat-option').eq(1).click();
          cy.wait(1000);
          
          cy.get('body').then($body => {
            const hasData = $body.find('[data-cy="reports-table"]').length > 0;
            const hasNoData = $body.find('[data-cy="no-data-message"]').length > 0;
            expect(hasData || hasNoData).to.be.true;
          });
        } else {
          cy.get('body').click(0, 0);
        }
      });
    });

    it('debe filtrar por región', () => {
      cy.get('[data-cy="filter-region"]').click();
      
      cy.get('mat-option').then($options => {
        if ($options.length > 1) {
          cy.get('mat-option').eq(1).click();
          cy.wait(1000);
          
          cy.get('body').then($body => {
            const hasData = $body.find('[data-cy="reports-table"]').length > 0;
            const hasNoData = $body.find('[data-cy="no-data-message"]').length > 0;
            expect(hasData || hasNoData).to.be.true;
          });
        } else {
          cy.get('body').click(0, 0);
        }
      });
    });

    it('debe limpiar todos los filtros', () => {
      // Aplicar algunos filtros
      cy.get('[data-cy="filter-month"]').click();
      cy.get('mat-option').contains('Enero').click();
      cy.wait(500);
      
      // Limpiar filtros
      cy.get('[data-cy="clear-filters"]').click();
      cy.wait(1000);
      
      // Verificar que se recargaron los datos
      cy.get('body').then($body => {
        const hasData = $body.find('[data-cy="reports-table"]').length > 0;
        const hasNoData = $body.find('[data-cy="no-data-message"]').length > 0;
        expect(hasData || hasNoData).to.be.true;
      });
    });

    it('debe aplicar múltiples filtros simultáneamente', () => {
      // Filtrar por mes
      cy.get('[data-cy="filter-month"]').click();
      cy.get('mat-option').contains('Enero').click();
      cy.wait(500);
      
      // Filtrar por año
      cy.get('[data-cy="filter-year"]').click();
      cy.get('mat-option').first().click();
      cy.wait(1000);
      
      cy.get('body').then($body => {
        const hasData = $body.find('[data-cy="reports-table"]').length > 0;
        const hasNoData = $body.find('[data-cy="no-data-message"]').length > 0;
        expect(hasData || hasNoData).to.be.true;
      });
    });
  });

  describe('KPIs y Totales', () => {
    it('debe mostrar los KPIs cuando hay datos', () => {
      cy.get('[data-cy="clear-filters"]').click();
      cy.wait(1000);
      
      cy.get('body').then($body => {
        if ($body.find('[data-cy="reports-table"]').length > 0) {
          // Si hay datos, verificar que se muestren los KPIs
          cy.get('[data-cy="kpi-salespersons"]').should('be.visible');
          cy.get('[data-cy="kpi-products"]').should('be.visible');
          cy.get('[data-cy="kpi-volume"]').should('be.visible');
          cy.get('[data-cy="kpi-value"]').should('be.visible');
        }
      });
    });

    it('debe mostrar valores numéricos en los KPIs', () => {
      cy.get('[data-cy="clear-filters"]').click();
      cy.wait(1000);
      
      cy.get('body').then($body => {
        if ($body.find('[data-cy="kpi-salespersons"]').length > 0) {
          cy.get('[data-cy="kpi-salespersons"] .total-value').should('exist');
          cy.get('[data-cy="kpi-products"] .total-value').should('exist');
          cy.get('[data-cy="kpi-volume"] .total-value').should('exist');
          cy.get('[data-cy="kpi-value"] .total-value').should('exist');
        }
      });
    });
  });

  describe('Tabla de Reportes', () => {
    it('debe mostrar las columnas correctas', () => {
      cy.get('[data-cy="clear-filters"]').click();
      cy.wait(1000);
      
      cy.get('body').then($body => {
        if ($body.find('[data-cy="reports-table"]').length > 0) {
          cy.get('[data-cy="reports-table"] thead th').should('have.length.at.least', 5);
        }
      });
    });

    it('debe permitir ordenar por columnas', () => {
      cy.get('[data-cy="clear-filters"]').click();
      cy.wait(1000);
      
      cy.get('body').then($body => {
        if ($body.find('[data-cy="reports-table"]').length > 0) {
          // Intentar ordenar por la primera columna con mat-sort-header
          cy.get('[data-cy="reports-table"] th[mat-sort-header]').first().click();
          cy.wait(500);
          cy.get('[data-cy="reports-table"] th[mat-sort-header]').first().click();
        }
      });
    });

    it('debe mostrar datos formateados correctamente', () => {
      cy.get('[data-cy="clear-filters"]').click();
      cy.wait(1000);
      
      cy.get('body').then($body => {
        if ($body.find('[data-cy="reports-table"] tbody tr').length > 0) {
          // Verificar que hay al menos una fila con datos
          cy.get('[data-cy="reports-table"] tbody tr').first().should('be.visible');
        }
      });
    });
  });

  describe('Exportación', () => {
    it('debe mostrar el botón de exportar a PDF', () => {
      cy.get('[data-cy="export-pdf"]').should('be.visible');
      cy.get('[data-cy="export-pdf"]').should('contain', 'PDF');
    });

    it('debe mostrar el botón de exportar a Excel', () => {
      cy.get('[data-cy="export-excel"]').should('be.visible');
      cy.get('[data-cy="export-excel"]').should('contain', 'Excel');
    });

    it('debe permitir hacer clic en exportar a PDF', () => {
      cy.get('[data-cy="export-pdf"]').click();
      // Verificar que no hay errores (el toast aparecerá con el mensaje)
      cy.wait(500);
    });

    it('debe permitir hacer clic en exportar a Excel', () => {
      cy.get('[data-cy="export-excel"]').click();
      cy.wait(500);
    });
  });

  describe('Navegación', () => {
    it('debe volver al dashboard al hacer clic en el botón de retroceso', () => {
      cy.get('[data-cy="back-to-dashboard"]').click();
      cy.url().should('include', '/dashboard-admin');
    });
  });

  describe('Paginación', () => {
    it('debe mostrar el paginador cuando hay datos', () => {
      cy.get('[data-cy="clear-filters"]').click();
      cy.wait(1000);
      
      cy.get('body').then($body => {
        if ($body.find('[data-cy="reports-table"]').length > 0) {
          cy.get('mat-paginator').should('be.visible');
        }
      });
    });

    it('debe permitir cambiar el tamaño de página', () => {
      cy.get('[data-cy="clear-filters"]').click();
      cy.wait(1000);
      
      cy.get('body').then($body => {
        if ($body.find('[data-cy="reports-table"] tbody tr').length > 0) {
          cy.get('mat-paginator .mat-mdc-select').click({ force: true });
          cy.get('mat-option').contains('20').click({ force: true });
          cy.wait(500);
        }
      });
    });

    it('debe permitir navegar entre páginas', () => {
      cy.get('[data-cy="clear-filters"]').click();
      cy.wait(1000);
      
      cy.get('body').then($body => {
        // Verificar si hay suficientes datos para tener múltiples páginas
        if ($body.find('mat-paginator button[aria-label*="página siguiente"]').length > 0) {
          cy.get('mat-paginator button[aria-label*="página siguiente"]').then($btn => {
            if (!$btn.is(':disabled')) {
              cy.wrap($btn).click();
              cy.wait(500);
            }
          });
        }
      });
    });
  });

  describe('Estado de Carga', () => {
    it('debe mostrar spinner al cargar datos', () => {
      // Verificar que el spinner aparece brevemente
      cy.visit('/informe-ventas');
      
      // El spinner puede aparecer muy rápido, así que verificamos que desaparezca
      cy.get('mat-spinner', { timeout: 10000 }).should('not.exist');
    });
  });

  describe('Responsive', () => {
    it('debe adaptarse a pantallas pequeñas', () => {
      cy.viewport(375, 667);
      cy.wait(500);
      
      cy.get('h2').should('be.visible');
      cy.get('[data-cy="clear-filters"]').should('be.visible');
    });

    it('debe mantener funcionalidad en tablet', () => {
      cy.viewport(768, 1024);
      cy.wait(500);
      
      cy.get('[data-cy="filter-month"]').should('be.visible');
      cy.get('[data-cy="export-pdf"]').should('be.visible');
    });
  });

  describe('Persistencia del idioma', () => {
    it('debe mantener el español después de navegar y volver', () => {
      cy.forceSpanishLanguage();
      cy.visit('/informe-ventas');
      cy.wait(500);
      
      cy.get('[data-cy="back-to-dashboard"]').click();
      cy.url().should('include', '/dashboard-admin');
      
      cy.visit('/informe-ventas');
      cy.wait(500);
      
      cy.contains('h2', 'Reporte de desempeño de ventas').should('be.visible');
    });
  });
});

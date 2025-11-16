/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Fuerza el idioma español en la aplicación estableciendo localStorage
       * @example cy.forceSpanishLanguage()
       */
      forceSpanishLanguage(): Chainable<void>;

      /**
       * Navega al dashboard principal de la aplicación
       * @example cy.login()
       */
      login(): Chainable<void>;
    }
  }
}

/**
 * Comando personalizado para forzar el idioma español
 */
Cypress.Commands.add('forceSpanishLanguage', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('language', 'es');
  });
});

/**
 * Comando personalizado para login/acceso al dashboard
 * Por ahora solo navega al dashboard, se puede extender en el futuro con autenticación
 */
Cypress.Commands.add('login', () => {
  cy.visit('/');
  cy.forceSpanishLanguage();
});

export {};

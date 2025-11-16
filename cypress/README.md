# Pruebas E2E con Cypress - MediSupply

Este documento describe la configuración y ejecución de las pruebas end-to-end (E2E) para la aplicación MediSupply.

## 📋 Estrategia de Pruebas E2E

### Decisiones de Diseño

1. **Idioma Único**: Todas las pruebas E2E se ejecutan en **español** para evitar duplicación innecesaria.
2. **Selectores Data-Cy**: Uso de atributos `data-cy` para selectores robustos e independientes del idioma.
3. **Comandos Personalizados**: Comandos reutilizables para operaciones comunes.
4. **Pruebas de i18n**: Una prueba específica valida el cambio de idioma, suficiente para la funcionalidad.

## 🚀 Instalación

Cypress ya está instalado como dependencia de desarrollo. Si necesitas reinstalarlo:

```bash
npm install cypress --save-dev
```

## ▶️ Ejecución de Pruebas

### Modo Interactivo (UI)
Abre la interfaz gráfica de Cypress para ejecutar y depurar pruebas:

```bash
npm run cypress:open
# o
npm run e2e:open
```

### Modo Headless (CI/CD)
Ejecuta todas las pruebas en modo headless (sin interfaz gráfica):

```bash
npm run cypress:run
# o
npm run e2e
```

### Ejecutar pruebas específicas
```bash
npx cypress run --spec "cypress/e2e/productos.cy.ts"
```

## 📁 Estructura de Archivos

```
cypress/
├── e2e/                          # Archivos de pruebas E2E
│   └── productos.cy.ts           # Pruebas del módulo de Productos
├── support/                      # Comandos y configuración de soporte
│   ├── commands.ts               # Comandos personalizados
│   └── e2e.ts                    # Configuración global
├── fixtures/                     # Datos de prueba (JSON)
└── cypress.config.ts             # Configuración principal de Cypress
```

## 🧪 Módulos con Pruebas E2E

### ✅ Productos (`productos.cy.ts`)
Pruebas completas del módulo de Productos:

- **Listado de Productos**
  - Visualización de tabla con columnas correctas
  - Botones de acción (ver, editar, eliminar)
  
- **Búsqueda y Filtros**
  - Búsqueda por texto con debounce
  - Filtros por categoría, subcategoría, cadena de frío
  - Limpiar filtros
  
- **Creación de Producto**
  - Formulario con todos los campos
  - Validaciones (campos obligatorios, formatos, valores)
  - Creación exitosa con datos válidos
  - Cancelación de creación
  
- **Edición de Producto**
  - Abrir formulario de edición
  - Modificar datos existentes
  
- **Eliminación de Producto**
  - Confirmación antes de eliminar
  - Eliminación exitosa
  
- **Paginación**
  - Cambio de página
  - Cambio de elementos por página
  
- **Estados Vacíos**
  - Mensaje cuando no hay resultados
  
- **Responsive Design**
  - Visualización en móviles
  - Visualización en tablets
  
- **Persistencia de Idioma**
  - Idioma español se mantiene en toda la sesión

**Total: ~25 pruebas E2E**

## 🔧 Comandos Personalizados

### `cy.forceSpanishLanguage()`
Fuerza el idioma español en la aplicación estableciendo `localStorage`:

```typescript
cy.forceSpanishLanguage();
```

### `cy.login()`
Navega al dashboard principal con idioma español configurado:

```typescript
cy.login();
```

## 📝 Escribir Nuevas Pruebas

### Template Básico

```typescript
/// <reference types="cypress" />

describe('Nombre del Módulo - Pruebas E2E', () => {
  beforeEach(() => {
    cy.forceSpanishLanguage();
    cy.visit('/ruta-del-modulo');
    cy.wait(500);
  });

  describe('Grupo de Pruebas', () => {
    it('debe hacer algo específico', () => {
      // Arrange: Configurar estado inicial
      cy.get('[data-cy="selector"]').should('be.visible');
      
      // Act: Ejecutar acción
      cy.get('[data-cy="boton"]').click();
      
      // Assert: Verificar resultado
      cy.get('[data-cy="resultado"]').should('contain', 'Éxito');
    });
  });
});
```

### Mejores Prácticas

1. **Usar selectores `data-cy`**: Son estables e independientes de cambios en el DOM
   ```typescript
   cy.get('[data-cy="create-product-button"]').click();
   ```

2. **Evitar selectores CSS frágiles**: No usar clases o IDs que puedan cambiar
   ```typescript
   // ❌ Malo
   cy.get('.btn-primary').click();
   
   // ✅ Bueno
   cy.get('[data-cy="submit-button"]').click();
   ```

3. **Usar `cy.wait()` con moderación**: Solo cuando sea necesario por debounce o animaciones
   ```typescript
   cy.get('[data-cy="search-input"]').type('búsqueda');
   cy.wait(500); // Esperar debounce
   ```

4. **Agrupar pruebas relacionadas**: Usar `describe` para organizar
   ```typescript
   describe('Creación de Producto', () => {
     it('debe validar campos obligatorios', () => { /* ... */ });
     it('debe crear exitosamente', () => { /* ... */ });
   });
   ```

5. **Hacer pruebas independientes**: Cada prueba debe poder ejecutarse sola
   ```typescript
   beforeEach(() => {
     // Configurar estado inicial limpio
   });
   ```

## 🎯 Próximos Módulos a Testear

- [ ] **Proveedores** (`proveedores.cy.ts`)
- [ ] **Vendedores** (`vendedores.cy.ts`)
- [ ] **Metas** (`metas.cy.ts`)
- [ ] **Reportes de Ventas** (`reportes.cy.ts`)
- [ ] **Logística** (`logistica.cy.ts`)
- [ ] **i18n Smoke Test** (`i18n.cy.ts`) - Prueba única de cambio de idioma

## 🐛 Depuración

### Ver videos de ejecuciones fallidas
Los videos se guardan automáticamente en `cypress/videos/` (si está habilitado).

### Ver screenshots de fallos
Los screenshots se guardan en `cypress/screenshots/` cuando una prueba falla.

### Modo interactivo
El mejor método para depurar es usar el modo interactivo:
```bash
npm run cypress:open
```

### Console.log en pruebas
```typescript
cy.get('[data-cy="element"]').then($el => {
  console.log('Elemento encontrado:', $el);
});
```

## 📊 Integración con CI/CD

### GitHub Actions (ejemplo)

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm start &
      - run: npm run e2e
```

## 🔗 Recursos Útiles

- [Documentación de Cypress](https://docs.cypress.io/)
- [Best Practices de Cypress](https://docs.cypress.io/guides/references/best-practices)
- [Cypress Real World App](https://github.com/cypress-io/cypress-realworld-app) - Ejemplo completo

## 📞 Soporte

Para preguntas o problemas con las pruebas E2E, contacta al equipo de desarrollo.

---

**Última actualización**: Diciembre 2024  
**Versión de Cypress**: 13.x

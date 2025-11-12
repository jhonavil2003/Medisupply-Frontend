# 🎨 Guía de Estilos y Convenciones - MediSupply Frontend

## 📋 Índice
1. [Estilos Globales](#estilos-globales)
2. [Tablas](#tablas)
3. [Formularios (Crear/Editar)](#formularios-crear-editar)
4. [Botones de Acción](#botones-de-acción)
5. [Paginador](#paginador)
6. [Búsqueda](#búsqueda)
7. [Estructura de Tests](#estructura-de-tests)

---

## 🌍 Estilos Globales

### ⚠️ IMPORTANTE: No crear estilos locales en componentes

**TODOS los estilos de tablas, formularios y componentes están centralizados en:**
```
src/styles.scss
```

### ❌ NO HACER:
```typescript
@Component({
  selector: 'app-mi-componente',
  templateUrl: './mi-componente.component.html',
  styleUrls: ['./mi-componente.component.css'] // ❌ Evitar estilos locales para tablas
})
```

### ✅ HACER:
```typescript
@Component({
  selector: 'app-mi-componente',
  templateUrl: './mi-componente.component.html',
  // Sin styleUrls - usar clases globales de styles.scss
})
```

---

## 📊 Tablas

### Clases Disponibles

#### 1. **Contenedor de Tabla**
```html
<div class="table-container">
  <table class="modern-table">
    <!-- contenido -->
  </table>
</div>
```

#### 2. **Tabla Material**
```html
<div class="table-container">
  <table mat-table [dataSource]="dataSource" class="modern-table">
    <!-- columnas -->
  </table>
</div>
```

### Características de `.modern-table`:
- ✅ Filas alternadas automáticas (blanco/gris claro)
- ✅ Hover effect en filas
- ✅ Headers con color primario (#1E63A8)
- ✅ Bordes y espaciado optimizado
- ✅ Responsive automático

### Ejemplo Completo:
```html
<div class="table-container">
  <table mat-table [dataSource]="dataSource" class="modern-table">
    <!-- Columnas -->
    <ng-container matColumnDef="id">
      <th mat-header-cell *matHeaderCellDef>ID</th>
      <td mat-cell *matCellDef="let item">{{item.id}}</td>
    </ng-container>

    <!-- Columna de acciones -->
    <ng-container matColumnDef="acciones">
      <th mat-header-cell *matHeaderCellDef>Acciones</th>
      <td mat-cell *matCellDef="let item" class="actions">
        <button class="btn-icon" (click)="ver(item.id)" title="Ver">
          <i class="bi bi-eye"></i>
        </button>
        <button class="btn-icon" (click)="editar(item.id)" title="Editar">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn-icon danger" (click)="eliminar(item)" title="Eliminar">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </ng-container>

    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
  </table>

  <!-- Paginador -->
  <mat-paginator 
    class="unified-paginator"
    [pageSizeOptions]="[5, 10, 25, 100]"
    showFirstLastButtons>
  </mat-paginator>
</div>
```

---

## 📝 Formularios (Crear/Editar)

### Estructura de Dialogs

#### 1. **Abrir Dialog**
```typescript
// En el componente de lista
navigateToCreate(): void {
  const dialogRef = this.dialog.open(MiComponenteCreateComponent, {
    width: '900px',
    maxHeight: '90vh',
    disableClose: false
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.loadItems(); // Recargar lista
    }
  });
}

navigateToEdit(id: number): void {
  const dialogRef = this.dialog.open(MiComponenteEditComponent, {
    width: '900px',
    maxHeight: '90vh',
    disableClose: false,
    data: { itemId: id } // Pasar ID
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.loadItems();
    }
  });
}
```

#### 2. **Componente de Crear**
```typescript
@Component({
  selector: 'app-mi-componente-create',
  template: `
    <h2 mat-dialog-title>Crear Nuevo Item</h2>
    
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        <mat-form-field class="form-field">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" placeholder="Ingrese nombre">
          @if (form.get('nombre')?.touched && form.get('nombre')?.hasError('required')) {
            <mat-error>El nombre es requerido</mat-error>
          }
        </mat-form-field>

        <!-- Más campos... -->
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" 
              (click)="onSubmit()" 
              [disabled]="loading()">
        @if (loading()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          Guardar
        }
      </button>
    </mat-dialog-actions>
  `
})
export class MiComponenteCreateComponent {
  private dialogRef = inject(MatDialogRef<MiComponenteCreateComponent>);
  private fb = inject(FormBuilder);
  private createUseCase = inject(CreateItemUseCase);
  private notify = inject(NotificationService);
  
  loading = signal(false);
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      // más campos...
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const data = this.form.value;

    this.createUseCase.execute(data).subscribe({
      next: () => {
        this.notify.success('Item creado exitosamente');
        this.dialogRef.close(true); // Cerrar y notificar éxito
      },
      error: (err) => {
        this.notify.error('Error al crear el item');
        this.loading.set(false);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false); // Cerrar sin cambios
  }
}
```

#### 3. **Componente de Editar**
```typescript
@Component({
  selector: 'app-mi-componente-edit',
  // Similar template que create
})
export class MiComponenteEditComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<MiComponenteEditComponent>);
  private data = inject<{ itemId: number }>(MAT_DIALOG_DATA); // Recibir data
  private fb = inject(FormBuilder);
  private getByIdUseCase = inject(GetItemByIdUseCase);
  private updateUseCase = inject(UpdateItemUseCase);
  private notify = inject(NotificationService);
  
  loading = signal(false);
  itemId: number;
  form: FormGroup;

  constructor() {
    this.itemId = this.data.itemId; // Obtener ID del dialog data
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      // más campos...
    });
  }

  ngOnInit(): void {
    this.loadItem();
  }

  loadItem(): void {
    this.loading.set(true);
    this.getByIdUseCase.execute(this.itemId).subscribe({
      next: (item) => {
        this.form.patchValue(item);
        this.loading.set(false);
      },
      error: () => {
        this.notify.error('Error al cargar el item');
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const data = { id: this.itemId, ...this.form.value };

    this.updateUseCase.execute(data).subscribe({
      next: () => {
        this.notify.success('Item actualizado exitosamente');
        this.dialogRef.close(true);
      },
      error: () => {
        this.notify.error('Error al actualizar');
        this.loading.set(false);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
```

### Clases de Formularios:
- `.form-container` - Contenedor principal con gap de 16px
- `.form-field` - Para cada mat-form-field (width: 100%)
- `.form-actions` - Contenedor de botones (align: flex-end)

---

## 🎯 Botones de Acción

### Botones de Iconos en Tablas

```html
<!-- Ver/Detalle -->
<button class="btn-icon" (click)="ver(item.id)" title="Ver">
  <i class="bi bi-eye"></i>
</button>

<!-- Editar -->
<button class="btn-icon" (click)="editar(item.id)" title="Editar">
  <i class="bi bi-pencil"></i>
</button>

<!-- Eliminar (con clase danger) -->
<button class="btn-icon danger" (click)="eliminar(item)" title="Eliminar">
  <i class="bi bi-trash"></i>
</button>

<!-- Deshabilitado -->
<button class="btn-icon" [disabled]="true" title="No disponible">
  <i class="bi bi-lock"></i>
</button>
```

### Características de `.btn-icon`:
- ✅ Gris por defecto (#6B7280)
- ✅ Azul en hover (#1E63A8)
- ✅ Clase `.danger` para botones de eliminar (rojo)
- ✅ Estado disabled con opacidad
- ✅ Transiciones suaves
- ✅ Sin background, solo color de ícono

---

## 📄 Paginador

### Clase Unificada: `.unified-paginator`

```html
<mat-paginator 
  class="unified-paginator"
  [pageSizeOptions]="[5, 10, 25, 100]"
  [pageSize]="10"
  showFirstLastButtons>
</mat-paginator>
```

### Características:
- ✅ Diseño consistente en todas las tablas
- ✅ Flechas de navegación más visibles
- ✅ Responsive (se reorganiza en móviles)
- ✅ Borde superior para separar de tabla
- ✅ Colores del sistema (#6B7280 con hover azul)

---

## 🔍 Búsqueda

### Estructura Unificada:

```html
<div class="search-bar">
  <mat-form-field appearance="outline" class="search-field">
    <mat-label>Buscar</mat-label>
    <input matInput 
           [formControl]="searchControl" 
           placeholder="Buscar por nombre, email...">
    <mat-icon matPrefix>search</mat-icon>
    @if (searchControl.value) {
      <button matSuffix 
              mat-icon-button 
              (click)="clearSearch()" 
              title="Limpiar búsqueda">
        <mat-icon>clear</mat-icon>
      </button>
    }
  </mat-form-field>
</div>
```

### En el componente TypeScript:
```typescript
searchControl = new FormControl('');

ngOnInit(): void {
  // Búsqueda con debounce
  this.searchControl.valueChanges
    .pipe(debounceTime(300))
    .subscribe(value => {
      if (value && value.trim()) {
        this.search(value.trim());
      } else {
        this.loadItems();
      }
    });
}

search(criteria: string): void {
  this.loading.set(true);
  this.searchUseCase.execute(criteria).subscribe({
    next: (items) => {
      this.items.set(items);
      this.dataSource.data = items;
      this.loading.set(false);
    },
    error: () => {
      this.notify.error('Error en la búsqueda');
      this.loading.set(false);
    }
  });
}

clearSearch(): void {
  this.searchControl.setValue('');
  this.loadItems();
}
```

---

## 🧪 Estructura de Tests

### Tests para Componentes de Crear

```typescript
describe('MiComponenteCreateComponent', () => {
  let component: MiComponenteCreateComponent;
  let fixture: ComponentFixture<MiComponenteCreateComponent>;
  let mockCreateUseCase: jest.Mocked<CreateItemUseCase>;
  let mockNotificationService: jest.Mocked<NotificationService>;
  let mockDialogRef: jest.Mocked<MatDialogRef<MiComponenteCreateComponent>>;

  beforeEach(async () => {
    mockCreateUseCase = { execute: jest.fn() } as any;
    mockNotificationService = {
      success: jest.fn(),
      error: jest.fn()
    } as any;
    mockDialogRef = { close: jest.fn() } as any;

    await TestBed.configureTestingModule({
      imports: [MiComponenteCreateComponent, NoopAnimationsModule],
      providers: [
        { provide: CreateItemUseCase, useValue: mockCreateUseCase },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MiComponenteCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty values', () => {
      expect(component.form.get('nombre')?.value).toBe('');
    });
  });

  describe('Form Submission', () => {
    it('should not submit if form is invalid', () => {
      component.onSubmit();
      expect(mockCreateUseCase.execute).not.toHaveBeenCalled();
    });

    it('should submit valid form', () => {
      mockCreateUseCase.execute.mockReturnValue(of({} as any));
      component.form.patchValue({ nombre: 'Test' });
      
      component.onSubmit();

      expect(mockCreateUseCase.execute).toHaveBeenCalled();
      expect(mockNotificationService.success).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });
  });

  describe('Navigation', () => {
    it('should close dialog on cancel', () => {
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });
  });
});
```

### Tests para Componentes de Editar

```typescript
describe('MiComponenteEditComponent', () => {
  let component: MiComponenteEditComponent;
  let fixture: ComponentFixture<MiComponenteEditComponent>;
  let mockGetByIdUseCase: jest.Mocked<GetItemByIdUseCase>;
  let mockUpdateUseCase: jest.Mocked<UpdateItemUseCase>;
  let mockNotificationService: jest.Mocked<NotificationService>;
  let mockDialogRef: jest.Mocked<MatDialogRef<MiComponenteEditComponent>>;

  beforeEach(async () => {
    mockGetByIdUseCase = { execute: jest.fn() } as any;
    mockUpdateUseCase = { execute: jest.fn() } as any;
    mockNotificationService = {
      success: jest.fn(),
      error: jest.fn()
    } as any;
    mockDialogRef = { close: jest.fn() } as any;

    await TestBed.configureTestingModule({
      imports: [MiComponenteEditComponent, NoopAnimationsModule],
      providers: [
        { provide: GetItemByIdUseCase, useValue: mockGetByIdUseCase },
        { provide: UpdateItemUseCase, useValue: mockUpdateUseCase },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { itemId: 1 } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MiComponenteEditComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should load item on init', () => {
      const mockItem = { id: 1, nombre: 'Test' };
      mockGetByIdUseCase.execute.mockReturnValue(of(mockItem));

      fixture.detectChanges(); // triggers ngOnInit

      expect(mockGetByIdUseCase.execute).toHaveBeenCalledWith(1);
      expect(component.form.get('nombre')?.value).toBe('Test');
    });
  });
});
```

### Tests para Componentes de Lista

```typescript
describe('MiComponenteListComponent', () => {
  let component: MiComponenteListComponent;
  let fixture: ComponentFixture<MiComponenteListComponent>;
  let mockGetAllUseCase: jest.Mocked<GetAllItemsUseCase>;
  let mockRouter: jest.Mocked<Router>;
  let mockDialog: jest.Mocked<MatDialog>;

  beforeEach(async () => {
    mockGetAllUseCase = { execute: jest.fn() } as any;
    mockRouter = {
      navigate: jest.fn(),
      createUrlTree: jest.fn().mockReturnValue({}),
      serializeUrl: jest.fn().mockReturnValue(''),
      events: new Subject()
    } as any;
    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(false))
      })
    } as any;

    await TestBed.configureTestingModule({
      imports: [MiComponenteListComponent, NoopAnimationsModule],
      providers: [
        { provide: GetAllItemsUseCase, useValue: mockGetAllUseCase },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ActivatedRoute, useValue: { 
          params: of({}), 
          queryParams: of({}), 
          snapshot: { params: {} } 
        }}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MiComponenteListComponent);
    component = fixture.componentInstance;
  });

  describe('navigation', () => {
    it('should open create dialog', () => {
      component.navigateToCreate();
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should open edit dialog with id', () => {
      component.navigateToEdit(1);
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should navigate to detail', () => {
      component.navigateToDetail(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/items', 1]);
    });
  });
});
```

---

## 🎨 Variables CSS Disponibles

```scss
// Colores
--color-primary: #1E63A8        // Azul principal
--color-primary-dark: #1565c0   // Azul hover
--color-primary-darker: #0d47a1 // Azul active
--color-bg: #F7FAFC             // Fondo general
--color-white: #fff             // Blanco
--color-muted: #6B7280          // Gris texto
--color-success: #22c55e        // Verde éxito
--color-warning: #f59e42        // Naranja advertencia
--color-danger: #dc2626         // Rojo peligro
--color-danger-dark: #b91c1c    // Rojo oscuro
--color-border: #cbd5e1         // Gris borde

// Tablas
--color-table-row: #fff         // Fila par
--color-table-row-alt: #f3f6fa  // Fila impar
--color-table-row-hover: #e6eef9 // Hover
--color-table-header: #f3f6fa   // Header

// Otros
--radius: 10px                  // Radio de bordes
--shadow: 0 4px 16px rgba(30,99,168,0.08) // Sombra
--font-base: Inter, Roboto, Arial, sans-serif
```

---

## 📦 Imports Necesarios

### Para Componentes con Formularios:
```typescript
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
```

### Para Componentes con Tablas:
```typescript
import { Component, ViewChild, inject, signal } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime } from 'rxjs/operators';
```

---

## ✅ Checklist para Nuevos Componentes

### Crear (Dialog):
- [ ] Usa `MatDialogRef` para cerrar
- [ ] Retorna `true` al cerrar exitosamente
- [ ] Retorna `false` al cancelar
- [ ] Usa `signal(false)` para loading
- [ ] Valida formulario antes de submit
- [ ] Usa `NotificationService` para mensajes
- [ ] No tiene `styleUrls` local
- [ ] Template usa clases globales (`.form-container`, `.form-field`)

### Editar (Dialog):
- [ ] Recibe ID via `MAT_DIALOG_DATA`
- [ ] Carga datos en `ngOnInit()`
- [ ] Usa `patchValue()` para llenar formulario
- [ ] Incluye ID en el update
- [ ] Mismas validaciones que crear

### Lista:
- [ ] Usa `MatTableDataSource`
- [ ] Tiene `@ViewChild` para paginador y sort
- [ ] Usa clase `.modern-table` en template
- [ ] Usa clase `.unified-paginator` en paginador
- [ ] Implementa búsqueda con `debounceTime(300)`
- [ ] Abre dialogs con `MatDialog.open()`
- [ ] Recarga lista al cerrar dialog con `result === true`
- [ ] Usa `.btn-icon` para botones de acción
- [ ] Mock completo de Router incluye: `navigate`, `createUrlTree`, `serializeUrl`, `events`
- [ ] Mock de MatDialog incluye: `open` que retorna objeto con `afterClosed()`

---

## 🚫 Errores Comunes a Evitar

1. ❌ **Crear estilos locales para tablas** → Usar `.modern-table` global
2. ❌ **No cerrar dialog con valor** → Siempre usar `close(true/false)`
3. ❌ **Olvidar ActivatedRoute en tests** → Agregar mock completo
4. ❌ **No hacer debounce en búsqueda** → Usar `debounceTime(300)`
5. ❌ **Botones sin title** → Siempre agregar `title` para accesibilidad
6. ❌ **No validar formularios** → Usar `form.invalid` y `markAllAsTouched()`
7. ❌ **Olvidar loading state** → Usar `signal(false)` para loading
8. ❌ **No recargar lista después de crear/editar** → Verificar `afterClosed()`

---

## 📞 Contacto y Dudas

Si tienes dudas sobre cómo implementar algo:
1. Revisa los ejemplos en `productos`, `proveedores` o `vendedores`
2. Consulta este documento
3. Pregunta al equipo en el chat

**Última actualización:** Noviembre 2025

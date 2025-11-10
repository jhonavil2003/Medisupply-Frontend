import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./presentation/pages/dashboard-admin/dashboard-admin.component')
      .then(m => m.DashboardAdminComponent)
  },
  { 
    path: 'proveedor-list', 
    loadComponent: () => import('./presentation/pages/proveedores/proveedor-list/proveedor-list.component')
      .then(m => m.ProveedorListComponent)
  },
  { 
    path: 'producto-list', 
    loadComponent: () => import('./presentation/pages/productos/producto-list/producto-list.component')
      .then(m => m.ProductoListComponent)
  },
  { 
    path: 'producto-detail/:id', 
    loadComponent: () => import('./presentation/pages/productos/producto-detail/producto-detail.component')
      .then(m => m.ProductoDetailComponent)
  },
  { 
    path: 'producto-create', 
    loadComponent: () => import('./presentation/pages/productos/producto-create/producto-create.component')
      .then(m => m.ProductoCreateComponent)
  },
  { 
    path: 'producto-edit/:id', 
    loadComponent: () => import('./presentation/pages/productos/producto-edit/producto-edit.component')
      .then(m => m.ProductoEditComponent)
  },
  { 
    path: 'dashboard-admin', 
    loadComponent: () => import('./presentation/pages/dashboard-admin/dashboard-admin.component')
      .then(m => m.DashboardAdminComponent)
  },
  { 
    path: 'vendedores', 
    loadComponent: () => import('./presentation/pages/vendedores/vendedor-list/vendedor-list.component')
      .then(m => m.VendedorListComponent)
  },
  { 
    path: 'vendedores/create', 
    loadComponent: () => import('./presentation/pages/vendedores/vendedor-create/vendedor-create.component')
      .then(m => m.VendedorCreateComponent)
  },
  { 
    path: 'vendedores/:id', 
    loadComponent: () => import('./presentation/pages/vendedores/vendedor-detail/vendedor-detail.component')
      .then(m => m.VendedorDetailComponent)
  },
  { 
    path: 'vendedores/:id/edit', 
    loadComponent: () => import('./presentation/pages/vendedores/vendedor-edit/vendedor-edit.component')
      .then(m => m.VendedorEditComponent)
  },
  { 
    path: 'vendedor-list', 
    redirectTo: 'vendedores',
    pathMatch: 'full'
  },
  { 
    path: 'producto-upload', 
    loadComponent: () => import('./presentation/pages/productos/producto-upload/producto-upload.component')
      .then(m => m.ProductoUploadComponent)
  },
  { 
    path: 'proveedor-upload', 
    loadComponent: () => import('./presentation/pages/proveedores/proveedor-upload/proveedor-upload.component')
      .then(m => m.ProveedorUploadComponent)
  },
  { 
    path: 'producto-localizacion', 
    loadComponent: () => import('./presentation/pages/productos/producto-localizacion/producto-localizacion.component')
      .then(m => m.ProductoLocalizacionComponent)
  },
  { 
    path: 'rutas-entrega', 
    loadComponent: () => import('./presentation/pages/logistica/ruta-entrega-list/ruta-entrega-list.component')
      .then(m => m.RutaEntregaListaComponent)
  },
  { 
    path: 'ordenes', 
    loadComponent: () => import('./presentation/pages/logistica/order-list/order-list.component')
      .then(m => m.OrderListComponent)
  },
  { 
    path: 'ordenes/:id', 
    loadComponent: () => import('./presentation/pages/logistica/order-detail/order-detail.component')
      .then(m => m.OrderDetailComponent)
  },
  { 
    path: 'confirmar-ordenes', 
    loadComponent: () => import('./presentation/pages/logistica/order-confirmation/order-confirmation.component')
      .then(m => m.OrderConfirmationComponent)
  },
  { 
    path: 'generar-rutas', 
    loadComponent: () => import('./presentation/pages/logistica/route-generation/route-generation.component')
      .then(m => m.RouteGenerationComponent)
  },
  { 
    path: 'metas-list', 
    loadComponent: () => import('./presentation/pages/metas/meta-list/meta-list.component')
      .then(m => m.MetaListComponent)
  },
  { 
    path: 'informe-ventas', 
    loadComponent: () => import('./presentation/pages/ventas/informe-ventas/informe-ventas.component')
      .then(m => m.InformeVentasComponent)
  }
];

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
    path: 'dashboard-admin', 
    loadComponent: () => import('./presentation/pages/dashboard-admin/dashboard-admin.component')
      .then(m => m.DashboardAdminComponent)
  },
  { 
    path: 'vendedor-list', 
    loadComponent: () => import('./presentation/pages/vendedores/vendedor-list.component')
      .then(m => m.VendedorListComponent)
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

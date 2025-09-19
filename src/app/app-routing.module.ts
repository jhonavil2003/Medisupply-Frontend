import { InformeVentasComponent } from './ventas/informe-ventas/informe-ventas.component';
import { RutaEntregaListaComponent } from './logistica/ruta-entrega-list/ruta-entrega-list.component';
import { ProductoLocalizacionComponent } from './productos/producto-localizacion/producto-localizacion.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
import { ProveedorListComponent } from './proveedores/proveedor-list/proveedor-list.component';
import { ProductoListComponent } from './productos/producto-list/producto-list.component';
import { VendedorListComponent } from './vendedores/vendedor-list.component';

import { ProductoUploadComponent } from './productos/producto-upload/producto-upload.component';
import { ProveedorUploadComponent } from './proveedores/proveedor-upload/proveedor-upload.component';

import { MetaListComponent } from './metas/meta-list/meta-list.component';

const routes: Routes = [
  { path: '', component: DashboardAdminComponent },
  { path: 'proveedor-list', component: ProveedorListComponent },
  { path: 'producto-list', component: ProductoListComponent },
  { path: 'dashboard-admin', component: DashboardAdminComponent },
  { path: 'vendedor-list', component: VendedorListComponent },
  { path: 'producto-upload', component: ProductoUploadComponent },
  { path: 'proveedor-upload', component: ProveedorUploadComponent },
  { path: 'producto-localizacion', component: ProductoLocalizacionComponent },
  { path: 'rutas-entrega', component: RutaEntregaListaComponent },
  { path: 'metas-list', component: MetaListComponent },
  { path: 'informe-ventas', component: InformeVentasComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

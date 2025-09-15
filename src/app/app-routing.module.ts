import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuPrincipalComponent } from './menu-principal/menu-principal.component';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
import { ProveedoresComponent } from './proveedores/proveedores.component';
import { ProveedorListComponent } from './proveedores/proveedor-list/proveedor-list.component';
import { ProductoListComponent } from './productos/producto-list.component';
import { VendedorListComponent } from './vendedores/vendedor-list.component';

const routes: Routes = [
  { path: '', component: DashboardAdminComponent },
  { path: 'proveedor-list', component: ProveedorListComponent },
  { path: 'producto-list', component: ProductoListComponent },
  { path: 'dashboard-admin', component: DashboardAdminComponent },
  { path: 'vendedor-list', component: VendedorListComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

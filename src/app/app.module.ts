import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { MenuPrincipalComponent } from './menu-principal/menu-principal.component';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
import { ProductosModule } from './productos/productos.module';
import { VendedoresModule } from './vendedores/vendedores.module';

@NgModule({
  declarations: [
    AppComponent,
    MenuPrincipalComponent,
    DashboardAdminComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ProveedoresModule,
    ProductosModule,
    HttpClientModule
    ,VendedoresModule
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

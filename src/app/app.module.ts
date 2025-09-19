import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { MenuPrincipalComponent } from './menu-principal/menu-principal.component';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
import { ProductosModule } from './productos/productos.module';
import { VendedoresModule } from './vendedores/vendedores.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { MaterialModule } from './material.module';
import { MetasModule } from './metas/metas.module';
import { LogisticaModule } from './logistica/logistica.module';
import { VentasModule } from './ventas/ventas.module';

@NgModule({
  declarations: [		
    AppComponent,
    MenuPrincipalComponent,
    DashboardAdminComponent
   ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule, // necesario para las animaciones
    ToastrModule.forRoot({   // configuración global
          positionClass: 'toast-top-right',
          timeOut: 3000,
          preventDuplicates: true,
    }),
    AppRoutingModule,
    ProveedoresModule,
    ProductosModule,
    HttpClientModule,
    VendedoresModule,
    LogisticaModule,
    MetasModule,
    VentasModule,
    // Angular Material Modules
    MaterialModule
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch()),
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

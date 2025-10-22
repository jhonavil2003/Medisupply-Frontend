import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';

import { MenuPrincipalComponent } from './menu-principal/menu-principal.component';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';


import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';






@NgModule({
    imports: [
    BrowserModule,
    BrowserAnimationsModule, // necesario para las animaciones
    ToastrModule.forRoot({
        positionClass: 'toast-top-right',
        timeOut: 3000,
        preventDuplicates: true,
    }),
    AppRoutingModule,
    HttpClientModule,
    AppComponent,
    MenuPrincipalComponent,
    DashboardAdminComponent
],
    providers: [
        provideClientHydration(),
        provideHttpClient(withFetch()),
        provideAnimationsAsync()
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

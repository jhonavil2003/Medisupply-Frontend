import { Component, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-menu-principal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './menu-principal.component.html',
  styleUrls: ['./menu-principal.component.css']
})
export class MenuPrincipalComponent {
  private router = inject(Router);

  sidebarVisible = true;
  gestionOpen = false;
  ventasOpen = false;
  logisticaOpen = false;
  currentRoute = '';

  constructor() {
    // Detectar cambios de ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.urlAfterRedirects || event.url;
        // Abrir automáticamente el submenú correspondiente
        this.openSubmenuForCurrentRoute();
      });
    
    // Establecer ruta inicial
    this.currentRoute = this.router.url;
    this.openSubmenuForCurrentRoute();
  }

  isActive(route: string): boolean {
    if (route === '') {
      return this.currentRoute === '/' || this.currentRoute === '';
    }
    // Comparación exacta o con slash para evitar coincidencias parciales
    // Por ejemplo: 'mis-metas' no debe activar 'metas'
    return this.currentRoute === `/${route}` || 
           this.currentRoute.startsWith(`/${route}/`) ||
           this.currentRoute.startsWith(`/${route}?`);
  }

  openSubmenuForCurrentRoute(): void {
    const route = this.currentRoute;
    
    // Gestión
    if (route.includes('proveedor') || route.includes('producto') || route.includes('vendedor')) {
      this.gestionOpen = true;
    }
    
    // Ventas y Reportes
    if (route.includes('meta') || route.includes('informe-ventas')) {
      this.ventasOpen = true;
    }
    
    // Logística
    if (route.includes('localizacion') || route.includes('rutas-entrega')) {
      this.logisticaOpen = true;
    }
  }

  navigateTo(route: string) {
    console.log('Navigating to route:', route);
    this.router.navigate([`/${route}`]).then(
      (success) => console.log('Navigation success:', success),
      (error) => console.error('Navigation error:', error)
    );
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  toggleSubmenu(menu: string) {
    if (menu === 'gestion') {
      this.gestionOpen = !this.gestionOpen;
    } else if (menu === 'ventas') {
      this.ventasOpen = !this.ventasOpen;
    } else if (menu === 'logistica') {
      this.logisticaOpen = !this.logisticaOpen;
    }
  }
}

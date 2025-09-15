import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-principal',
  templateUrl: './menu-principal.component.html',
  styleUrls: ['./menu-principal.component.css']
})
export class MenuPrincipalComponent {
  sidebarVisible = true;
  gestionOpen = false;
  ventasOpen = false;
  logisticaOpen = false;

  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
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

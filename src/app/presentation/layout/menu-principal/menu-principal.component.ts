import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-principal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-principal.component.html',
  styleUrls: ['./menu-principal.component.css']
})
export class MenuPrincipalComponent {
  private router = inject(Router);

  sidebarVisible = true;
  gestionOpen = false;
  ventasOpen = false;
  logisticaOpen = false;

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

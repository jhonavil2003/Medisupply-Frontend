import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [RouterModule, MatButtonModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class DashboardAdminComponent {
  showLangMenu = false;
  sidebarVisible = true;

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }
  selectedLanguage = 'es';
  languages = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Portugués' }
  ];

  texts: any = {
    es: {
      registro: 'Registro de proveedores y productos',
      registrarNuevo: 'Registrar nuevo',
      gestion: 'Gestión de vendedores y planes de venta',
      agregarVendedor: 'Agregar vendedor',
      reportes: 'Reportes e informes de ventas',
      verReportes: 'Ver reportes',
      inventario: 'Inventario y localización de productos',
      rutas: 'Rutas de entrega',
      usuario: 'Administrador',
      ayuda: 'Ayuda',
      soporte: 'Soporte',
      privacidad: 'Política de privacidad',
      mediSupply: 'MediSupply',
      inicio: 'Inicio',
      gestionMenu: 'Gestión',
      proveedores: 'Proveedores',
      productos: 'Productos',
      vendedores: 'Vendedores',
      ventasReportes: 'Ventas y Reportes',
      planesVenta: 'Planes de venta',
      reportesInformes: 'Reportes',
      logistica: 'Logística',
      inventarioMenu: 'Inventario / Localización de productos',
      rutasMenu: 'Rutas de entrega',
      copyright: '© Universidad de los Andes / MediSupply'
    },
    en: {
      registro: 'Supplier and Product Registration',
      registrarNuevo: 'Register new',
      gestion: 'Salespeople and Sales Plans Management',
      agregarVendedor: 'Add salesperson',
      reportes: 'Sales Reports and Statements',
      verReportes: 'View reports',
      inventario: 'Product Inventory and Location',
      rutas: 'Delivery Routes',
      usuario: 'Administrator',
      ayuda: 'Help',
      soporte: 'Support',
      privacidad: 'Privacy Policy',
      mediSupply: 'MediSupply',
      inicio: 'Home',
      gestionMenu: 'Management',
      proveedores: 'Suppliers',
      productos: 'Products',
      vendedores: 'Salespeople',
      ventasReportes: 'Sales & Reports',
      planesVenta: 'Sales Plans',
      reportesInformes: 'Reports & Statements',
      logistica: 'Logistics',
      inventarioMenu: 'Inventory / Product Location',
      rutasMenu: 'Delivery Routes',
      copyright: '© Universidad de los Andes / MediSupply'
    },
    pt: {
      registro: 'Registro de fornecedores e produtos',
      registrarNuevo: 'Registrar novo',
      gestion: 'Gestão de vendedores e planos de venda',
      agregarVendedor: 'Adicionar vendedor',
      reportes: 'Relatórios e informes de vendas',
      verReportes: 'Ver relatórios',
      inventario: 'Inventário e localização de produtos',
      rutas: 'Rotas de entrega',
      usuario: 'Administrador',
      ayuda: 'Ajuda',
      soporte: 'Suporte',
      privacidad: 'Política de privacidade',
      mediSupply: 'MediSupply',
      inicio: 'Início',
      gestionMenu: 'Gestão',
      proveedores: 'Fornecedores',
      productos: 'Produtos',
      vendedores: 'Vendedores',
      ventasReportes: 'Vendas e Relatórios',
      planesVenta: 'Planos de venda',
      reportesInformes: 'Relatórios e informes',
      logistica: 'Logística',
      inventarioMenu: 'Inventário / Localização de produtos',
      rutasMenu: 'Rotas de entrega',
      copyright: '© Universidad de los Andes / MediSupply'
    }
  };

  get t() {
    return this.texts[this.selectedLanguage];
  }

  onLanguageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    if (select && select.value) {
      this.selectedLanguage = select.value;
    }
  }
}

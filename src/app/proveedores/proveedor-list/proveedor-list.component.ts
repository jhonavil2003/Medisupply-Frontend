import { Component, OnInit } from '@angular/core';
import { ProveedorService } from '../proveedor.service';
import { Proveedor } from '../proveedor';

@Component({
  selector: 'app-proveedor-list',
  templateUrl: './proveedor-list.component.html',
  styleUrls: ['./proveedor-list.component.css']
})
export class ProveedorListComponent implements OnInit {
  proveedores: Proveedor[] = [];
  proveedorEditando: Proveedor | null = null;
  proveedorEditIndex: number | null = null;
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  mostrarDetalle: boolean = false;
  proveedorDetalle: Proveedor | null = null;
  filtroBusqueda: string = '';
  proveedoresFiltrados: Proveedor[] = [];

  constructor(private proveedorService: ProveedorService) {}

  ngOnInit(): void {
    this.proveedorService.getProveedores().subscribe(data => {
      this.proveedores = data;
      this.proveedoresFiltrados = [...data];
    });
  }

  filtrarProveedores() {
      const filtro = this.filtroBusqueda.trim().toLowerCase();
      if (!filtro) {
        this.proveedoresFiltrados = [...this.proveedores];
        return;
      }
      this.proveedoresFiltrados = this.proveedores.filter(p =>
        p.razonSocial.toLowerCase().includes(filtro) ||
        p.ruc.toLowerCase().includes(filtro) ||
        p.telefono.toLowerCase().includes(filtro) ||
        p.correoContacto.toLowerCase().includes(filtro) ||
        (Array.isArray(p.certificacionesVigentes) ? p.certificacionesVigentes.some(cert => cert.toLowerCase().includes(filtro)) : false)
      );
  }

  agregarProveedorAleatorio() {
    const nuevo = this.proveedorService.crearProveedorAleatorio();
    this.proveedorEditando = { ...nuevo };
    this.proveedorEditIndex = null;
    this.mostrarModal = true;
    this.modoEdicion = false;
  }

  editarProveedor(index: number) {
    this.proveedorEditando = { ...this.proveedores[index] };
    this.proveedorEditIndex = index;
    this.mostrarModal = true;
    this.modoEdicion = true;
  }

  guardarEdicionProveedor() {
    if (this.proveedorEditando) {
      if (this.proveedorEditIndex !== null) {
        // Editar existente
        this.proveedores[this.proveedorEditIndex] = { ...this.proveedorEditando };
      } else {
        // Agregar nuevo
        this.proveedorService.addProveedor(this.proveedorEditando);
        this.proveedores = [...this.proveedorService['proveedores']];
      }
      this.mostrarModal = false;
      this.proveedorEditando = null;
      this.proveedorEditIndex = null;
      this.modoEdicion = false;
    }
  }

  cancelarEdicionProveedor() {
    this.mostrarModal = false;
    this.proveedorEditando = null;
    this.proveedorEditIndex = null;
    this.modoEdicion = false;
  }


  eliminarProveedor(index: number) {
    if (confirm('¿Está seguro de eliminar este proveedor?')) {
      this.proveedores.splice(index, 1);
    }
  }
  verProveedor(index: number) {
    this.proveedorDetalle = this.proveedores[index];
    this.mostrarDetalle = true;
  }

  cerrarDetalleProveedor() {
    this.mostrarDetalle = false;
    this.proveedorDetalle = null;
  }
}

import { Component, OnInit } from '@angular/core';
import { VendedorService } from './vendedor.service';
import { Vendedor } from './vendedor';

@Component({
  selector: 'app-vendedor-list',
  templateUrl: './vendedor-list.component.html',
  styleUrls: ['./vendedor-list.component.css']
})
export class VendedorListComponent implements OnInit {
  vendedores: Vendedor[] = [];
  vendedoresFiltrados: Vendedor[] = [];
  filtroBusqueda: string = '';
  vendedorEditando: Vendedor | null = null;
  vendedorEditIndex: number | null = null;
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  mostrarDetalle: boolean = false;
  vendedorDetalle: Vendedor | null = null;

  constructor(private vendedorService: VendedorService) {}

  ngOnInit(): void {
    this.vendedorService.getVendedores().subscribe(data => {
      this.vendedores = data;
      this.vendedoresFiltrados = [...data];
    });
  }

  filtrarVendedores() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    if (!filtro) {
      this.vendedoresFiltrados = [...this.vendedores];
      return;
    }
    this.vendedoresFiltrados = this.vendedores.filter(v =>
      v.documento.toLowerCase().includes(filtro) ||
      v.nombre.toLowerCase().includes(filtro) ||
      v.correo.toLowerCase().includes(filtro) ||
      v.telefono.toLowerCase().includes(filtro) ||
      v.region.toLowerCase().includes(filtro)
    );
  }

  agregarVendedor() {
    this.vendedorEditando = this.vendedorService.crearVendedorAleatorio();
    this.vendedorEditIndex = null;
    this.mostrarModal = true;
    this.modoEdicion = false;
  }

  editarVendedor(index: number) {
    this.vendedorEditando = { ...this.vendedoresFiltrados[index] };
    this.vendedorEditIndex = index;
    this.mostrarModal = true;
    this.modoEdicion = true;
  }

  guardarEdicionVendedor() {
    if (this.vendedorEditando) {
      if (this.vendedorEditIndex !== null) {
        const idxGlobal = this.vendedores.findIndex(v => v.documento === this.vendedoresFiltrados[this.vendedorEditIndex!].documento);
        if (idxGlobal !== -1) {
          this.vendedores[idxGlobal] = { ...this.vendedorEditando };
        }
      } else {
        this.vendedorService.addVendedor(this.vendedorEditando);
        this.vendedores = [...this.vendedorService['vendedores']];
      }
      this.filtrarVendedores();
      this.mostrarModal = false;
      this.vendedorEditando = null;
      this.vendedorEditIndex = null;
      this.modoEdicion = false;
    }
  }

  cancelarEdicionVendedor() {
    this.mostrarModal = false;
    this.vendedorEditando = null;
    this.vendedorEditIndex = null;
    this.modoEdicion = false;
  }

  eliminarVendedor(index: number) {
    if (confirm('¿Está seguro de eliminar este vendedor?')) {
      const documento = this.vendedoresFiltrados[index].documento;
      this.vendedores = this.vendedores.filter(v => v.documento !== documento);
      this.filtrarVendedores();
    }
  }

  verVendedor(index: number) {
    this.vendedorDetalle = this.vendedoresFiltrados[index];
    this.mostrarDetalle = true;
  }

  cerrarDetalleVendedor() {
    this.mostrarDetalle = false;
    this.vendedorDetalle = null;
  }
}

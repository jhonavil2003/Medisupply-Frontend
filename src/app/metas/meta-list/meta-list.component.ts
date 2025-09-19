import { Component, OnInit } from '@angular/core';
import { MetaService } from '../meta.service';
import { MetaVenta } from '../meta';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-meta-list',
  templateUrl: './meta-list.component.html',
  styleUrls: ['./meta-list.component.css']
})
export class MetaListComponent implements OnInit {
  metas: MetaVenta[] = [];
  metasFiltradas: MetaVenta[] = [];
  filtroBusqueda: string = '';
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  metaEditando: MetaVenta | null = null;
  mostrarDetalle: boolean = false;
  metaDetalle: MetaVenta | null = null;

  productos = ['Producto A', 'Producto B', 'Producto C'];
  regiones = ['Norte', 'Sur', 'Este', 'Oeste'];
  trimestres = ['Q1', 'Q2', 'Q3', 'Q4'];

  constructor(private metaService: MetaService, private toastr: ToastrService) {}

  ngOnInit() {
    this.cargarMetas();
  }

  cargarMetas() {
    this.metaService.getMetas().subscribe(metas => {
      this.metas = metas;
      this.filtrarMetas();
    });
  }

  filtrarMetas() {
    const filtro = this.filtroBusqueda.toLowerCase();
    this.metasFiltradas = this.metas.filter(meta =>
      meta.producto.toLowerCase().includes(filtro) ||
      meta.region.toLowerCase().includes(filtro) ||
      meta.trimestre.toLowerCase().includes(filtro) ||
      meta.usuarioResponsable.toLowerCase().includes(filtro)
    );
  }

  agregarMeta() {
    this.modoEdicion = false;
    this.metaEditando = {
      id: Date.now(),
      producto: '',
      region: '',
      trimestre: '',
      valorObjetivo: 1,
      tipo: 'unidades',
      fechaCreacion: new Date(),
      usuarioResponsable: 'gerente',
      editable: true
    };
    this.mostrarModal = true;
  }

  editarMeta(meta: MetaVenta) {
    this.modoEdicion = true;
    this.metaEditando = { ...meta };
    this.mostrarModal = true;
  }

  guardarMeta() {
    if (!this.metaEditando) return;
    if (!this.metaEditando.producto || !this.metaEditando.region || !this.metaEditando.trimestre) {
      this.toastr.error('Todos los campos son obligatorios', 'Error');
      return;
    }
    if (this.modoEdicion) {
      this.metaService.updateMeta(this.metaEditando).subscribe(ok => {
        if (ok) {
          this.toastr.success('Meta actualizada', 'Éxito');
          this.cargarMetas();
        } else {
          this.toastr.error('No se pudo actualizar', 'Error');
        }
      });
    } else {
      this.metaService.addMeta(this.metaEditando).subscribe(ok => {
        if (ok) {
          this.toastr.success('Meta creada', 'Éxito');
          this.cargarMetas();
        } else {
          this.toastr.error('Ya existe una meta para esa combinación', 'Error');
        }
      });
    }
    this.mostrarModal = false;
    this.metaEditando = null;
  }

  eliminarMeta(meta: MetaVenta) {
    if (confirm('¿Seguro que deseas eliminar esta meta?')) {
      this.metaService.deleteMeta(meta.id).subscribe(ok => {
        if (ok) {
          this.toastr.success('Meta eliminada', 'Éxito');
          this.cargarMetas();
        } else {
          this.toastr.error('No se pudo eliminar', 'Error');
        }
      });
    }
  }

  verMeta(meta: MetaVenta) {
    this.metaDetalle = meta;
    this.mostrarDetalle = true;
  }

  cerrarDetalle() {
    this.mostrarDetalle = false;
    this.metaDetalle = null;
  }

  cancelarEdicion() {
    this.mostrarModal = false;
    this.metaEditando = null;
  }
}

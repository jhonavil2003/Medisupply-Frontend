import { Injectable } from '@angular/core';
import { Producto } from './producto';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private productos: Producto[] = [
    {
      codigo: 'P001',
      nombre: 'Guantes de látex',
      categoria: 'Material Médico',
      proveedor: 'Proveedor A',
      estado: 'Disponible'
    },
    {
      codigo: 'P002',
      nombre: 'Mascarilla N95',
      categoria: 'Material Médico',
      proveedor: 'Proveedor B',
      estado: 'No disponible'
    }
  ];

  // Generador de datos aleatorios
  private nombres = ['Guantes de látex', 'Mascarilla N95', 'Bata quirúrgica', 'Termómetro digital', 'Alcohol gel'];
  private categorias = ['Material Médico', 'Protección', 'Instrumental', 'Desinfección'];
  private proveedores = ['Proveedor A', 'Proveedor B', 'Proveedor C', 'Proveedor D'];
  private randomCodigo(): string {
    return 'P' + Math.floor(1000 + Math.random() * 9000);
  }
  private randomNombre(): string {
    return this.nombres[Math.floor(Math.random() * this.nombres.length)];
  }
  private randomCategoria(): string {
    return this.categorias[Math.floor(Math.random() * this.categorias.length)];
  }
  private randomProveedor(): string {
    return this.proveedores[Math.floor(Math.random() * this.proveedores.length)];
  }
  private randomEstado(): 'Disponible' | 'No disponible' {
    return Math.random() > 0.5 ? 'Disponible' : 'No disponible';
  }
  crearProductoAleatorio(): Producto {
    return {
      codigo: this.randomCodigo(),
      nombre: this.randomNombre(),
      categoria: this.randomCategoria(),
      proveedor: this.randomProveedor(),
      estado: this.randomEstado()
    };
  }

  getProductos(): Observable<Producto[]> {
    return of(this.productos);
  }

  addProducto(producto: Producto): void {
    this.productos.push(producto);
  }
}

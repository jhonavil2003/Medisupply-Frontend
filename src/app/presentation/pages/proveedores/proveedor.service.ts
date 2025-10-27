import { Injectable } from '@angular/core';
import { Proveedor } from './proveedor';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProveedorService {

  private proveedores: Proveedor[] = [
    {
      razonSocial: 'Proveedor A',
      ruc: '20440370388',
      telefono: '987654321',
      correoContacto: 'juan@proveedor.com',
      estado: 'Activo',
      certificacionesVigentes: ['ISO 9001', 'BPM']
    },
    {
      razonSocial: 'Proveedor B',
      ruc: '10345678901',
      telefono: '912345678',
      correoContacto: 'maria@proveedor.com',
      estado: 'Inactivo',
      certificacionesVigentes: ['ISO 14001']
    }
  ];

  // Generador de datos aleatorios
  private nombres = ['Proveedor C', 'Proveedor D', 'Proveedor E', 'Proveedor F'];
  private certificaciones = ['ISO 9001', 'BPM', 'ISO 14001', 'ISO 22000', 'HACCP'];

  private randomRUC(): string {
    return Math.floor(10000000000 + Math.random() * 90000000000).toString();
  }
  private randomTelefono(): string {
    return Math.floor(900000000 + Math.random() * 99999999).toString();
  }
  private randomCorreo(nombre: string): string {
    return nombre.toLowerCase().replace(/ /g, '') + '@proveedor.com';
  }
  private randomEstado(): 'Activo' | 'Inactivo' {
    return Math.random() > 0.5 ? 'Activo' : 'Inactivo';
  }
  private randomCertificaciones(): string[] {
    const count = Math.floor(Math.random() * 3) + 1;
    return Array.from({length: count}, () => this.certificaciones[Math.floor(Math.random() * this.certificaciones.length)]);
  }

  crearProveedorAleatorio(): Proveedor {
    const nombre = this.nombres[Math.floor(Math.random() * this.nombres.length)];
    return {
      razonSocial: nombre,
      ruc: this.randomRUC(),
      telefono: this.randomTelefono(),
      correoContacto: this.randomCorreo(nombre),
      estado: this.randomEstado(),
      certificacionesVigentes: this.randomCertificaciones()
    };
  }


  getProveedores(): Observable<Proveedor[]> {
    return of(this.proveedores);
  }


  addProveedor(proveedor: Proveedor): void {
    this.proveedores.push(proveedor);
  }
}

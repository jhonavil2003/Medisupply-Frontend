import { Injectable } from '@angular/core';
import { Vendedor } from './vendedor';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VendedorService {
  private vendedores: Vendedor[] = [
    {
      documento: '12345678',
      nombre: 'Juan',
      correo: 'juan@empresa.com',
      telefono: '987654321',
      region: 'Lima'
    },
    {
      documento: '87654321',
      nombre: 'María',
      correo: 'maria@empresa.com',
      telefono: '912345678',
      region: 'Arequipa'
    }
  ];

  // Generador de datos aleatorios
  private nombres = ['Juan', 'María', 'Pedro', 'Lucía', 'Carlos'];
  private regiones = ['Lima', 'Arequipa', 'Cusco', 'Piura', 'Trujillo'];
  private randomDocumento(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }
  private randomCorreo(nombre: string): string {
    return nombre.toLowerCase() + '@empresa.com';
  }
  private randomTelefono(): string {
    return Math.floor(900000000 + Math.random() * 99999999).toString();
  }
  private randomRegion(): string {
    return this.regiones[Math.floor(Math.random() * this.regiones.length)];
  }
  crearVendedorAleatorio(): Vendedor {
    const nombre = this.nombres[Math.floor(Math.random() * this.nombres.length)];
    return {
      documento: this.randomDocumento(),
      nombre,
      correo: this.randomCorreo(nombre),
      telefono: this.randomTelefono(),
      region: this.randomRegion()
    };
  }

  getVendedores(): Observable<Vendedor[]> {
    return of(this.vendedores);
  }

  addVendedor(vendedor: Vendedor): void {
    this.vendedores.push(vendedor);
  }
}

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ProductoLocalizacion } from './producto-localizacion.model';

@Injectable({ providedIn: 'root' })
export class ProductoLocalizacionService {
  private productos: ProductoLocalizacion[] = [
    {
      codigoInterno: 'P001',
      sku: 'SKU-001',
      nombre: 'Vacuna A',
      codigoBarrasQR: '1234567890123',
      ubicacion: {
        pasillo: 'A',
        estanteria: '1',
        nivel: '2',
        posicion: '4',
        zona: 'refrigerado',
        camara: 'Cámara 1',
        estadoCamara: 'OK'
      },
      cantidad: 12,
      lote: 'L001',
      fechaVencimiento: '2025-10-01',
      temperatura: '2-8°C',
      historialUbicaciones: [
        { fecha: '2025-08-01', ubicacion: 'A-1-2-4', cantidad: 12 }
      ]
    },
    {
      codigoInterno: 'P002',
      sku: 'SKU-002',
      nombre: 'Vacuna B',
      codigoBarrasQR: '9876543210987',
      ubicacion: {
        pasillo: 'B',
        estanteria: '3',
        nivel: '1',
        posicion: '2',
        zona: 'ambiente'
      },
      cantidad: 0,
      lote: 'L002',
      fechaVencimiento: '2026-01-15',
      temperatura: '15-25°C',
      historialUbicaciones: [
        { fecha: '2025-07-15', ubicacion: 'B-3-1-2', cantidad: 0 }
      ]
    }
  ];

  buscarProducto(query: string): Observable<ProductoLocalizacion[]> {
    const q = query.trim().toLowerCase();
    const resultados = this.productos.filter(p =>
      p.codigoInterno.toLowerCase() === q ||
      p.sku.toLowerCase() === q ||
      p.nombre.toLowerCase().includes(q) ||
      p.codigoBarrasQR === q
    );
    return of(resultados);
  }

  // Simula auditoría
  registrarAuditoria(params: { usuario: string; query: string; fecha: string }) {
    // Aquí se podría enviar a backend o guardar en localStorage
    console.log('Auditoría búsqueda:', params);
  }
}
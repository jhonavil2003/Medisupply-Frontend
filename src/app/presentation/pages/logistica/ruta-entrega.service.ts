import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { RutaEntrega } from './ruta-entrega.model';

@Injectable({ providedIn: 'root' })
export class RutaEntregaService {
  private rutasSubject = new BehaviorSubject<RutaEntrega[]>([
    {
      id: 'R-001',
      fecha: '2025-09-18T08:00:00Z',
      estado: 'en_curso',
      vehiculos: ['VAN-12'],
      conductor: 'Carlos Pérez',
      pedidos: [
        { id: 'P-100', destino: 'Clínica San José', detalle: 'Vacunas y jeringas', estado: 'en_ruta' },
        { id: 'P-101', destino: 'Hospital Central', detalle: 'Medicamentos', estado: 'pendiente' }
      ]
    },
    {
      id: 'R-002',
      fecha: '2025-09-17T09:00:00Z',
      estado: 'completada',
      vehiculos: ['CAM-05'],
      conductor: 'Ana Torres',
      pedidos: [
        { id: 'P-102', destino: 'Farmacia Vida', detalle: 'Insumos médicos', estado: 'entregado' }
      ]
    },
    {
      id: 'R-003',
      fecha: '2025-09-18T10:00:00Z',
      estado: 'pendiente',
      vehiculos: ['VAN-15'],
      conductor: 'Luis Gómez',
      pedidos: [
        { id: 'P-103', destino: 'Centro Salud Norte', detalle: 'Medicamentos', estado: 'pendiente' }
      ]
    }
  ]);

  getRutas(): Observable<RutaEntrega[]> {
    return this.rutasSubject.asObservable();
  }

  actualizarRuta(ruta: RutaEntrega) {
    const rutas = this.rutasSubject.value.map(r => r.id === ruta.id ? ruta : r);
    this.rutasSubject.next(rutas);
  }
}
import { Injectable } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';
import { RutaEntregaRepository } from '../../../domain/repositories/ruta-entrega.repository';
import { 
  RutaEntregaEntity, 
  CreateRutaEntregaDto, 
  UpdateRutaEntregaDto,
  EstadoRuta,
  EstadoPedido 
} from '../../../domain/entities/ruta-entrega.entity';

/**
 * Implementación Mock del repositorio de Rutas de Entrega
 */
@Injectable({ providedIn: 'root' })
export class MockRutaEntregaRepository extends RutaEntregaRepository {
  private rutas: RutaEntregaEntity[] = [
    {
      id: 'R-001',
      fecha: '2025-09-18T08:00:00Z',
      estado: EstadoRuta.EN_CURSO,
      vehiculos: ['VAN-12'],
      conductor: 'Carlos Pérez',
      pedidos: [
        { id: 'P-100', destino: 'Clínica San José', detalle: 'Vacunas y jeringas', estado: EstadoPedido.EN_RUTA },
        { id: 'P-101', destino: 'Hospital Central', detalle: 'Medicamentos', estado: EstadoPedido.PENDIENTE }
      ]
    },
    {
      id: 'R-002',
      fecha: '2025-09-17T09:00:00Z',
      estado: EstadoRuta.COMPLETADA,
      vehiculos: ['CAM-05'],
      conductor: 'Ana Torres',
      pedidos: [
        { id: 'P-102', destino: 'Farmacia Vida', detalle: 'Insumos médicos', estado: EstadoPedido.ENTREGADO }
      ]
    },
    {
      id: 'R-003',
      fecha: '2025-09-18T10:00:00Z',
      estado: EstadoRuta.PENDIENTE,
      vehiculos: ['VAN-15'],
      conductor: 'Luis Gómez',
      pedidos: [
        { id: 'P-103', destino: 'Centro Salud Norte', detalle: 'Medicamentos', estado: EstadoPedido.PENDIENTE }
      ]
    }
  ];

  private nextId = 4;

  getAll(): Observable<RutaEntregaEntity[]> {
    return of([...this.rutas]).pipe(delay(300));
  }

  getById(id: string): Observable<RutaEntregaEntity | null> {
    const ruta = this.rutas.find(r => r.id === id);
    return of(ruta || null).pipe(delay(200));
  }

  create(dto: CreateRutaEntregaDto): Observable<RutaEntregaEntity> {
    const newRuta: RutaEntregaEntity = {
      id: `R-${String(this.nextId++).padStart(3, '0')}`,
      ...dto,
      estado: EstadoRuta.PENDIENTE,
      pedidos: dto.pedidos.map((p, index) => ({
        id: `P-${Date.now()}-${index}`,
        ...p,
        estado: EstadoPedido.PENDIENTE
      }))
    };
    
    this.rutas.push(newRuta);
    return of(newRuta).pipe(delay(300));
  }

  update(dto: UpdateRutaEntregaDto): Observable<RutaEntregaEntity> {
    const index = this.rutas.findIndex(r => r.id === dto.id);
    
    if (index === -1) {
      return throwError(() => new Error('Ruta no encontrada'));
    }

    const updated: RutaEntregaEntity = {
      ...this.rutas[index],
      ...dto
    };
    
    this.rutas[index] = updated;
    return of(updated).pipe(delay(300));
  }

  filterByEstado(estado: EstadoRuta): Observable<RutaEntregaEntity[]> {
    const filtered = this.rutas.filter(r => r.estado === estado);
    return of(filtered).pipe(delay(200));
  }

  getByconductor(conductor: string): Observable<RutaEntregaEntity[]> {
    const filtered = this.rutas.filter(r => 
      r.conductor.toLowerCase().includes(conductor.toLowerCase())
    );
    return of(filtered).pipe(delay(200));
  }
}

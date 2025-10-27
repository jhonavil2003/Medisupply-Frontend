import { Injectable } from '@angular/core';
import { MetaVenta } from './meta';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MetaService {
  private metas: MetaVenta[] = [
    {
      id: 1,
      producto: 'Producto A',
      region: 'Norte',
      trimestre: 'Q1',
      valorObjetivo: 1000,
      tipo: 'unidades',
      fechaCreacion: new Date('2025-01-10'),
      usuarioResponsable: 'gerente',
      editable: true
    },
    {
      id: 2,
      producto: 'Producto B',
      region: 'Sur',
      trimestre: 'Q2',
      valorObjetivo: 50000,
      tipo: 'monetario',
      fechaCreacion: new Date('2025-03-15'),
      usuarioResponsable: 'supervisor',
      editable: true
    },
    {
      id: 3,
      producto: 'Producto C',
      region: 'Este',
      trimestre: 'Q3',
      valorObjetivo: 750,
      tipo: 'unidades',
      fechaCreacion: new Date('2025-06-01'),
      usuarioResponsable: 'analista',
      editable: true
    }
  ];

  getMetas(): Observable<MetaVenta[]> {
    return of(this.metas);
  }

  addMeta(meta: MetaVenta): Observable<boolean> {
    // Validar duplicados
    const exists = this.metas.some(m => m.producto === meta.producto && m.region === meta.region && m.trimestre === meta.trimestre);
    if (exists) return of(false);
    this.metas.push(meta);
    return of(true);
  }

  updateMeta(meta: MetaVenta): Observable<boolean> {
    const idx = this.metas.findIndex(m => m.id === meta.id);
    if (idx > -1) {
      this.metas[idx] = meta;
      return of(true);
    }
    return of(false);
  }

  deleteMeta(id: number): Observable<boolean> {
    const idx = this.metas.findIndex(m => m.id === id);
    if (idx > -1) {
      this.metas.splice(idx, 1);
      return of(true);
    }
    return of(false);
  }

  // Simulación de comparación de resultados
  compararResultados(meta: MetaVenta, resultado: number): { meta: number, resultado: number, cumplido: boolean } {
    return {
      meta: meta.valorObjetivo,
      resultado,
      cumplido: resultado >= meta.valorObjetivo
    };
  }
}

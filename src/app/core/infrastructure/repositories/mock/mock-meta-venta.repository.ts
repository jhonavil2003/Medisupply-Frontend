import { Injectable } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';
import { map } from 'rxjs/operators';
import { MetaVentaRepository } from '../../../domain/repositories/meta-venta.repository';
import { 
  MetaVentaEntity, 
  CreateMetaVentaDto, 
  UpdateMetaVentaDto,
  ComparacionMetaResultado,
  TipoMeta,
  Trimestre 
} from '../../../domain/entities/meta-venta.entity';

/**
 * Implementación Mock del repositorio de Metas de Venta
 */
@Injectable({ providedIn: 'root' })
export class MockMetaVentaRepository extends MetaVentaRepository {
  private metas: MetaVentaEntity[] = [
    {
      id: 1,
      producto: 'Producto A',
      region: 'Norte',
      trimestre: Trimestre.Q1,
      valorObjetivo: 1000,
      tipo: TipoMeta.UNIDADES,
      fechaCreacion: new Date('2025-01-10'),
      usuarioResponsable: 'gerente',
      editable: true
    },
    {
      id: 2,
      producto: 'Producto B',
      region: 'Sur',
      trimestre: Trimestre.Q2,
      valorObjetivo: 50000,
      tipo: TipoMeta.MONETARIO,
      fechaCreacion: new Date('2025-03-15'),
      usuarioResponsable: 'supervisor',
      editable: true
    },
    {
      id: 3,
      producto: 'Producto C',
      region: 'Este',
      trimestre: Trimestre.Q3,
      valorObjetivo: 750,
      tipo: TipoMeta.UNIDADES,
      fechaCreacion: new Date('2025-06-01'),
      usuarioResponsable: 'analista',
      editable: true
    }
  ];

  private nextId = 4;

  getAll(): Observable<MetaVentaEntity[]> {
    return of([...this.metas]).pipe(delay(300));
  }

  getById(id: number): Observable<MetaVentaEntity | null> {
    const meta = this.metas.find(m => m.id === id);
    return of(meta || null).pipe(delay(200));
  }

  create(dto: CreateMetaVentaDto): Observable<MetaVentaEntity> {
    // Validar duplicados
    const exists = this.metas.some(m =>
      m.producto === dto.producto &&
      m.region === dto.region &&
      m.trimestre === dto.trimestre
    );

    if (exists) {
      return throwError(() => new Error('Ya existe una meta para esa combinación producto/región/trimestre'));
    }

    const newMeta: MetaVentaEntity = {
      id: this.nextId++,
      ...dto,
      editable: dto.editable ?? true,
      fechaCreacion: new Date()
    };
    
    this.metas.push(newMeta);
    return of(newMeta).pipe(delay(300));
  }

  update(dto: UpdateMetaVentaDto): Observable<MetaVentaEntity> {
    const index = this.metas.findIndex(m => m.id === dto.id);
    
    if (index === -1) {
      return throwError(() => new Error('Meta no encontrada'));
    }

    const updated: MetaVentaEntity = {
      ...this.metas[index],
      ...dto
    };
    
    this.metas[index] = updated;
    return of(updated).pipe(delay(300));
  }

  delete(id: number): Observable<boolean> {
    const index = this.metas.findIndex(m => m.id === id);
    
    if (index === -1) {
      return of(false).pipe(delay(200));
    }

    this.metas.splice(index, 1);
    return of(true).pipe(delay(200));
  }

  filterByProducto(producto: string): Observable<MetaVentaEntity[]> {
    const filtered = this.metas.filter(m => m.producto === producto);
    return of(filtered).pipe(delay(200));
  }

  filterByRegion(region: string): Observable<MetaVentaEntity[]> {
    const filtered = this.metas.filter(m => m.region === region);
    return of(filtered).pipe(delay(200));
  }

  filterByTrimestre(trimestre: string): Observable<MetaVentaEntity[]> {
    const filtered = this.metas.filter(m => m.trimestre === trimestre);
    return of(filtered).pipe(delay(200));
  }

  compararResultados(metaId: number, resultado: number): Observable<ComparacionMetaResultado> {
    return this.getById(metaId).pipe(
      delay(200),
      map(meta => {
        if (!meta) {
          throw new Error('Meta no encontrada');
        }

        const porcentajeCumplimiento = (resultado / meta.valorObjetivo) * 100;

        return {
          meta: meta.valorObjetivo,
          resultado,
          cumplido: resultado >= meta.valorObjetivo,
          porcentajeCumplimiento: Math.round(porcentajeCumplimiento)
        };
      })
    );
  }
}

import { Injectable } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';
import { map } from 'rxjs/operators';
import { MetaVentaRepository, MetaVentaFilters } from '../../../domain/repositories/meta-venta.repository';
import { 
  MetaVentaEntity, 
  CreateMetaVentaDto, 
  UpdateMetaVentaDto,
  TipoMeta,
  Trimestre,
  Region
} from '../../../domain/entities/meta-venta.entity';

/**
 * Implementación Mock del repositorio de Metas de Venta
 * NOTA: Este mock está desactualizado y se usa solo para tests legacy
 */
@Injectable({ providedIn: 'root' })
export class MockMetaVentaRepository extends MetaVentaRepository {
  private metas: MetaVentaEntity[] = [
    {
      id: 1,
      idVendedor: 'VE-01',
      idProducto: 'SKU-001',
      region: Region.NORTE,
      trimestre: Trimestre.Q1,
      valorObjetivo: 1000,
      tipo: TipoMeta.UNIDADES,
      fechaCreacion: '2025-01-10T00:00:00Z'
    },
    {
      id: 2,
      idVendedor: 'VE-02',
      idProducto: 'SKU-002',
      region: Region.SUR,
      trimestre: Trimestre.Q2,
      valorObjetivo: 50000,
      tipo: TipoMeta.MONETARIO,
      fechaCreacion: '2025-03-15T00:00:00Z'
    },
    {
      id: 3,
      idVendedor: 'VE-03',
      idProducto: 'SKU-003',
      region: Region.ESTE,
      trimestre: Trimestre.Q3,
      valorObjetivo: 750,
      tipo: TipoMeta.UNIDADES,
      fechaCreacion: '2025-06-01T00:00:00Z'
    }
  ];

  private nextId = 4;

  getAll(filters?: MetaVentaFilters): Observable<MetaVentaEntity[]> {
    let filtered = [...this.metas];
    
    if (filters?.region) {
      filtered = filtered.filter(m => m.region === filters.region);
    }
    if (filters?.trimestre) {
      filtered = filtered.filter(m => m.trimestre === filters.trimestre);
    }
    if (filters?.tipo) {
      filtered = filtered.filter(m => m.tipo === filters.tipo);
    }
    
    return of(filtered).pipe(delay(300));
  }

  getById(id: number): Observable<MetaVentaEntity | null> {
    const meta = this.metas.find(m => m.id === id);
    return of(meta || null).pipe(delay(200));
  }

  create(dto: CreateMetaVentaDto): Observable<MetaVentaEntity> {
    // Validar duplicados
    const exists = this.metas.some(m =>
      m.idProducto === dto.idProducto &&
      m.region === dto.region &&
      m.trimestre === dto.trimestre &&
      m.idVendedor === dto.idVendedor
    );

    if (exists) {
      return throwError(() => new Error('Ya existe una meta para esa combinación'));
    }

    const newMeta: MetaVentaEntity = {
      id: this.nextId++,
      ...dto,
      fechaCreacion: new Date().toISOString()
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

  getByVendedor(employeeId: string, filters?: MetaVentaFilters): Observable<MetaVentaEntity[]> {
    let filtered = this.metas.filter(m => m.idVendedor === employeeId);
    
    if (filters?.region) {
      filtered = filtered.filter(m => m.region === filters.region);
    }
    if (filters?.trimestre) {
      filtered = filtered.filter(m => m.trimestre === filters.trimestre);
    }
    if (filters?.tipo) {
      filtered = filtered.filter(m => m.tipo === filters.tipo);
    }
    
    return of(filtered).pipe(delay(200));
  }

  getByProducto(productSku: string, filters?: MetaVentaFilters): Observable<MetaVentaEntity[]> {
    let filtered = this.metas.filter(m => m.idProducto === productSku);
    
    if (filters?.region) {
      filtered = filtered.filter(m => m.region === filters.region);
    }
    if (filters?.trimestre) {
      filtered = filtered.filter(m => m.trimestre === filters.trimestre);
    }
    if (filters?.tipo) {
      filtered = filtered.filter(m => m.tipo === filters.tipo);
    }
    
    return of(filtered).pipe(delay(200));
  }

  // Métodos legacy - mantenidos para compatibilidad con tests antiguos
  filterByProducto(producto: string): Observable<MetaVentaEntity[]> {
    return this.getByProducto(producto);
  }

  filterByRegion(region: string): Observable<MetaVentaEntity[]> {
    const filtered = this.metas.filter(m => m.region === region);
    return of(filtered).pipe(delay(200));
  }

  filterByTrimestre(trimestre: string): Observable<MetaVentaEntity[]> {
    const filtered = this.metas.filter(m => m.trimestre === trimestre);
    return of(filtered).pipe(delay(200));
  }
}

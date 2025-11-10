import { Injectable, inject } from '@angular/core';
import { Proveedor } from './proveedor';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { ProveedorRepository } from '../../../core/domain/repositories/proveedor.repository';
import { ProveedorEntity, CreateProveedorDto, EstadoProveedor, UpdateProveedorDto } from '../../../core/domain/entities/proveedor.entity';
import { map, tap, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProveedorService {
  private proveedorRepository = inject(ProveedorRepository);

  private proveedoresSubject = new BehaviorSubject<Proveedor[]>([]);
  proveedores$ = this.proveedoresSubject.asObservable();

  // Local generator data preserved for "crearProveedorAleatorio"
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

  /**
   * Obtiene proveedores desde el repositorio y actualiza el subject local.
   */
  getProveedores(): Observable<Proveedor[]> {
    return this.proveedorRepository.getAll().pipe(
      map((entities: ProveedorEntity[]) => {
        const presentation = entities.map(e => this.mapToPresentation(e));
        this.proveedoresSubject.next(presentation);
        return presentation;
      }),
      catchError(err => throwError(() => err))
    );
  }

  addProveedor(proveedor: Proveedor): Observable<Proveedor> {
    const dto: CreateProveedorDto = {
      razonSocial: proveedor.razonSocial,
      ruc: proveedor.ruc,
      telefono: proveedor.telefono,
      correoContacto: proveedor.correoContacto,
      country: proveedor.country,
      estado: proveedor.estado === 'Activo' ? EstadoProveedor.ACTIVO : EstadoProveedor.INACTIVO,
      certificacionesVigentes: proveedor.certificacionesVigentes || []
    };

    return this.proveedorRepository.create(dto).pipe(
      map(created => this.mapToPresentation(created)),
      tap(presentation => {
        const current = this.proveedoresSubject.value || [];
        this.proveedoresSubject.next([...current, presentation]);
      }),
      catchError(err => throwError(() => err))
    );
  }

  updateProveedor(id: string, proveedor: Proveedor): Observable<Proveedor> {
    const dto: UpdateProveedorDto = {
      id,
      razonSocial: proveedor.razonSocial,
      ruc: proveedor.ruc,
      telefono: proveedor.telefono,
      correoContacto: proveedor.correoContacto,
      country: proveedor.country,
      estado: proveedor.estado === 'Activo' ? EstadoProveedor.ACTIVO : EstadoProveedor.INACTIVO,
      certificacionesVigentes: proveedor.certificacionesVigentes || []
    };

    return this.proveedorRepository.update(dto).pipe(
      map(updated => this.mapToPresentation(updated)),
      tap(presentation => {
        const current = this.proveedoresSubject.value || [];
        const idx = current.findIndex(p => p.id === id);
        if (idx !== -1) {
          current[idx] = presentation;
          this.proveedoresSubject.next([...current]);
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  deleteProveedor(id: string): Observable<boolean> {
    return this.proveedorRepository.delete(id).pipe(
      tap(ok => {
        if (ok) {
          const current = this.proveedoresSubject.value || [];
          this.proveedoresSubject.next(current.filter(p => p.id !== id));
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  private mapToPresentation(e: ProveedorEntity): Proveedor {
    return {
      id: e.id,
      razonSocial: e.razonSocial,
      ruc: e.ruc,
      telefono: e.telefono,
      correoContacto: e.correoContacto,
      country: (e as any).country,
      website: (e as any).website,
      addressLine1: (e as any).addressLine1,
      city: (e as any).city,
      state: (e as any).state,
      paymentTerms: (e as any).paymentTerms,
      creditLimit: (e as any).creditLimit,
      currency: (e as any).currency,
      estado: e.estado === EstadoProveedor.ACTIVO ? 'Activo' : 'Inactivo',
      certificacionesVigentes: e.certificacionesVigentes || []
    };
  }
}

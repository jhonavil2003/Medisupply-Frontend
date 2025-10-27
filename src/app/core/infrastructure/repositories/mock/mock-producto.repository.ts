import { Injectable } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';
import { ProductoRepository } from '../../../domain/repositories/producto.repository';
import { 
  ProductoEntity, 
  CreateProductoDto, 
  UpdateProductoDto,
  EstadoProducto 
} from '../../../domain/entities/producto.entity';

/**
 * Implementación Mock del repositorio de Productos
 */
@Injectable({ providedIn: 'root' })
export class MockProductoRepository extends ProductoRepository {
  private productos: ProductoEntity[] = [
    {
      id: '1',
      codigo: 'P001',
      nombre: 'Guantes de látex',
      categoria: 'Material Médico',
      proveedorId: '1',
      proveedor: 'Proveedor A',
      estado: EstadoProducto.DISPONIBLE,
      precio: 50,
      stock: 100,
      fechaRegistro: new Date('2024-03-01'),
      fechaActualizacion: new Date('2024-03-01')
    },
    {
      id: '2',
      codigo: 'P002',
      nombre: 'Mascarilla N95',
      categoria: 'Material Médico',
      proveedorId: '2',
      proveedor: 'Proveedor B',
      estado: EstadoProducto.NO_DISPONIBLE,
      precio: 20,
      stock: 0,
      fechaRegistro: new Date('2024-03-05'),
      fechaActualizacion: new Date('2024-03-05')
    }
  ];

  private nextId = 3;

  getAll(): Observable<ProductoEntity[]> {
    return of([...this.productos]).pipe(delay(300));
  }

  getById(id: string): Observable<ProductoEntity | null> {
    const producto = this.productos.find(p => p.id === id);
    return of(producto || null).pipe(delay(200));
  }

  search(criteria: string): Observable<ProductoEntity[]> {
    const lowerCriteria = criteria.toLowerCase();
    const filtered = this.productos.filter(p =>
      p.nombre.toLowerCase().includes(lowerCriteria) ||
      p.codigo.toLowerCase().includes(lowerCriteria) ||
      p.categoria.toLowerCase().includes(lowerCriteria)
    );
    return of(filtered).pipe(delay(200));
  }

  create(dto: CreateProductoDto): Observable<ProductoEntity> {
    const newProducto: ProductoEntity = {
      id: String(this.nextId++),
      ...dto,
      fechaRegistro: new Date(),
      fechaActualizacion: new Date()
    };
    
    this.productos.push(newProducto);
    return of(newProducto).pipe(delay(300));
  }

  update(dto: UpdateProductoDto): Observable<ProductoEntity> {
    const index = this.productos.findIndex(p => p.id === dto.id);
    
    if (index === -1) {
      return throwError(() => new Error('Producto no encontrado'));
    }

    const updated: ProductoEntity = {
      ...this.productos[index],
      ...dto,
      fechaActualizacion: new Date()
    };
    
    this.productos[index] = updated;
    return of(updated).pipe(delay(300));
  }

  delete(id: string): Observable<boolean> {
    const index = this.productos.findIndex(p => p.id === id);
    
    if (index === -1) {
      return of(false).pipe(delay(200));
    }

    this.productos.splice(index, 1);
    return of(true).pipe(delay(200));
  }

  filterByCategoria(categoria: string): Observable<ProductoEntity[]> {
    const filtered = this.productos.filter(p => p.categoria === categoria);
    return of(filtered).pipe(delay(200));
  }

  filterByProveedor(proveedorId: string): Observable<ProductoEntity[]> {
    const filtered = this.productos.filter(p => p.proveedorId === proveedorId);
    return of(filtered).pipe(delay(200));
  }
}

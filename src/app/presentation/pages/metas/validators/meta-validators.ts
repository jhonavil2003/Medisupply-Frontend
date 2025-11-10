import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, take, switchMap } from 'rxjs/operators';
import { VendedorRepository } from '../../../../core/domain/repositories/vendedor.repository';
import { ProductoRepository } from '../../../../core/domain/repositories/producto.repository';

/**
 * Validador asíncrono para verificar que el vendedor existe
 */
export function vendedorExistsValidator(vendedorRepository: VendedorRepository): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value || control.value.trim() === '') {
      return of(null);
    }

    const employeeId = control.value.trim();

    return of(employeeId).pipe(
      debounceTime(500), // Esperar 500ms después de que el usuario deje de escribir
      switchMap(id => 
        vendedorRepository.getByEmployeeId(id).pipe(
          map(vendedor => {
            // Si no existe el vendedor, retornar error
            return vendedor ? null : { vendedorNotExists: { value: id } };
          }),
          catchError(() => {
            // Si hay error en la petición, considerar que no existe
            return of({ vendedorNotExists: { value: id } });
          })
        )
      ),
      take(1)
    );
  };
}

/**
 * Validador asíncrono para verificar que el producto existe
 */
export function productoExistsValidator(productoRepository: ProductoRepository): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value || control.value.trim() === '') {
      return of(null);
    }

    const sku = control.value.trim();

    return of(sku).pipe(
      debounceTime(500), // Esperar 500ms después de que el usuario deje de escribir
      switchMap(productSku => 
        productoRepository.getBySku(productSku).pipe(
          map(producto => {
            // Si no existe el producto, retornar error
            return producto ? null : { productoNotExists: { value: productSku } };
          }),
          catchError(() => {
            // Si hay error en la petición, considerar que no existe
            return of({ productoNotExists: { value: productSku } });
          })
        )
      ),
      take(1)
    );
  };
}

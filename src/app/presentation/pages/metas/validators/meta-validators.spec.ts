import { fakeAsync, tick } from '@angular/core/testing';
import { FormControl, ValidationErrors } from '@angular/forms';
import { of, throwError, Observable } from 'rxjs';
import { vendedorExistsValidator, productoExistsValidator } from './meta-validators';
import { VendedorRepository } from '../../../../core/domain/repositories/vendedor.repository';
import { ProductoRepository } from '../../../../core/domain/repositories/producto.repository';
import { VendedorEntity } from '../../../../core/domain/entities/vendedor.entity';
import { ProductoEntity } from '../../../../core/domain/entities/producto.entity';

describe('Meta Validators', () => {
  describe('vendedorExistsValidator', () => {
    let mockVendedorRepository: VendedorRepository;

    beforeEach(() => {
      mockVendedorRepository = {
        getByEmployeeId: jest.fn(),
        getAll: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        getById: jest.fn()
      } as any;
    });

    it('should return null when vendedor exists', fakeAsync(() => {
      const mockVendedor: VendedorEntity = {
        employeeId: 'VE-01',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        phone: '555-1234',
        territory: 'Norte',
        isActive: true
      };

      (mockVendedorRepository.getByEmployeeId as jest.Mock).mockReturnValue(of(mockVendedor));

      const control = new FormControl('VE-01');
      const validator = vendedorExistsValidator(mockVendedorRepository);

      let result: ValidationErrors | null = undefined as any;
      (validator(control) as Observable<ValidationErrors | null>).subscribe(res => {
        result = res;
      });

      tick(500);

      expect(result).toBeNull();
      expect(mockVendedorRepository.getByEmployeeId).toHaveBeenCalledWith('VE-01');
    }));

    it('should return vendedorNotExists error when vendedor does not exist', fakeAsync(() => {
      (mockVendedorRepository.getByEmployeeId as jest.Mock).mockReturnValue(
        throwError(() => new Error('Vendedor no encontrado'))
      );

      const control = new FormControl('VE-99');
      const validator = vendedorExistsValidator(mockVendedorRepository);

      let result: ValidationErrors | null = undefined as any;
      (validator(control) as Observable<ValidationErrors | null>).subscribe(res => {
        result = res;
      });

      tick(500);

      expect(result).toEqual({ vendedorNotExists: { value: 'VE-99' } });
      expect(mockVendedorRepository.getByEmployeeId).toHaveBeenCalledWith('VE-99');
    }));

    it('should return null when control value is empty', fakeAsync(() => {
      const control = new FormControl('');
      const validator = vendedorExistsValidator(mockVendedorRepository);

      let result: ValidationErrors | null = undefined as any;
      (validator(control) as Observable<ValidationErrors | null>).subscribe(res => {
        result = res;
      });

      tick(500);

      expect(result).toBeNull();
      expect(mockVendedorRepository.getByEmployeeId).not.toHaveBeenCalled();
    }));

    it('should return null when control value is null', fakeAsync(() => {
      const control = new FormControl(null);
      const validator = vendedorExistsValidator(mockVendedorRepository);

      let result: ValidationErrors | null = undefined as any;
      (validator(control) as Observable<ValidationErrors | null>).subscribe(res => {
        result = res;
      });

      tick(500);

      expect(result).toBeNull();
      expect(mockVendedorRepository.getByEmployeeId).not.toHaveBeenCalled();
    }));

    it('should handle different error types from repository', fakeAsync(() => {
      (mockVendedorRepository.getByEmployeeId as jest.Mock).mockReturnValue(
        throwError(() => ({ status: 404, message: 'Not found' }))
      );

      const control = new FormControl('VE-ERROR');
      const validator = vendedorExistsValidator(mockVendedorRepository);

      let result: ValidationErrors | null = undefined as any;
      (validator(control) as Observable<ValidationErrors | null>).subscribe(res => {
        result = res;
      });

      tick(500);

      expect(result).toEqual({ vendedorNotExists: { value: 'VE-ERROR' } });
    }));
  });

  describe('productoExistsValidator', () => {
    let mockProductoRepository: ProductoRepository;

    beforeEach(() => {
      mockProductoRepository = {
        getBySku: jest.fn(),
        getAll: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      } as any;
    });

    it('should return null when producto exists', fakeAsync(() => {
      const mockProducto: Partial<ProductoEntity> = {
        sku: 'SKU-001',
        name: 'Producto A',
        description: 'Descripción del producto',
        unit_price: 100.50,
        is_active: true
      };

      (mockProductoRepository.getBySku as jest.Mock).mockReturnValue(of(mockProducto));

      const control = new FormControl('SKU-001');
      const validator = productoExistsValidator(mockProductoRepository);

      let result: ValidationErrors | null = undefined as any;
      (validator(control) as Observable<ValidationErrors | null>).subscribe(res => {
        result = res;
      });

      tick(500);

      expect(result).toBeNull();
      expect(mockProductoRepository.getBySku).toHaveBeenCalledWith('SKU-001');
    }));

    it('should return productoNotExists error when producto does not exist', fakeAsync(() => {
      (mockProductoRepository.getBySku as jest.Mock).mockReturnValue(
        throwError(() => new Error('Producto no encontrado'))
      );

      const control = new FormControl('SKU-999');
      const validator = productoExistsValidator(mockProductoRepository);

      let result: ValidationErrors | null = undefined as any;
      (validator(control) as Observable<ValidationErrors | null>).subscribe(res => {
        result = res;
      });

      tick(500);

      expect(result).toEqual({ productoNotExists: { value: 'SKU-999' } });
      expect(mockProductoRepository.getBySku).toHaveBeenCalledWith('SKU-999');
    }));

    it('should return null when control value is empty', fakeAsync(() => {
      const control = new FormControl('');
      const validator = productoExistsValidator(mockProductoRepository);

      let result: ValidationErrors | null = undefined as any;
      (validator(control) as Observable<ValidationErrors | null>).subscribe(res => {
        result = res;
      });

      tick(500);

      expect(result).toBeNull();
      expect(mockProductoRepository.getBySku).not.toHaveBeenCalled();
    }));

    it('should return null when control value is null', fakeAsync(() => {
      const control = new FormControl(null);
      const validator = productoExistsValidator(mockProductoRepository);

      let result: ValidationErrors | null = undefined as any;
      (validator(control) as Observable<ValidationErrors | null>).subscribe(res => {
        result = res;
      });

      tick(500);

      expect(result).toBeNull();
      expect(mockProductoRepository.getBySku).not.toHaveBeenCalled();
    }));

    it('should handle HTTP error responses', fakeAsync(() => {
      (mockProductoRepository.getBySku as jest.Mock).mockReturnValue(
        throwError(() => ({ status: 500, message: 'Server error' }))
      );

      const control = new FormControl('SKU-ERROR');
      const validator = productoExistsValidator(mockProductoRepository);

      let result: ValidationErrors | null = undefined as any;
      (validator(control) as Observable<ValidationErrors | null>).subscribe(res => {
        result = res;
      });

      tick(500);

      expect(result).toEqual({ productoNotExists: { value: 'SKU-ERROR' } });
    }));

    it('should validate with different SKU formats', fakeAsync(() => {
      const mockProducto: Partial<ProductoEntity> = {
        sku: 'PROD-2024-001',
        name: 'Producto B',
        description: 'Descripción',
        unit_price: 200,
        is_active: true
      };

      (mockProductoRepository.getBySku as jest.Mock).mockReturnValue(of(mockProducto));

      const control = new FormControl('PROD-2024-001');
      const validator = productoExistsValidator(mockProductoRepository);

      let result: ValidationErrors | null = undefined as any;
      (validator(control) as Observable<ValidationErrors | null>).subscribe(res => {
        result = res;
      });

      tick(500);

      expect(result).toBeNull();
      expect(mockProductoRepository.getBySku).toHaveBeenCalledWith('PROD-2024-001');
    }));
  });

  describe('Validator Integration', () => {
    it('should work with FormControl async validators', fakeAsync(() => {
      const mockVendedorRepository = {
        getByEmployeeId: jest.fn(),
        getAll: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        getById: jest.fn()
      } as any;

      const mockVendedor: VendedorEntity = {
        employeeId: 'VE-01',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        phone: '555-1234',
        territory: 'Norte',
        isActive: true
      };

      (mockVendedorRepository.getByEmployeeId as jest.Mock).mockReturnValue(of(mockVendedor));

      const control = new FormControl('VE-01', {
        asyncValidators: [vendedorExistsValidator(mockVendedorRepository)]
      });

      control.updateValueAndValidity();
      tick(500);

      expect(control.valid).toBe(true);
      expect(control.errors).toBeNull();
    }));

    it('should set INVALID status when validation fails', fakeAsync(() => {
      const mockProductoRepository = {
        getBySku: jest.fn(),
        getAll: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      } as any;

      (mockProductoRepository.getBySku as jest.Mock).mockReturnValue(
        throwError(() => new Error('Not found'))
      );

      const control = new FormControl('SKU-INVALID', {
        asyncValidators: [productoExistsValidator(mockProductoRepository)]
      });

      control.updateValueAndValidity();
      tick(500);

      expect(control.invalid).toBe(true);
      expect(control.errors).toEqual({ productoNotExists: { value: 'SKU-INVALID' } });
    }));
  });
});

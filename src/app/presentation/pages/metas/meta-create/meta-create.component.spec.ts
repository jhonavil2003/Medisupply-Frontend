import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MockTranslateService } from '../../../../../testing/translate.mock';
import { MetaCreateComponent } from './meta-create.component';
import { CreateMetaVentaUseCase } from '../../../../core/application/use-cases/meta/meta-venta.use-cases';
import { NotificationService } from '../../../shared/services/notification.service';
import { VendedorRepository } from '../../../../core/domain/repositories/vendedor.repository';
import { ProductoRepository } from '../../../../core/domain/repositories/producto.repository';
import { MetaVentaRepository } from '../../../../core/domain/repositories/meta-venta.repository';
import { Region, Trimestre, TipoMeta } from '../../../../core/domain/entities/meta-venta.entity';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('MetaCreateComponent', () => {
  let component: MetaCreateComponent;
  let fixture: ComponentFixture<MetaCreateComponent>;
  let mockCreateUseCase: any;
  let mockRouter: any;
  let mockNotificationService: any;
  let mockVendedorRepository: any;
  let mockProductoRepository: any;
  let mockMetaVentaRepository: any;
  let mockDialogRef: any;

  beforeEach(async () => {
    mockCreateUseCase = { execute: jest.fn() };
    mockRouter = { navigate: jest.fn() };
    mockNotificationService = { success: jest.fn(), warning: jest.fn(), error: jest.fn() };
    mockVendedorRepository = { getByEmployeeId: jest.fn() };
    mockProductoRepository = { getBySku: jest.fn() };
    mockMetaVentaRepository = { create: jest.fn(), getAll: jest.fn(), getById: jest.fn(), update: jest.fn(), delete: jest.fn() };
    mockDialogRef = { close: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [MetaCreateComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: CreateMetaVentaUseCase, useValue: mockCreateUseCase },
        { provide: Router, useValue: mockRouter },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: VendedorRepository, useValue: mockVendedorRepository },
        { provide: ProductoRepository, useValue: mockProductoRepository },
        { provide: MetaVentaRepository, useValue: mockMetaVentaRepository },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: TranslateService, useClass: MockTranslateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MetaCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.metaForm.get('idVendedor')?.value).toBe('');
    expect(component.metaForm.get('idProducto')?.value).toBe('');
    expect(component.metaForm.get('region')?.value).toBe('');
    expect(component.metaForm.get('trimestre')?.value).toBe('');
    expect(component.metaForm.get('valorObjetivo')?.value).toBe(0);
    expect(component.metaForm.get('tipo')?.value).toBe('');
  });

  it('should have required fields', () => {
    const form = component.metaForm;
    
    expect(form.get('idVendedor')?.hasError('required')).toBe(true);
    expect(form.get('idProducto')?.hasError('required')).toBe(true);
    expect(form.get('region')?.hasError('required')).toBe(true);
    expect(form.get('trimestre')?.hasError('required')).toBe(true);
    // valorObjetivo has value 0 by default, so check for 'min' error instead
    expect(form.get('valorObjetivo')?.hasError('min')).toBe(true);
    expect(form.get('tipo')?.hasError('required')).toBe(true);
  });

  it('should validate valorObjetivo minimum value', () => {
    const valorObjetivoControl = component.metaForm.get('valorObjetivo');
    
    valorObjetivoControl?.setValue(0);
    expect(valorObjetivoControl?.hasError('min')).toBe(true);
    
    valorObjetivoControl?.setValue(-100);
    expect(valorObjetivoControl?.hasError('min')).toBe(true);
    
    valorObjetivoControl?.setValue(1);
    expect(valorObjetivoControl?.hasError('min')).toBe(false);
  });

  it('should not submit invalid form', () => {
    component.onSubmit();
    
    expect(mockCreateUseCase.execute).not.toHaveBeenCalled();
    expect(mockNotificationService.warning).toHaveBeenCalled();
  });

  it('should create meta with valid data', fakeAsync(() => {
    const mockVendedor = { employeeId: 'VE-01', firstName: 'Juan', lastName: 'Pérez', email: 'test@test.com' };
    const mockProducto = { sku: 'SKU-001', name: 'Producto A', unit_price: 100 };
    const mockCreatedMeta = { id: 1, idVendedor: 'VE-01', idProducto: 'SKU-001' };

    mockVendedorRepository.getByEmployeeId.mockReturnValue(of(mockVendedor));
    mockProductoRepository.getBySku.mockReturnValue(of(mockProducto));
    mockCreateUseCase.execute.mockReturnValue(of(mockCreatedMeta));

    component.metaForm.patchValue({
      idVendedor: 'VE-01',
      idProducto: 'SKU-001',
      region: Region.NORTE,
      trimestre: Trimestre.Q1,
      valorObjetivo: 100000,
      tipo: TipoMeta.MONETARIO
    });

    tick(500); // Wait for async validators

    expect(component.metaForm.valid).toBe(true);
    
    component.onSubmit();
    
    expect(mockCreateUseCase.execute).toHaveBeenCalled();
  }));

  it('should handle creation error', fakeAsync(() => {
    const mockVendedor = { employeeId: 'VE-01', firstName: 'Juan', lastName: 'Pérez', email: 'test@test.com' };
    const mockProducto = { sku: 'SKU-001', name: 'Producto A', unit_price: 100 };
    const error = { message: 'Error creating meta', userMessage: 'El vendedor no existe' };

    mockVendedorRepository.getByEmployeeId.mockReturnValue(of(mockVendedor));
    mockProductoRepository.getBySku.mockReturnValue(of(mockProducto));
    mockCreateUseCase.execute.mockReturnValue(throwError(() => error));

    component.metaForm.patchValue({
      idVendedor: 'VE-01',
      idProducto: 'SKU-001',
      region: Region.NORTE,
      trimestre: Trimestre.Q1,
      valorObjetivo: 100000,
      tipo: TipoMeta.MONETARIO
    });

    tick(500);

    component.onSubmit();
    
    tick();
    
    expect(component.loading()).toBe(false);
  }));

  it('should close dialog on cancel', () => {
    component.cancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should have correct enum values', () => {
    expect(component.regiones).toContain(Region.NORTE);
    expect(component.regiones).toContain(Region.SUR);
    expect(component.regiones).toContain(Region.ESTE);
    expect(component.regiones).toContain(Region.OESTE);
    
    expect(component.trimestres).toContain(Trimestre.Q1);
    expect(component.trimestres).toContain(Trimestre.Q2);
    expect(component.trimestres).toContain(Trimestre.Q3);
    expect(component.trimestres).toContain(Trimestre.Q4);
    
    expect(component.tipos).toContain(TipoMeta.UNIDADES);
    expect(component.tipos).toContain(TipoMeta.MONETARIO);
  });
});

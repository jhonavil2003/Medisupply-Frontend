import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProveedorDetailComponent } from './proveedor-detail.component';
import { Proveedor } from '../proveedor';

describe('ProveedorDetailComponent', () => {
  let component: ProveedorDetailComponent;
  let fixture: ComponentFixture<ProveedorDetailComponent>;
  let dialogRefMock: { close: jest.Mock };

  const mockProveedor: Proveedor = {
    id: '1',
    razonSocial: 'Test Proveedor SA',
    ruc: '12345678901',
    telefono: '3001234567',
    correoContacto: 'test@proveedor.com',
    country: 'Colombia',
    website: 'https://testproveedor.com',
    addressLine1: 'Calle 123 #45-67',
    city: 'Bogotá',
    state: 'Cundinamarca',
    paymentTerms: '30 días',
    currency: 'COP',
    estado: 'Activo',
    certificacionesVigentes: ['ISO 9001', 'ISO 14001']
  };

  beforeEach(async () => {
    dialogRefMock = {
      close: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProveedorDetailComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: dialogRefMock
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { proveedor: mockProveedor }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProveedorDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive proveedor data from MAT_DIALOG_DATA', () => {
    expect(component.proveedor).toEqual(mockProveedor);
    expect(component.data.proveedor).toEqual(mockProveedor);
  });

  it('should display proveedor razon social', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Test Proveedor SA');
  });

  it('should display proveedor RUC', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('12345678901');
  });

  it('should display proveedor contact info', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('test@proveedor.com');
    expect(compiled.textContent).toContain('3001234567');
  });

  it('should display proveedor location', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Bogotá');
    expect(compiled.textContent).toContain('Colombia');
  });

  it('should display certifications', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('ISO 9001');
    expect(compiled.textContent).toContain('ISO 14001');
  });

  it('should display card title "Detalle del Proveedor"', () => {
    const compiled = fixture.nativeElement;
    const cardTitle = compiled.querySelector('.card-title');
    expect(cardTitle.textContent).toContain('Detalle del Proveedor');
  });

  it('should close dialog when cerrar is called', () => {
    component.cerrar();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('should have close button in template', () => {
    const compiled = fixture.nativeElement;
    const closeButton = compiled.querySelector('button');
    expect(closeButton).toBeTruthy();
    expect(closeButton.textContent).toContain('Cerrar');
  });

  it('should handle proveedor without certifications', () => {
    const proveedorSinCert: Proveedor = {
      ...mockProveedor,
      certificacionesVigentes: []
    };
    
    component.proveedor = proveedorSinCert;
    fixture.detectChanges();
    
    expect(component.proveedor.certificacionesVigentes).toEqual([]);
  });

  it('should handle proveedor with minimal data', () => {
    const proveedorMinimal: Proveedor = {
      id: '2',
      razonSocial: 'Proveedor Básico',
      ruc: '98765432109',
      telefono: '3009876543',
      correoContacto: 'basico@test.com',
      country: '',
      website: '',
      addressLine1: '',
      city: '',
      state: '',
      paymentTerms: '',
      currency: '',
      estado: 'Activo',
      certificacionesVigentes: []
    };
    
    component.proveedor = proveedorMinimal;
    fixture.detectChanges();
    
    expect(component.proveedor.razonSocial).toBe('Proveedor Básico');
  });

  it('should display estado as ACTIVO', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Activo');
  });
});

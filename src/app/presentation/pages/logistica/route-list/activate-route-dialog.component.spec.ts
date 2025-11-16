import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivateRouteDialogComponent, ActivateRouteDialogData } from './activate-route-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ActivateRouteDialogComponent', () => {
  let component: ActivateRouteDialogComponent;
  let fixture: ComponentFixture<ActivateRouteDialogComponent>;
  let mockDialogRef: jest.Mocked<MatDialogRef<ActivateRouteDialogComponent>>;
  let mockData: ActivateRouteDialogData;

  beforeEach(async () => {
    mockDialogRef = {
      close: jest.fn()
    } as any;

    mockData = {
      routeCode: 'R-001',
      driverName: 'Carlos Pérez',
      vehiclePlate: 'ABC-123',
      totalStops: 5,
      totalOrders: 10
    };

    await TestBed.configureTestingModule({
      imports: [
        ActivateRouteDialogComponent,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivateRouteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display route code', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('R-001');
  });

  it('should display driver name when provided', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Carlos Pérez');
  });

  it('should display vehicle plate when provided', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('ABC-123');
  });

  it('should display total stops', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('5');
  });

  it('should display total orders', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('10');
  });

  it('should not display driver section when driverName is not provided', () => {
    const newData: ActivateRouteDialogData = {
      ...mockData,
      driverName: undefined
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ActivateRouteDialogComponent, BrowserAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: newData }
      ]
    });

    const newFixture = TestBed.createComponent(ActivateRouteDialogComponent);
    newFixture.detectChanges();
    const compiled = newFixture.nativeElement;
    
    expect(compiled.querySelector('.info-item:has(mat-icon[fontIcon="person"])')).toBeFalsy();
  });

  it('should not display vehicle section when vehiclePlate is not provided', () => {
    const newData: ActivateRouteDialogData = {
      ...mockData,
      vehiclePlate: undefined
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ActivateRouteDialogComponent, BrowserAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: newData }
      ]
    });

    const newFixture = TestBed.createComponent(ActivateRouteDialogComponent);
    newFixture.detectChanges();
    const compiled = newFixture.nativeElement;
    
    expect(compiled.querySelector('.info-item:has(mat-icon[fontIcon="local_shipping"])')).toBeFalsy();
  });

  describe('onCancel', () => {
    it('should close dialog with false when cancel is clicked', () => {
      component.onCancel();
      
      expect(mockDialogRef.close).toHaveBeenCalledWith(false);
      expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
    });

    it('should trigger cancel when cancel button is clicked', () => {
      const cancelButton = fixture.nativeElement.querySelector('.cancel-button');
      expect(cancelButton).toBeTruthy();
      
      cancelButton.click();
      
      expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });
  });

  describe('onConfirm', () => {
    it('should close dialog with true when confirm is clicked', () => {
      component.onConfirm();
      
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
      expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
    });

    it('should trigger confirm when confirm button is clicked', () => {
      const confirmButton = fixture.nativeElement.querySelector('.confirm-button');
      expect(confirmButton).toBeTruthy();
      
      confirmButton.click();
      
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });
  });

  describe('Dialog Content', () => {
    it('should display confirmation title', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Confirmar Activación de Ruta');
    });

    it('should display consequences section', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Al activar esta ruta:');
    });

    it('should list activation consequences', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('El conductor podrá iniciar la ruta');
      expect(compiled.textContent).toContain('El vehículo quedará asignado');
      expect(compiled.textContent).toContain('No se podrá volver al estado de borrador');
    });

    it('should display confirmation question', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('¿Está seguro que desea activar esta ruta?');
    });

    it('should have cancel and confirm buttons', () => {
      const cancelButton = fixture.nativeElement.querySelector('.cancel-button');
      const confirmButton = fixture.nativeElement.querySelector('.confirm-button');
      
      expect(cancelButton).toBeTruthy();
      expect(confirmButton).toBeTruthy();
      expect(cancelButton.textContent).toContain('Cancelar');
      expect(confirmButton.textContent).toContain('Activar Ruta');
    });
  });

  describe('Data Injection', () => {
    it('should inject dialog data correctly', () => {
      expect(component['data']).toBeDefined();
      expect(component['data']).toEqual(mockData);
    });

    it('should have access to dialogRef', () => {
      expect(component['dialogRef']).toBeDefined();
      expect(component['dialogRef']).toBe(mockDialogRef);
    });
  });
});

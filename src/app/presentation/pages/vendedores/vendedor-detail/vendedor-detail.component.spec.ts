import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VendedorDetailComponent } from './vendedor-detail.component';
import { VendedorEntity } from '../../../../core/domain/entities/vendedor.entity';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('VendedorDetailComponent', () => {
  let component: VendedorDetailComponent;
  let fixture: ComponentFixture<VendedorDetailComponent>;
  let mockDialogRef: jest.Mocked<MatDialogRef<VendedorDetailComponent>>;

  const mockVendedor: VendedorEntity = {
    id: 1,
    employeeId: 'EMP001',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@test.com',
    phone: '+51987654321',
    territory: 'Lima Norte',
    isActive: true,
    hireDate: '2024-01-15',
    createdAt: '2024-01-10T10:00:00',
    updatedAt: '2024-01-15T15:30:00'
  };

  beforeEach(async () => {
    mockDialogRef = {
      close: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [VendedorDetailComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockVendedor }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VendedorDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive vendedor data from MAT_DIALOG_DATA', () => {
    expect(component.vendedor).toEqual(mockVendedor);
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = component.formatDate('2024-01-15');

      // The exact format depends on locale, but should contain the date elements
      expect(result).toBeTruthy();
      expect(result).not.toBe('-');
    });

    it('should return dash for undefined date', () => {
      const result = component.formatDate(undefined);

      expect(result).toBe('-');
    });

    it('should return dash for empty string', () => {
      const result = component.formatDate('');

      expect(result).toBe('-');
    });
  });

  describe('cerrar', () => {
    it('should close the dialog', () => {
      component.cerrar();

      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });
});

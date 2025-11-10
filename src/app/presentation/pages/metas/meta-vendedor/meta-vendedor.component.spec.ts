import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MetaVendedorComponent } from './meta-vendedor.component';
import { GetMetasByVendedorUseCase } from '../../../../core/application/use-cases/meta/meta-venta.use-cases';
import { Region, Trimestre, TipoMeta, MetaVentaEntity } from '../../../../core/domain/entities/meta-venta.entity';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

describe('MetaVendedorComponent', () => {
  let component: MetaVendedorComponent;
  let fixture: ComponentFixture<MetaVendedorComponent>;
  let mockGetMetasUseCase: any;

  const mockMetas: MetaVentaEntity[] = [
    {
      id: 1,
      idVendedor: 'VE-01',
      idProducto: 'SKU-001',
      region: Region.NORTE,
      trimestre: Trimestre.Q1,
      valorObjetivo: 100000,
      tipo: TipoMeta.MONETARIO
    },
    {
      id: 2,
      idVendedor: 'VE-01',
      idProducto: 'SKU-002',
      region: Region.SUR,
      trimestre: Trimestre.Q2,
      valorObjetivo: 50000,
      tipo: TipoMeta.UNIDADES
    },
    {
      id: 3,
      idVendedor: 'VE-01',
      idProducto: 'SKU-003',
      region: Region.NORTE,
      trimestre: Trimestre.Q1,
      valorObjetivo: 75000,
      tipo: TipoMeta.MONETARIO
    }
  ];

  beforeEach(async () => {
    mockGetMetasUseCase = { execute: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [MetaVendedorComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: GetMetasByVendedorUseCase, useValue: mockGetMetasUseCase }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MetaVendedorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load metas on init', () => {
    mockGetMetasUseCase.execute.mockReturnValue(of(mockMetas));
    
    fixture.detectChanges();
    
    expect(component.metas()).toEqual(mockMetas);
    expect(component.metasFiltradas()).toEqual(mockMetas);
    expect(component.loading()).toBe(false);
  });

  it('should handle loading error', () => {
    const error = new Error('Error loading metas');
    mockGetMetasUseCase.execute.mockReturnValue(throwError(() => error));
    
    fixture.detectChanges();
    
    expect(component.loading()).toBe(false);
    expect(component.metas()).toEqual([]);
  });

  it('should filter by region', () => {
    mockGetMetasUseCase.execute.mockReturnValue(of(mockMetas));
    fixture.detectChanges();
    
    component.regionControl.setValue(Region.NORTE);
    
    const filtered = component.metasFiltradas();
    expect(filtered.length).toBe(2);
    expect(filtered.every(m => m.region === Region.NORTE)).toBe(true);
  });

  it('should filter by trimestre', () => {
    mockGetMetasUseCase.execute.mockReturnValue(of(mockMetas));
    fixture.detectChanges();
    
    component.trimestreControl.setValue(Trimestre.Q1);
    
    const filtered = component.metasFiltradas();
    expect(filtered.length).toBe(2);
    expect(filtered.every(m => m.trimestre === Trimestre.Q1)).toBe(true);
  });

  it('should filter by tipo', () => {
    mockGetMetasUseCase.execute.mockReturnValue(of(mockMetas));
    fixture.detectChanges();
    
    component.tipoControl.setValue(TipoMeta.MONETARIO);
    
    const filtered = component.metasFiltradas();
    expect(filtered.length).toBe(2);
    expect(filtered.every(m => m.tipo === TipoMeta.MONETARIO)).toBe(true);
  });

  it('should filter by multiple criteria', () => {
    mockGetMetasUseCase.execute.mockReturnValue(of(mockMetas));
    fixture.detectChanges();
    
    component.regionControl.setValue(Region.NORTE);
    component.trimestreControl.setValue(Trimestre.Q1);
    component.tipoControl.setValue(TipoMeta.MONETARIO);
    
    const filtered = component.metasFiltradas();
    expect(filtered.length).toBe(2);
    expect(filtered.every(m => 
      m.region === Region.NORTE && 
      m.trimestre === Trimestre.Q1 && 
      m.tipo === TipoMeta.MONETARIO
    )).toBe(true);
  });

  it('should clear all filters', () => {
    mockGetMetasUseCase.execute.mockReturnValue(of(mockMetas));
    fixture.detectChanges();
    
    component.regionControl.setValue(Region.NORTE);
    component.trimestreControl.setValue(Trimestre.Q1);
    component.tipoControl.setValue(TipoMeta.MONETARIO);
    
    component.limpiarFiltros();
    
    expect(component.regionControl.value).toBe('');
    expect(component.trimestreControl.value).toBe('');
    expect(component.tipoControl.value).toBe('');
    expect(component.metasFiltradas()).toEqual(mockMetas);
  });

  it('should return empty array when no matches found', () => {
    mockGetMetasUseCase.execute.mockReturnValue(of(mockMetas));
    fixture.detectChanges();
    
    component.regionControl.setValue(Region.ESTE);
    
    const filtered = component.metasFiltradas();
    expect(filtered.length).toBe(0);
  });

  it('should maintain original metas array when filtering', () => {
    mockGetMetasUseCase.execute.mockReturnValue(of(mockMetas));
    fixture.detectChanges();
    
    const originalLength = component.metas().length;
    
    component.regionControl.setValue(Region.NORTE);
    
    expect(component.metas().length).toBe(originalLength);
    expect(component.metasFiltradas().length).toBeLessThan(originalLength);
  });

  it('should have correct enum arrays', () => {
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

  it('should update filtered metas when filters change', () => {
    mockGetMetasUseCase.execute.mockReturnValue(of(mockMetas));
    fixture.detectChanges();
    
    let filterCount = 0;
    const originalLength = component.metasFiltradas().length;
    
    component.regionControl.setValue(Region.NORTE);
    filterCount = component.metasFiltradas().length;
    expect(filterCount).toBeLessThanOrEqual(originalLength);
    
    component.regionControl.setValue('');
    expect(component.metasFiltradas().length).toBe(originalLength);
  });

  it('should show loading state initially and then load metas', () => {
    mockGetMetasUseCase.execute.mockReturnValue(of(mockMetas));
    
    fixture.detectChanges();
    
    expect(component.loading()).toBe(false);
    expect(component.metas()).toEqual(mockMetas);
  });

  it('should not show errors when metas load successfully', () => {
    mockGetMetasUseCase.execute.mockReturnValue(of(mockMetas));
    
    fixture.detectChanges();
    
    expect(component.loading()).toBe(false);
    expect(component.metas().length).toBe(3);
  });
});

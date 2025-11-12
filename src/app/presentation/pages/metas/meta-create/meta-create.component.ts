import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CreateMetaVentaUseCase } from '../../../../core/application/use-cases/meta/meta-venta.use-cases';
import { CreateMetaVentaDto, Region, Trimestre, TipoMeta } from '../../../../core/domain/entities/meta-venta.entity';
import { NotificationService } from '../../../shared/services/notification.service';
import { VendedorRepository } from '../../../../core/domain/repositories/vendedor.repository';
import { ProductoRepository } from '../../../../core/domain/repositories/producto.repository';
import { vendedorExistsValidator, productoExistsValidator } from '../validators/meta-validators';

@Component({
  selector: 'app-meta-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './meta-create.component.html',
  styleUrls: ['./meta-create.component.css']
})
export class MetaCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private createMetaUseCase = inject(CreateMetaVentaUseCase);
  private notificationService = inject(NotificationService);
  private vendedorRepository = inject(VendedorRepository);
  private productoRepository = inject(ProductoRepository);

  loading = signal(false);
  metaForm!: FormGroup;

  // Enums para los selects
  readonly regiones = [Region.NORTE, Region.SUR, Region.ESTE, Region.OESTE];
  readonly trimestres = [Trimestre.Q1, Trimestre.Q2, Trimestre.Q3, Trimestre.Q4];
  readonly tipos = [TipoMeta.UNIDADES, TipoMeta.MONETARIO];

  ngOnInit(): void {
    this.metaForm = this.fb.group({
      idVendedor: ['', 
        [Validators.required, Validators.minLength(2)],
        [vendedorExistsValidator(this.vendedorRepository)]
      ],
      idProducto: ['', 
        [Validators.required, Validators.minLength(2)],
        [productoExistsValidator(this.productoRepository)]
      ],
      region: ['', Validators.required],
      trimestre: ['', Validators.required],
      valorObjetivo: [0, [Validators.required, Validators.min(1)]],
      tipo: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.metaForm.invalid) {
      this.metaForm.markAllAsTouched();
      this.notificationService.warning('Por favor complete los campos requeridos correctamente');
      return;
    }

    this.loading.set(true);
    const formValue = this.metaForm.value;

    const metaDto: CreateMetaVentaDto = {
      idVendedor: formValue.idVendedor.trim(),
      idProducto: formValue.idProducto.trim(),
      region: formValue.region,
      trimestre: formValue.trimestre,
      valorObjetivo: Number(formValue.valorObjetivo),
      tipo: formValue.tipo
    };

    console.log('📝 MetaDTO a crear:', metaDto);

    this.createMetaUseCase.execute(metaDto).subscribe({
      next: (meta) => {
        this.loading.set(false);
        this.notificationService.success('Meta creada exitosamente');
        this.router.navigate(['/metas']);
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error al crear meta:', error);
        
        // Si el error tiene un mensaje personalizado del repositorio
        if (error.userMessage) {
          this.notificationService.error(error.userMessage);
        }
        // Error de validación del use case
        else if (error.message && !error.status) {
          this.notificationService.error(error.message);
        }
        // Error HTTP 400 (duplicado o validación backend)
        else if (error.status === 400) {
          const errorMsg = error.error?.error || error.error?.message || 'Datos inválidos. Verifique que el vendedor y producto existan';
          this.notificationService.error(errorMsg);
        } 
        // Error HTTP 404 (vendedor o producto no encontrado)
        else if (error.status === 404) {
          const errorMsg = error.error?.error || error.error?.message || 'Vendedor o producto no encontrado';
          this.notificationService.error(errorMsg);
        }
        // Otros errores HTTP
        else if (error.status) {
          this.notificationService.error(`Error del servidor: ${error.statusText || 'Error desconocido'}`);
        }
        // Error genérico
        else {
          this.notificationService.error('Error al crear meta. Verifique los datos ingresados');
        }
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/metas']);
  }

  getErrorMessage(field: string): string {
    const control = this.metaForm.get(field);
    
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('min')) {
      return `El valor debe ser mayor a ${control.errors?.['min'].min}`;
    }
    if (control?.hasError('vendedorNotExists')) {
      return 'El vendedor no existe en el sistema';
    }
    if (control?.hasError('productoNotExists')) {
      return 'El producto no existe en el sistema';
    }
    
    return '';
  }

  getTipoDisplay(tipo: TipoMeta): string {
    return tipo === TipoMeta.UNIDADES ? 'Unidades' : 'Monetario';
  }
}

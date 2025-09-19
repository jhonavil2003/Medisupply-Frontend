import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InformeVentasComponent } from './informe-ventas/informe-ventas.component';
import { MaterialModule } from '../material.module';

@NgModule({
  declarations: [InformeVentasComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports: [InformeVentasComponent]
})
export class VentasModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProveedoresComponent } from './proveedores.component';
import { ProveedorListComponent } from './proveedor-list/proveedor-list.component';

@NgModule({
  declarations: [ProveedoresComponent, ProveedorListComponent],
  imports: [CommonModule, FormsModule, RouterModule],
  exports: [ProveedoresComponent]
})
export class ProveedoresModule {}

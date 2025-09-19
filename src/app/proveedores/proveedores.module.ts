import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ProveedoresComponent } from './proveedores.component';
import { ProveedorListComponent } from './proveedor-list/proveedor-list.component';
import { ProveedorUploadComponent } from './proveedor-upload/proveedor-upload.component';
import { MaterialModule } from '../material.module';

@NgModule({
  declarations: [ProveedoresComponent, ProveedorListComponent, ProveedorUploadComponent],
  imports: [CommonModule, FormsModule, RouterModule, MaterialModule],
  exports: [ProveedoresComponent]
})
export class ProveedoresModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductoListComponent } from './producto-list/producto-list.component';
import { ProductoUploadComponent } from './producto-upload/producto-upload.component';
import { ProductoLocalizacionComponent } from './producto-localizacion/producto-localizacion.component';
import { ToastrModule } from 'ngx-toastr';
import { MaterialModule } from '../material.module';

@NgModule({
  declarations: [ProductoListComponent, ProductoUploadComponent, ProductoLocalizacionComponent],
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    ToastrModule, 
    MaterialModule
  ],
  exports: [ProductoListComponent]
})
export class ProductosModule {}

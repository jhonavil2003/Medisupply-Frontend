import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VendedorListComponent } from './vendedor-list.component';
import { ToastrModule } from 'ngx-toastr';
import { MaterialModule } from '../material.module';


@NgModule({
  declarations: [VendedorListComponent],
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    ToastrModule,MaterialModule
  ],
  
  exports: [VendedorListComponent]
})
export class VendedoresModule {}

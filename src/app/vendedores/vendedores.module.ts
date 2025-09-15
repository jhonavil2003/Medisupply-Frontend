import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VendedorListComponent } from './vendedor-list.component';

@NgModule({
  declarations: [VendedorListComponent],
  imports: [CommonModule, FormsModule, RouterModule],
  exports: [VendedorListComponent]
})
export class VendedoresModule {}

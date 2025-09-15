import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductoListComponent } from './producto-list.component';

@NgModule({
  declarations: [ProductoListComponent],
  imports: [CommonModule, FormsModule, RouterModule],
  exports: [ProductoListComponent]
})
export class ProductosModule {}

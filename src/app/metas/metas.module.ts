import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MetaListComponent } from './meta-list/meta-list.component';
import { MetaVendedorComponent } from './meta-vendedor/meta-vendedor.component';
import { MaterialModule } from '../material.module';

@NgModule({
  declarations: [
    MetaListComponent,
    MetaVendedorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule, 
    MaterialModule
  ],
  exports: [MetaListComponent, MetaVendedorComponent]
})
export class MetasModule { }

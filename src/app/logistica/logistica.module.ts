import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { RutaEntregaListaComponent } from './ruta-entrega-list/ruta-entrega-list.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [RutaEntregaListaComponent],
  imports: [CommonModule, FormsModule, MaterialModule, RouterModule],
  exports: [RutaEntregaListaComponent]
})
export class LogisticaModule {}

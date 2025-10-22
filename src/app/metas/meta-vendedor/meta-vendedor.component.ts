import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MetaVenta } from '../meta';

@Component({
  selector: 'app-meta-vendedor',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule
  ],
  templateUrl: './meta-vendedor.component.html',
  styleUrls: ['./meta-vendedor.component.css']
})
export class MetaVendedorComponent {
  @Input() metas: MetaVenta[] = [];
}

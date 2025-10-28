import { Component, input } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MetaVenta } from '../meta';

@Component({
  selector: 'app-meta-vendedor',
  standalone: true,
  imports: [
    MatCardModule,
    MatProgressBarModule
],
  templateUrl: './meta-vendedor.component.html',
  styleUrls: ['./meta-vendedor.component.css']
})
export class MetaVendedorComponent {
  metas = input<MetaVenta[]>([]);
}

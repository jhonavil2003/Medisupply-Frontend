import { Component, Input } from '@angular/core';
import { MetaVenta } from '../meta';

@Component({
  selector: 'app-meta-vendedor',
  templateUrl: './meta-vendedor.component.html',
  styleUrls: ['./meta-vendedor.component.css']
})
export class MetaVendedorComponent {
  @Input() metas: MetaVenta[] = [];
}

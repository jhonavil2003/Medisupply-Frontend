import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProveedorService } from './proveedor.service';
import { Proveedor } from './proveedor';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css']
})
export class ProveedoresComponent implements OnInit {
  private proveedorService = inject(ProveedorService);

  proveedores: Proveedor[] = [];

  ngOnInit(): void {
    this.proveedorService.getProveedores().subscribe(data => this.proveedores = data);
  }
}

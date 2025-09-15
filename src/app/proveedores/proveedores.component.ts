import { Component, OnInit } from '@angular/core';
import { ProveedorService } from './proveedor.service';
import { Proveedor } from './proveedor';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css']
})
export class ProveedoresComponent implements OnInit {
  proveedores: Proveedor[] = [];

  constructor(private proveedorService: ProveedorService) {}

  ngOnInit(): void {
    this.proveedorService.getProveedores().subscribe(data => this.proveedores = data);
  }
}

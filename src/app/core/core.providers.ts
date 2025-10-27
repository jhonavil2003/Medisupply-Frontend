import { Provider } from '@angular/core';

import { ProveedorRepository } from './domain/repositories/proveedor.repository';
import { ProductoRepository } from './domain/repositories/producto.repository';
import { VendedorRepository } from './domain/repositories/vendedor.repository';
import { MetaVentaRepository } from './domain/repositories/meta-venta.repository';
import { RutaEntregaRepository } from './domain/repositories/ruta-entrega.repository';

import { MockProveedorRepository } from './infrastructure/repositories/mock/mock-proveedor.repository';
import { HttpProductoRepository } from './infrastructure/repositories/http/http-producto.repository';
import { MockVendedorRepository } from './infrastructure/repositories/mock/mock-vendedor.repository';
import { MockMetaVentaRepository } from './infrastructure/repositories/mock/mock-meta-venta.repository';
import { MockRutaEntregaRepository } from './infrastructure/repositories/mock/mock-ruta-entrega.repository';

export const CORE_PROVIDERS: Provider[] = [
  { provide: ProveedorRepository, useClass: MockProveedorRepository },
  { provide: ProductoRepository, useClass: HttpProductoRepository },
  { provide: VendedorRepository, useClass: MockVendedorRepository },
  { provide: MetaVentaRepository, useClass: MockMetaVentaRepository },
  { provide: RutaEntregaRepository, useClass: MockRutaEntregaRepository }
];

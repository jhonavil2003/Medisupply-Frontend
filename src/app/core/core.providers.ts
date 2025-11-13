import { Provider } from '@angular/core';

import { ProveedorRepository } from './domain/repositories/proveedor.repository';
import { ProductoRepository } from './domain/repositories/producto.repository';
import { VendedorRepository } from './domain/repositories/vendedor.repository';
import { MetaVentaRepository } from './domain/repositories/meta-venta.repository';
import { RutaEntregaRepository } from './domain/repositories/ruta-entrega.repository';
import { ProductLocationRepository } from './domain/repositories/product-location.repository';
import { OrderRepository } from './domain/repositories/order.repository';
import { RouteViewRepository } from './domain/repositories/route-view.repository';

import { MockProveedorRepository } from './infrastructure/repositories/mock/mock-proveedor.repository';
import { HttpProductoRepository } from './infrastructure/repositories/http/http-producto.repository';
import { HttpVendedorRepository } from './infrastructure/repositories/http/http-vendedor.repository';
import { MockMetaVentaRepository } from './infrastructure/repositories/mock/mock-meta-venta.repository';
import { MockRutaEntregaRepository } from './infrastructure/repositories/mock/mock-ruta-entrega.repository';
import { HttpProductLocationRepository } from './infrastructure/repositories/http/http-product-location.repository';
import { HttpOrderRepository } from './infrastructure/repositories/http/http-order.repository';
import { RouteViewHttpRepository } from './infrastructure/repositories/route-view-http.repository';

export const CORE_PROVIDERS: Provider[] = [
  { provide: ProveedorRepository, useClass: MockProveedorRepository },
  { provide: ProductoRepository, useClass: HttpProductoRepository },
  { provide: VendedorRepository, useClass: HttpVendedorRepository },
  { provide: MetaVentaRepository, useClass: MockMetaVentaRepository },
  { provide: RutaEntregaRepository, useClass: MockRutaEntregaRepository },
  { provide: ProductLocationRepository, useClass: HttpProductLocationRepository },
  { provide: OrderRepository, useClass: HttpOrderRepository },
  { provide: RouteViewRepository, useClass: RouteViewHttpRepository }
];

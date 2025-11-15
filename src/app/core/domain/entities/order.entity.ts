/**
 * Entidad Customer (Cliente)
 */
export interface CustomerEntity {
  id: number;
  businessName: string;
  documentType: string;
  documentNumber: string;
  customerType: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  department?: string;
  neighborhood?: string;
}

/**
 * Entidad OrderItem (Item de la orden)
 */
export interface OrderItemEntity {
  id: number;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  taxPercentage: number;
  distributionCenterCode: string;
  stockConfirmed: boolean;
  stockConfirmationDate?: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

/**
 * Tipos de estado de orden
 */
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'in_transit' | 'delivered' | 'cancelled';

/**
 * Entidad Order (Orden)
 */
export interface OrderEntity {
  id: number;
  orderNumber: string;
  customerId: number;
  sellerId: string;
  sellerName?: string;
  status: OrderStatus;
  paymentMethod?: string;
  paymentTerms?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryDepartment?: string;
  deliveryDate?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  preferredDistributionCenter?: string;
  notes?: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  orderDate: string;
  createdAt: string;
  updatedAt?: string;
  customer: CustomerEntity;
  items?: OrderItemEntity[];
}

/**
 * Respuesta de paginación de órdenes
 */
export interface OrdersListResponse {
  orders: OrderEntity[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/**
 * Filtros para obtener órdenes
 */
export interface GetOrdersFilters {
  customerId?: number;
  sellerId?: string;
  status?: OrderStatus;
  orderDateFrom?: string;
  orderDateTo?: string;
  deliveryDateFrom?: string;
  deliveryDateTo?: string;
  page?: number;
  perPage?: number;
  includeDetails?: boolean;
}

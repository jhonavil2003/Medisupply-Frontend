import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { OrderRepository } from '../../../domain/repositories/order.repository';
import { 
  OrderEntity, 
  OrdersListResponse, 
  GetOrdersFilters,
  CustomerEntity,
  OrderItemEntity
} from '../../../domain/entities/order.entity';
import { environment } from '../../../../../environments/environment.development';

/**
 * Formato de respuesta del backend para Customer
 */
interface BackendCustomer {
  id: number;
  business_name: string;
  document_type: string;
  document_number: string;
  customer_type: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  department?: string;
  neighborhood?: string;
}

/**
 * Formato de respuesta del backend para OrderItem
 */
interface BackendOrderItem {
  id: number;
  product_sku: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  tax_percentage: number;
  distribution_center_code: string;
  stock_confirmed: boolean;
  stock_confirmation_date?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
}

/**
 * Formato de respuesta del backend para Order
 */
interface BackendOrder {
  id: number;
  order_number: string;
  customer_id: number;
  seller_id: string;
  seller_name?: string;
  status: string;
  payment_method?: string;
  payment_terms?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_department?: string;
  delivery_date?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  preferred_distribution_center?: string;
  notes?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  order_date: string;
  created_at: string;
  updated_at?: string;
  customer: BackendCustomer;
  items?: BackendOrderItem[];
}

/**
 * Formato de respuesta del backend para lista paginada
 */
interface BackendOrdersListResponse {
  orders: BackendOrder[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

@Injectable({
  providedIn: 'root'
})
export class HttpOrderRepository extends OrderRepository {
  private http = inject(HttpClient);
  private apiUrl = `${environment.salesApiUrl}/orders`;

  /**
   * Convierte un Customer del backend a la entidad del dominio
   */
  private mapCustomerToDomain(backend: BackendCustomer): CustomerEntity {
    return {
      id: backend.id,
      businessName: backend.business_name,
      documentType: backend.document_type,
      documentNumber: backend.document_number,
      customerType: backend.customer_type,
      phone: backend.phone,
      email: backend.email,
      address: backend.address,
      city: backend.city,
      department: backend.department,
      neighborhood: backend.neighborhood
    };
  }

  /**
   * Convierte un OrderItem del backend a la entidad del dominio
   */
  private mapOrderItemToDomain(backend: BackendOrderItem): OrderItemEntity {
    return {
      id: backend.id,
      productSku: backend.product_sku,
      productName: backend.product_name,
      quantity: backend.quantity,
      unitPrice: backend.unit_price,
      discountPercentage: backend.discount_percentage,
      taxPercentage: backend.tax_percentage,
      distributionCenterCode: backend.distribution_center_code,
      stockConfirmed: backend.stock_confirmed,
      stockConfirmationDate: backend.stock_confirmation_date,
      subtotal: backend.subtotal,
      discountAmount: backend.discount_amount,
      taxAmount: backend.tax_amount,
      total: backend.total
    };
  }

  /**
   * Convierte una Order del backend a la entidad del dominio
   */
  private mapOrderToDomain(backend: BackendOrder): OrderEntity {
    return {
      id: backend.id,
      orderNumber: backend.order_number,
      customerId: backend.customer_id,
      sellerId: backend.seller_id,
      sellerName: backend.seller_name,
      status: backend.status as any,
      paymentMethod: backend.payment_method,
      paymentTerms: backend.payment_terms,
      deliveryAddress: backend.delivery_address,
      deliveryCity: backend.delivery_city,
      deliveryDepartment: backend.delivery_department,
      deliveryDate: backend.delivery_date,
      deliveryLatitude: backend.delivery_latitude,
      deliveryLongitude: backend.delivery_longitude,
      preferredDistributionCenter: backend.preferred_distribution_center,
      notes: backend.notes,
      subtotal: backend.subtotal,
      discountAmount: backend.discount_amount,
      taxAmount: backend.tax_amount,
      totalAmount: backend.total_amount,
      orderDate: backend.order_date,
      createdAt: backend.created_at,
      updatedAt: backend.updated_at,
      customer: this.mapCustomerToDomain(backend.customer),
      items: backend.items?.map(item => this.mapOrderItemToDomain(item))
    };
  }

  /**
   * Construye los parámetros HTTP para los filtros
   */
  private buildHttpParams(filters?: GetOrdersFilters): HttpParams {
    let params = new HttpParams();

    if (!filters) return params;

    if (filters.customerId !== undefined) {
      params = params.set('customer_id', filters.customerId.toString());
    }
    if (filters.sellerId) {
      params = params.set('seller_id', filters.sellerId);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.orderDateFrom) {
      params = params.set('order_date_from', filters.orderDateFrom);
    }
    if (filters.orderDateTo) {
      params = params.set('order_date_to', filters.orderDateTo);
    }
    if (filters.deliveryDateFrom) {
      params = params.set('delivery_date_from', filters.deliveryDateFrom);
    }
    if (filters.deliveryDateTo) {
      params = params.set('delivery_date_to', filters.deliveryDateTo);
    }
    if (filters.page !== undefined) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.perPage !== undefined) {
      params = params.set('per_page', filters.perPage.toString());
    }
    if (filters.includeDetails !== undefined) {
      params = params.set('include_details', filters.includeDetails.toString());
    }

    return params;
  }

  /**
   * Obtiene la lista de órdenes con filtros y paginación
   */
  override getOrders(filters?: GetOrdersFilters): Observable<OrdersListResponse> {
    const params = this.buildHttpParams(filters);

    return this.http.get<BackendOrdersListResponse>(this.apiUrl, { params }).pipe(
      map(response => ({
        orders: response.orders.map(order => this.mapOrderToDomain(order)),
        total: response.total,
        page: response.page,
        perPage: response.per_page,
        totalPages: response.total_pages
      })),
      catchError(error => {
        console.error('Error fetching orders:', error);
        throw error;
      })
    );
  }

  /**
   * Obtiene una orden específica por ID
   */
  override getById(id: number): Observable<OrderEntity | null> {
    return this.http.get<BackendOrder>(`${this.apiUrl}/${id}`).pipe(
      map(order => this.mapOrderToDomain(order)),
      catchError(error => {
        console.error(`Error fetching order ${id}:`, error);
        throw error;
      })
    );
  }

  /**
   * Obtiene órdenes de un vendedor específico
   */
  override getOrdersBySeller(
    sellerId: string, 
    page: number = 1, 
    perPage: number = 20
  ): Observable<OrdersListResponse> {
    return this.getOrders({ sellerId, page, perPage });
  }

  /**
   * Obtiene órdenes de un cliente específico
   */
  override getOrdersByCustomer(
    customerId: number, 
    page: number = 1, 
    perPage: number = 20
  ): Observable<OrdersListResponse> {
    return this.getOrders({ customerId, page, perPage });
  }

  /**
   * Obtiene órdenes por estado
   */
  override getOrdersByStatus(
    status: string, 
    page: number = 1, 
    perPage: number = 20
  ): Observable<OrdersListResponse> {
    return this.getOrders({ status: status as any, page, perPage });
  }

  /**
   * Actualiza el estado de una orden
   */
  override updateOrderStatus(orderId: number, newStatus: string): Observable<OrderEntity> {
    return this.http.patch<BackendOrder>(
      `${this.apiUrl}/${orderId}`,
      { status: newStatus }
    ).pipe(
      map(order => this.mapOrderToDomain(order)),
      catchError(error => {
        console.error(`Error updating order ${orderId} status:`, error);
        throw error;
      })
    );
  }

  /**
   * Actualiza el estado de múltiples órdenes
   */
  override updateMultipleOrdersStatus(
    orderIds: number[], 
    newStatus: string
  ): Observable<{ success: boolean; updatedCount: number }> {
    return this.http.patch<{ success: boolean; updated_count: number }>(
      `${this.apiUrl}/bulk-update`,
      { 
        order_ids: orderIds,
        status: newStatus 
      }
    ).pipe(
      map(response => ({
        success: response.success,
        updatedCount: response.updated_count
      })),
      catchError(error => {
        console.error('Error updating multiple orders status:', error);
        throw error;
      })
    );
  }
}

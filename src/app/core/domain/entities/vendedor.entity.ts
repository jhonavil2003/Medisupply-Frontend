/**
 * Entidad de dominio: Vendedor
 * Representa un vendedor en el sistema
 */
export interface VendedorEntity {
  readonly id?: number;
  readonly employeeId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone?: string;
  readonly territory?: string;
  readonly hireDate?: string; // formato: YYYY-MM-DD
  readonly isActive?: boolean;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

/**
 * Objeto de valor para la creación de un vendedor
 */
export interface CreateVendedorDto {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  territory?: string;
  hireDate?: string; // formato: YYYY-MM-DD
  isActive?: boolean;
}

/**
 * Objeto de valor para la actualización de un vendedor
 */
export interface UpdateVendedorDto {
  id: number;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  territory?: string;
  hireDate?: string; // formato: YYYY-MM-DD
  isActive?: boolean;
}

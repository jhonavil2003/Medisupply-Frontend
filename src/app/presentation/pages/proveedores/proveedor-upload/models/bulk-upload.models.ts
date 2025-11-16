/**
 * Modelos para el sistema de carga masiva de proveedores
 */

/**
 * Respuesta al subir un archivo CSV
 */
export interface BulkUploadResponse {
  job_id: string;
  filename: string;
  total_rows: number;
  message: string;
  warnings?: string[];
}

/**
 * Progreso del procesamiento
 */
export interface BulkUploadProgress {
  total_rows: number;
  processed_rows: number;
  successful_rows: number;
  failed_rows: number;
  percentage: number;
}

/**
 * Timestamps del job
 */
export interface BulkUploadTimestamps {
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

/**
 * Estados posibles de un job de carga masiva
 */
export type BulkUploadStatus = 'pending' | 'validating' | 'processing' | 'completed' | 'failed' | 'cancelled';

/**
 * Alias para compatibilidad con componentes
 */
export type JobStatus = BulkUploadStatus;

/**
 * Job de carga masiva
 */
export interface BulkUploadJob {
  job_id: string;
  filename: string;
  status: BulkUploadStatus;
  file_size_bytes: number;
  progress: BulkUploadProgress;
  timestamps: BulkUploadTimestamps;
  error_message: string | null;
  errors?: BulkUploadRowError[];
  created_at: string; // Para la tabla del historial
  total_rows: number; // Para la tabla del historial
  successful_rows: number; // Para la tabla del historial
  failed_rows: number; // Para la tabla del historial
  success_rate: number; // Para la tabla del historial
}

/**
 * Error en una fila específica del CSV
 */
export interface BulkUploadRowError {
  row_number: number;
  error_message: string;
  tax_id?: string;
  name?: string;
}

/**
 * Respuesta del historial de cargas
 */
export interface BulkUploadHistoryResponse {
  jobs: BulkUploadJob[];
  total: number; // Total de jobs (para el paginador)
  pagination: {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}

/**
 * Estadísticas de cargas masivas
 */
export interface BulkUploadStats {
  total_jobs: number;
  completed: number; // Jobs completados
  in_progress: number; // Jobs en progreso
  failed: number; // Jobs fallidos
  jobs_by_status: {
    completed: number;
    failed: number;
    processing: number;
    pending: number;
    cancelled?: number;
  };
  total_suppliers_created: number;
  total_rows_failed: number;
  average_success_rate: number; // Tasa de éxito promedio
}

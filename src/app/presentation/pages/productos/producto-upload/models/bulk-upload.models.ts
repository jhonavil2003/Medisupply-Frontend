/**
 * Interfaces para la API de carga masiva de productos
 */

export type JobStatus = 
  | 'pending' 
  | 'validating' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export interface BulkUploadJob {
  id?: number;
  job_id: string;
  filename: string;
  status: JobStatus;
  total_rows: number;
  processed_rows: number;
  successful_rows: number;
  failed_rows: number;
  progress_percentage: number;
  success_rate: number;
  created_by?: string;
  file_size_bytes?: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  processing_time_seconds?: number;
  estimated_time_remaining?: number;
  error_message?: string;
  error_count?: number;
}

export interface BulkUploadResponse {
  job_id: string;
  status: JobStatus;
  filename: string;
  total_rows: number;
  message: string;
}

export interface BulkUploadHistoryResponse {
  jobs: BulkUploadJob[];
  total: number;
  limit: number;
  offset: number;
}

export interface BulkUploadStats {
  total_jobs: number;
  completed: number;
  failed: number;
  in_progress: number;
  cancelled: number;
  total_products_imported: number;
  average_success_rate: number;
}

export interface UploadError {
  row_number: number;
  error_message: string;
  sku?: string;
  name?: string;
  [key: string]: any;
}

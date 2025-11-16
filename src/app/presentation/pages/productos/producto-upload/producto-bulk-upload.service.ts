import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  BulkUploadJob,
  BulkUploadResponse,
  BulkUploadHistoryResponse,
  BulkUploadStats
} from './models/bulk-upload.models';

@Injectable({
  providedIn: 'root'
})
export class ProductoBulkUploadService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.catalogApiUrl}/api/products/bulk-upload`;

  /**
   * Descarga la plantilla CSV con las columnas requeridas
   */
  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${this.API_URL}/template`, {
      responseType: 'blob'
    });
  }

  /**
   * Sube un archivo CSV para procesamiento masivo
   * @param file Archivo CSV a subir
   * @param createdBy Email del usuario que crea el job (opcional)
   */
  uploadCSV(file: File, createdBy?: string): Observable<BulkUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (createdBy) {
      formData.append('created_by', createdBy);
    }

    return this.http.post<BulkUploadResponse>(this.API_URL, formData);
  }

  /**
   * Consulta el estado actual de un job
   * @param jobId ID del job a consultar
   * @param includeErrors Si se deben incluir los errores detallados
   */
  getJobStatus(jobId: string, includeErrors: boolean = false): Observable<BulkUploadJob> {
    let params = new HttpParams();
    if (includeErrors) {
      params = params.set('include_errors', 'true');
    }

    return this.http.get<BulkUploadJob>(`${this.API_URL}/${jobId}`, { params });
  }

  /**
   * Descarga el archivo CSV con las filas que fallaron
   * @param jobId ID del job
   */
  downloadErrors(jobId: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${jobId}/errors`, {
      responseType: 'blob'
    });
  }

  /**
   * Cancela un job que está pendiente o en validación
   * @param jobId ID del job a cancelar
   */
  cancelJob(jobId: string): Observable<{ message: string; job: BulkUploadJob }> {
    return this.http.post<{ message: string; job: BulkUploadJob }>(
      `${this.API_URL}/${jobId}/cancel`,
      {}
    );
  }

  /**
   * Obtiene el historial de cargas masivas con filtros y paginación
   * @param filters Filtros opcionales (status, created_by, limit, offset)
   */
  getHistory(filters?: {
    status?: string;
    created_by?: string;
    limit?: number;
    offset?: number;
  }): Observable<BulkUploadHistoryResponse> {
    let params = new HttpParams();

    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.created_by) {
      params = params.set('created_by', filters.created_by);
    }
    if (filters?.limit) {
      params = params.set('limit', filters.limit.toString());
    }
    if (filters?.offset) {
      params = params.set('offset', filters.offset.toString());
    }

    return this.http.get<BulkUploadHistoryResponse>(`${this.API_URL}/history`, { params });
  }

  /**
   * Obtiene estadísticas generales de todas las cargas masivas
   */
  getStats(): Observable<BulkUploadStats> {
    return this.http.get<BulkUploadStats>(`${this.API_URL}/stats`);
  }

  /**
   * Helper para descargar un blob como archivo
   * @param blob Blob a descargar
   * @param filename Nombre del archivo
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

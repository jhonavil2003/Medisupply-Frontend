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
export class ProveedorBulkUploadService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.catalogApiUrl}/api/suppliers/bulk-upload`;

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
   */
  uploadCSV(file: File): Observable<BulkUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<BulkUploadResponse>(this.API_URL, formData);
  }

  /**
   * Consulta el estado actual de un job
   * @param jobId ID del job a consultar
   */
  getJobStatus(jobId: string): Observable<BulkUploadJob> {
    return this.http.get<BulkUploadJob>(`${this.API_URL}/jobs/${jobId}`);
  }

  /**
   * Descarga el archivo CSV con las filas que fallaron
   * @param jobId ID del job
   */
  downloadErrors(jobId: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/jobs/${jobId}/errors`, {
      responseType: 'blob'
    });
  }

  /**
   * Cancela un job que está pendiente o en procesamiento
   * @param jobId ID del job a cancelar
   */
  cancelJob(jobId: string): Observable<{ message: string; job_id: string; status: string }> {
    return this.http.post<{ message: string; job_id: string; status: string }>(
      `${this.API_URL}/jobs/${jobId}/cancel`,
      {}
    );
  }

  /**
   * Obtiene el historial de cargas masivas con filtros y paginación
   * @param filters Filtros opcionales (page, per_page, status)
   */
  getHistory(filters?: {
    page?: number;
    per_page?: number;
    status?: string;
  }): Observable<BulkUploadHistoryResponse> {
    let params = new HttpParams();

    if (filters?.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters?.per_page) {
      params = params.set('per_page', filters.per_page.toString());
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    return this.http.get<BulkUploadHistoryResponse>(`${this.API_URL}/jobs`, { params });
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

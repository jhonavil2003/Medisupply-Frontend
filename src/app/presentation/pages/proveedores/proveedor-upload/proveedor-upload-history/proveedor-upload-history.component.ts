import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProveedorBulkUploadService } from '../proveedor-bulk-upload.service';
import { BulkUploadJob, BulkUploadStats, JobStatus } from '../models/bulk-upload.models';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-proveedor-upload-history',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './proveedor-upload-history.component.html',
  styleUrls: ['./proveedor-upload-history.component.css']
})
export class ProveedorUploadHistoryComponent implements OnInit {
  private uploadService = inject(ProveedorBulkUploadService);
  private notify = inject(NotificationService);
  private translateService = inject(TranslateService);

  // Señales
  jobs = signal<BulkUploadJob[]>([]);
  stats = signal<BulkUploadStats | null>(null);
  loading = signal(false);
  totalJobs = signal(0);
  
  // Filtros y paginación
  selectedStatus = signal<string>('all');
  pageSize = signal(10);
  pageIndex = signal(0);

  // Columnas de la tabla
  displayedColumns: string[] = [
    'filename',
    'status',
    'created_at',
    'total_rows',
    'successful_rows',
    'failed_rows',
    'success_rate',
    'actions'
  ];

  // Opciones para el filtro de estado
  statusOptions = [
    { value: 'all', label: this.translateService.instant('BULK_UPLOAD_PROVIDERS.HISTORY.TABLE.ALL_STATUSES') },
    { value: 'pending', label: this.translateService.instant('BULK_UPLOAD_PROVIDERS.STATUS.PENDING') },
    { value: 'completed', label: this.translateService.instant('BULK_UPLOAD_PROVIDERS.STATUS.COMPLETED') },
    { value: 'processing', label: this.translateService.instant('BULK_UPLOAD_PROVIDERS.STATUS.PROCESSING') },
    { value: 'failed', label: this.translateService.instant('BULK_UPLOAD_PROVIDERS.STATUS.FAILED') },
    { value: 'cancelled', label: this.translateService.instant('BULK_UPLOAD_PROVIDERS.STATUS.CANCELLED') }
  ];

  ngOnInit(): void {
    this.loadHistory();
    this.loadStats();
  }

  /**
   * Carga el historial de cargas
   */
  loadHistory(): void {
    this.loading.set(true);

    const filters: any = {
      limit: this.pageSize(),
      offset: this.pageIndex() * this.pageSize()
    };

    if (this.selectedStatus() !== 'all') {
      filters.status = this.selectedStatus();
    }

    this.uploadService.getHistory(filters).subscribe({
      next: (response) => {
        this.jobs.set(response.jobs);
        this.totalJobs.set(response.total);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
        this.notify.error(
          this.translateService.instant('BULK_UPLOAD_PROVIDERS.HISTORY.TABLE.LOADING_ERROR')
        );
        this.loading.set(false);
      }
    });
  }

  /**
   * Carga las estadísticas generales
   */
  loadStats(): void {
    this.uploadService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  /**
   * Maneja el cambio de filtro de estado
   */
  onStatusFilterChange(status: string): void {
    this.selectedStatus.set(status);
    this.pageIndex.set(0); // Resetear a primera página
    this.loadHistory();
  }

  /**
   * Maneja el cambio de página
   */
  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
    this.loadHistory();
  }

  /**
   * Descarga el archivo de errores de un job
   */
  downloadErrors(job: BulkUploadJob): void {
    this.uploadService.downloadErrors(job.job_id).subscribe({
      next: (blob) => {
        // Crear y descargar el archivo
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `errores_${job.job_id}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.notify.success(
          this.translateService.instant('BULK_UPLOAD_PROVIDERS.MESSAGES.ERRORS_FILE_DOWNLOADED')
        );
      },
      error: (error) => {
        console.error('Error al descargar errores:', error);
        if (error.status === 404) {
          this.notify.info(
            this.translateService.instant('BULK_UPLOAD_PROVIDERS.MESSAGES.NO_ERRORS_TO_DOWNLOAD')
          );
        } else {
          this.notify.error(
            this.translateService.instant('BULK_UPLOAD_PROVIDERS.MESSAGES.ERRORS_DOWNLOAD_ERROR')
          );
        }
      }
    });
  }

  /**
   * Refresca el historial
   */
  refresh(): void {
    this.loadHistory();
    this.loadStats();
    this.notify.success(
      this.translateService.instant('BULK_UPLOAD_PROVIDERS.HISTORY.REFRESH')
    );
  }

  /**
   * Obtiene el color del chip según el estado
   */
  getStatusColor(status: JobStatus): string {
    const colors: Record<JobStatus, string> = {
      'pending': 'status-pending',
      'validating': 'status-validating',
      'processing': 'status-processing',
      'completed': 'status-completed',
      'failed': 'status-failed',
      'cancelled': 'status-cancelled'
    };
    return colors[status] || '';
  }

  /**
   * Obtiene el icono según el estado
   */
  getStatusIcon(status: JobStatus): string {
    const icons: Record<JobStatus, string> = {
      'pending': 'schedule',
      'validating': 'search',
      'processing': 'sync',
      'completed': 'check_circle',
      'failed': 'error',
      'cancelled': 'cancel'
    };
    return icons[status] || 'help';
  }

  /**
   * Obtiene el texto internacionalizado del estado
   */
  getStatusText(status: JobStatus): string {
    const statusKey = `BULK_UPLOAD_PROVIDERS.STATUS.${status.toUpperCase()}`;
    return this.translateService.instant(statusKey);
  }
}

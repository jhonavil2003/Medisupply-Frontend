import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../../shared/services/notification.service';
import { ProductoBulkUploadService } from './producto-bulk-upload.service';
import { BulkUploadJob, JobStatus } from './models/bulk-upload.models';

@Component({
  selector: 'app-producto-upload',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
    TranslateModule
  ],
  templateUrl: './producto-upload.component.html',
  styleUrls: ['./producto-upload.component.css']
})
export class ProductoUploadComponent implements OnDestroy {
  private notify = inject(NotificationService);
  private uploadService = inject(ProductoBulkUploadService);
  private translate = inject(TranslateService);

  // Señales para manejo de estado
  archivoSeleccionado = signal<File | null>(null);
  archivoValido = signal(false);
  cargando = signal(false);
  jobActual = signal<BulkUploadJob | null>(null);
  
  private pollingInterval: any = null;

  /**
   * Descarga la plantilla CSV
   */
  descargarPlantilla(): void {
    this.uploadService.downloadTemplate().subscribe({
      next: (blob) => {
        this.uploadService.downloadBlob(blob, 'plantilla_productos.csv');
        this.notify.success(this.translate.instant('BULK_UPLOAD.MESSAGES.TEMPLATE_DOWNLOADED'));
      },
      error: (error) => {
        console.error('Error al descargar plantilla:', error);
        this.notify.error(this.translate.instant('BULK_UPLOAD.MESSAGES.TEMPLATE_DOWNLOAD_ERROR'));
      }
    });
  }

  /**
   * Evento cuando el usuario selecciona archivo desde el input
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.validarYSeleccionarArchivo(input.files[0]);
    }
  }

  /**
   * Valida y selecciona el archivo
   */
  private validarYSeleccionarArchivo(file: File): void {
    // Validar extensión
    if (!file.name.endsWith('.csv')) {
      this.notify.warning(this.translate.instant('BULK_UPLOAD.MESSAGES.ONLY_CSV_FILES'), this.translate.instant('COMMON.ERROR'));
      return;
    }

    // Validar tamaño (20 MB según la API)
    const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
    if (file.size > MAX_SIZE) {
      this.notify.warning(this.translate.instant('BULK_UPLOAD.MESSAGES.FILE_SIZE_LIMIT'), this.translate.instant('COMMON.ERROR'));
      return;
    }

    this.archivoSeleccionado.set(file);
    this.archivoValido.set(true);
  }

  /**
   * Procesa el archivo subiéndolo al backend
   */
  procesarArchivo(): void {
    const archivo = this.archivoSeleccionado();
    
    if (!archivo || !this.archivoValido()) {
      this.notify.warning(this.translate.instant('BULK_UPLOAD.MESSAGES.SELECT_VALID_FILE'), this.translate.instant('COMMON.ERROR'));
      return;
    }

    this.cargando.set(true);
    this.notify.info(this.translate.instant('BULK_UPLOAD.MESSAGES.UPLOADING_FILE'), archivo.name);

    this.uploadService.uploadCSV(archivo).subscribe({
      next: (response) => {
        this.notify.success(response.message);
        this.iniciarPolling(response.job_id);
      },
      error: (error) => {
        console.error('Error al subir archivo:', error);
        this.cargando.set(false);
        
        const mensaje = error.error?.error || this.translate.instant('BULK_UPLOAD.MESSAGES.UPLOAD_ERROR');
        this.notify.error(mensaje);
      }
    });
  }

  /**
   * Inicia el polling para monitorear el progreso del job
   */
  private iniciarPolling(jobId: string): void {
    this.detenerPolling();

    this.pollingInterval = setInterval(() => {
      this.uploadService.getJobStatus(jobId).subscribe({
        next: (job) => {
          this.jobActual.set(job);

          // Si el job terminó, detener polling
          if (['completed', 'failed', 'cancelled'].includes(job.status)) {
            this.detenerPolling();
            this.cargando.set(false);
            this.mostrarResultadoFinal(job);
          }
        },
        error: (error) => {
          console.error('Error al consultar estado del job:', error);
          this.detenerPolling();
          this.cargando.set(false);
          this.notify.error(this.translate.instant('BULK_UPLOAD.MESSAGES.STATUS_CHECK_ERROR'));
        }
      });
    }, 3000); // Polling cada 3 segundos
  }

  /**
   * Detiene el polling
   */
  private detenerPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Muestra el resultado final según el estado del job
   */
  private mostrarResultadoFinal(job: BulkUploadJob): void {
    if (job.status === 'completed') {
      if (job.failed_rows === 0) {
        this.translate.get('BULK_UPLOAD.MESSAGES.PRODUCTS_IMPORTED_SUCCESS', { count: job.successful_rows }).subscribe(message => {
          this.notify.success(message);
        });
      } else {
        this.translate.get('BULK_UPLOAD.MESSAGES.PROCESS_COMPLETED_WITH_ERRORS', { 
          successful: job.successful_rows, 
          failed: job.failed_rows 
        }).subscribe(message => {
          this.notify.warning(message);
        });
      }
    } else if (job.status === 'failed') {
      this.notify.error(this.translate.instant('BULK_UPLOAD.MESSAGES.UPLOAD_FAILED'));
    } else if (job.status === 'cancelled') {
      this.notify.info(this.translate.instant('BULK_UPLOAD.MESSAGES.UPLOAD_CANCELLED'));
    }

    // Resetear archivo seleccionado
    this.archivoSeleccionado.set(null);
    this.archivoValido.set(false);
  }

  /**
   * Descarga el CSV con los errores
   */
  descargarErrores(): void {
    const job = this.jobActual();
    if (!job) return;

    this.uploadService.downloadErrors(job.job_id).subscribe({
      next: (blob) => {
        this.uploadService.downloadBlob(blob, `errores_${job.job_id}.csv`);
        this.notify.success(this.translate.instant('BULK_UPLOAD.MESSAGES.ERRORS_FILE_DOWNLOADED'));
      },
      error: (error) => {
        console.error('Error al descargar errores:', error);
        if (error.status === 404) {
          this.notify.info(this.translate.instant('BULK_UPLOAD.MESSAGES.NO_ERRORS_TO_DOWNLOAD'));
        } else {
          this.notify.error(this.translate.instant('BULK_UPLOAD.MESSAGES.ERRORS_DOWNLOAD_ERROR'));
        }
      }
    });
  }

  /**
   * Cancela el job actual
   */
  cancelarJob(): void {
    const job = this.jobActual();
    if (!job) return;

    this.uploadService.cancelJob(job.job_id).subscribe({
      next: (response) => {
        this.notify.success(response.message);
        this.detenerPolling();
        this.cargando.set(false);
        this.jobActual.set(response.job);
      },
      error: (error) => {
        console.error('Error al cancelar job:', error);
        const mensaje = error.error?.error || this.translate.instant('BULK_UPLOAD.MESSAGES.CANCEL_ERROR');
        this.notify.error(mensaje);
      }
    });
  }

  /**
   * Reinicia el proceso para cargar otro archivo
   */
  reiniciar(): void {
    this.detenerPolling();
    this.archivoSeleccionado.set(null);
    this.archivoValido.set(false);
    this.cargando.set(false);
    this.jobActual.set(null);
  }

  /**
   * Maneja el evento dragover para permitir soltar archivos
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  /**
   * Maneja el evento drop para cargar el archivo arrastrado
   */
  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.validarYSeleccionarArchivo(event.dataTransfer.files[0]);
    }
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
   * Obtiene el texto en español del estado
   */
  getStatusText(status: JobStatus): string {
    const statusKeys: Record<JobStatus, string> = {
      'pending': 'BULK_UPLOAD.STATUS.PENDING',
      'validating': 'BULK_UPLOAD.STATUS.VALIDATING',
      'processing': 'BULK_UPLOAD.STATUS.PROCESSING',
      'completed': 'BULK_UPLOAD.STATUS.COMPLETED',
      'failed': 'BULK_UPLOAD.STATUS.FAILED',
      'cancelled': 'BULK_UPLOAD.STATUS.CANCELLED'
    };
    
    const key = statusKeys[status];
    return key ? this.translate.instant(key) : status;
  }

  ngOnDestroy(): void {
    this.detenerPolling();
  }
}

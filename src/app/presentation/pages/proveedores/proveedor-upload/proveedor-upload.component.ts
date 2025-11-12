import { Component, inject, signal, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { NotificationService } from '../../../shared/services/notification.service';
import { ProveedorBulkUploadService } from './proveedor-bulk-upload.service';
import { BulkUploadJob, BulkUploadStatus } from './models/bulk-upload.models';

@Component({
  selector: 'app-proveedor-upload',
  standalone: true,
  imports: [
    RouterModule,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  templateUrl: './proveedor-upload.component.html',
  styleUrls: ['./proveedor-upload.component.css']
})
export class ProveedorUploadComponent implements OnDestroy {
  private notify = inject(NotificationService);
  private bulkUploadService = inject(ProveedorBulkUploadService);

  // Signals para el estado del componente
  archivoSeleccionado = signal<File | null>(null);
  archivoValido = signal<boolean>(false);
  cargando = signal<boolean>(false);
  jobActual = signal<BulkUploadJob | null>(null);
  
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private currentJobId: string | null = null;

  ngOnDestroy(): void {
    this.stopPolling();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      if (!file.name.endsWith('.csv')) {
        this.notify.warning('Solo se aceptan archivos CSV', 'Error');
        return;
      }
      
      // Validar tamaño (10MB según el backend)
      if (file.size > 10 * 1024 * 1024) {
        this.notify.warning('El archivo excede el tamaño máximo de 10 MB', 'Error');
        return;
      }
      
      this.archivoSeleccionado.set(file);
      this.archivoValido.set(true);
    }
  }

  procesarArchivo(): void {
    const archivo = this.archivoSeleccionado();
    
    if (!archivo || !this.archivoValido()) {
      this.notify.warning('Seleccione un archivo válido antes de cargar', 'Error');
      return;
    }

    this.cargando.set(true);
    this.notify.info('Subiendo archivo', 'Por favor espere');

    // Subir el archivo
    this.bulkUploadService.uploadCSV(archivo).subscribe({
      next: (response) => {
        this.currentJobId = response.job_id;
        this.notify.info('Archivo recibido', 'Procesando proveedores...');
        
        // Iniciar polling para verificar el estado
        this.startPolling(response.job_id);
      },
      error: (error) => {
        this.cargando.set(false);
        const errorMsg = error.error?.message || 'Error al subir el archivo';
        this.notify.error(errorMsg, 'Error');
      }
    });
  }

  private startPolling(jobId: string): void {
    // Polling cada 3 segundos
    this.pollingInterval = setInterval(() => {
      this.bulkUploadService.getJobStatus(jobId).subscribe({
        next: (job) => {
          this.jobActual.set(job);
          this.cargando.set(false);
          
          if (job.status === 'completed') {
            this.stopPolling();
            
            const successMsg = `Archivo procesado exitosamente: ${job.progress.successful_rows} proveedores creados`;
            this.notify.success(successMsg, 'Éxito');
            
            // Si hay errores, notificar
            if (job.progress.failed_rows > 0) {
              this.notify.warning(
                `${job.progress.failed_rows} filas fallaron. Puede descargar el reporte de errores`,
                'Advertencia'
              );
            }
          } else if (job.status === 'failed') {
            this.stopPolling();
            
            const errorMsg = job.error_message || 'Error al procesar el archivo';
            this.notify.error(errorMsg, 'Error');
          }
          // Si está en 'pending' o 'processing', continuar polling
        },
        error: (error) => {
          this.stopPolling();
          this.cargando.set(false);
          
          const errorMsg = error.error?.message || 'Error al verificar el estado del proceso';
          this.notify.error(errorMsg, 'Error');
        }
      });
    }, 3000);
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const fakeEvent = {
        target: {
          files: event.dataTransfer.files
        }
      } as unknown as Event;
      this.onFileSelected(fakeEvent);
    }
  }

  descargarPlantilla(): void {
    this.bulkUploadService.downloadTemplate().subscribe({
      next: (blob) => {
        this.bulkUploadService.downloadBlob(blob, 'plantilla_proveedores.csv');
        this.notify.success('Plantilla descargada correctamente', 'Éxito');
      },
      error: (error) => {
        this.notify.error('Error al descargar la plantilla', 'Error');
      }
    });
  }

  descargarErrores(): void {
    if (!this.currentJobId) return;
    
    this.bulkUploadService.downloadErrors(this.currentJobId).subscribe({
      next: (blob) => {
        this.bulkUploadService.downloadBlob(blob, `errores_${this.currentJobId}.csv`);
        this.notify.success('Reporte de errores descargado', 'Éxito');
      },
      error: (error) => {
        this.notify.error('Error al descargar el reporte de errores', 'Error');
      }
    });
  }

  cancelarJob(): void {
    if (!this.currentJobId) return;
    
    this.bulkUploadService.cancelJob(this.currentJobId).subscribe({
      next: (response) => {
        this.stopPolling();
        this.notify.success('Proceso cancelado correctamente', 'Éxito');
        this.reiniciar();
      },
      error: (error) => {
        this.notify.error('Error al cancelar el proceso', 'Error');
      }
    });
  }

  reiniciar(): void {
    this.stopPolling();
    this.archivoSeleccionado.set(null);
    this.archivoValido.set(false);
    this.cargando.set(false);
    this.jobActual.set(null);
    this.currentJobId = null;
  }

  getStatusIcon(status: BulkUploadStatus): string {
    const icons: Record<BulkUploadStatus, string> = {
      'pending': 'schedule',
      'validating': 'search',
      'processing': 'sync',
      'completed': 'check_circle',
      'failed': 'error',
      'cancelled': 'cancel'
    };
    return icons[status] || 'help';
  }

  getStatusText(status: BulkUploadStatus): string {
    const texts: Record<BulkUploadStatus, string> = {
      'pending': 'Pendiente',
      'validating': 'Validando',
      'processing': 'Procesando',
      'completed': 'Completado',
      'failed': 'Fallido',
      'cancelled': 'Cancelado'
    };
    return texts[status] || status;
  }

  getStatusColor(status: BulkUploadStatus): string {
    const colors: Record<BulkUploadStatus, string> = {
      'pending': 'status-pending',
      'validating': 'status-validating',
      'processing': 'status-processing',
      'completed': 'status-completed',
      'failed': 'status-failed',
      'cancelled': 'status-cancelled'
    };
    return colors[status] || '';
  }

  getSuccessRate(job: BulkUploadJob): number {
    if (job.progress.processed_rows === 0) return 0;
    return (job.progress.successful_rows / job.progress.processed_rows) * 100;
  }
}

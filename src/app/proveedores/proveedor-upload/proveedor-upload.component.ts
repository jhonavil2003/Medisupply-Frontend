import { Component, inject } from '@angular/core';

import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-proveedor-upload',
  standalone: true,
  imports: [
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
],
  templateUrl: './proveedor-upload.component.html',
  styleUrls: ['./proveedor-upload.component.css']
})
export class ProveedorUploadComponent {
  private notify = inject(NotificationService);

  archivoSeleccionado: File | null = null;
  archivoValido: boolean = false;
  cargando: boolean = false;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.name.endsWith('.csv')) {
        this.notify.warning('Solo se aceptan archivos CSV.','Error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.notify.warning('El archivo excede el tamaño máximo de 10 MB.','Error');
        return;
      }
      this.archivoSeleccionado = file;
      this.archivoValido = true;
    }
  }

  procesarArchivo(): void {
    if (!this.archivoSeleccionado || !this.archivoValido) {
      this.notify.warning('Seleccione un archivo válido antes de cargar.','Error');
      return;
    }
    this.cargando = true;
    this.notify.info('Procesando archivo', this.archivoSeleccionado.name);
    setTimeout(() => {
      this.cargando = false;
      this.notify.success('Archivo cargado correctamente (simulado)');
      this.archivoSeleccionado = null;
      this.archivoValido = false;
    }, 2000);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.onFileSelected({ target: { files: event.dataTransfer.files } } as any);
    }
  }
}

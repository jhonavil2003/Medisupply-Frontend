import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'mynewapp';
  constructor(private toastr: ToastrService) {}

  showSuccess() {
    this.toastr.success('La operación fue exitosa ✅', 'Éxito');
  }

  showError() {
    this.toastr.error('Algo salió mal ❌', 'Error');
  }

  showInfo() {
    this.toastr.info('Esto es solo información ℹ️', 'Info');
  }

  showWarning() {
    this.toastr.warning('Cuidado ⚠️', 'Advertencia');
  }
}
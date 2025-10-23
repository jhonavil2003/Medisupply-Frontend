import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MenuPrincipalComponent } from './menu-principal/menu-principal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MenuPrincipalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private toastr = inject(ToastrService);

  title = 'mynewapp';

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
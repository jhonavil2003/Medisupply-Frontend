import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { GetVendedorByIdUseCase } from '../../../../core/application/use-cases/vendedor/vendedor.use-cases';
import { VendedorEntity } from '../../../../core/domain/entities/vendedor.entity';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-vendedor-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './vendedor-detail.component.html',
  styleUrls: ['./vendedor-detail.component.css']
})
export class VendedorDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private getVendedorByIdUseCase = inject(GetVendedorByIdUseCase);
  private notificationService = inject(NotificationService);

  vendedor = signal<VendedorEntity | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadVendedor(parseInt(id, 10));
    } else {
      this.notificationService.error('ID de vendedor no válido');
      this.router.navigate(['/vendedores']);
    }
  }

  loadVendedor(id: number): void {
    this.loading.set(true);
    
    this.getVendedorByIdUseCase.execute(id).subscribe({
      next: (vendedor) => {
        if (vendedor) {
          this.vendedor.set(vendedor);
        } else {
          this.notificationService.error('Vendedor no encontrado');
          this.router.navigate(['/vendedores']);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar vendedor:', error);
        this.notificationService.error('Error al cargar vendedor');
        this.loading.set(false);
        this.router.navigate(['/vendedores']);
      }
    });
  }

  navigateToEdit(): void {
    const id = this.vendedor()?.id;
    if (id) {
      this.router.navigate(['/vendedores', id, 'edit']);
    }
  }

  navigateBack(): void {
    this.router.navigate(['/vendedores']);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

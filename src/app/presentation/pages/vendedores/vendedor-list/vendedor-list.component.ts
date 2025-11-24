import { Component, OnInit, ViewChild, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { VendedorEntity } from '../../../../core/domain/entities/vendedor.entity';
import {
  GetAllVendedoresUseCase,
  SearchVendedoresUseCase,
  DeleteVendedorUseCase
} from '../../../../core/application/use-cases/vendedor/vendedor.use-cases';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { VendedorCreateComponent } from '../vendedor-create/vendedor-create.component';
import { VendedorEditComponent } from '../vendedor-edit/vendedor-edit.component';
import { VendedorDetailComponent } from '../vendedor-detail/vendedor-detail.component';

@Component({
  selector: 'app-vendedor-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressBarModule,
    TranslateModule
  ],
  templateUrl: './vendedor-list.component.html',
  styleUrls: ['./vendedor-list.component.css']
})
export class VendedorListComponent implements OnInit, AfterViewInit {
  private getAllVendedoresUseCase = inject(GetAllVendedoresUseCase);
  private searchVendedoresUseCase = inject(SearchVendedoresUseCase);
  private deleteVendedorUseCase = inject(DeleteVendedorUseCase);
  private notify = inject(NotificationService);
  private confirmDialog = inject(ConfirmDialogService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private translate = inject(TranslateService);

  vendedores = signal<VendedorEntity[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  searchControl = new FormControl('');

  dataSource = new MatTableDataSource<VendedorEntity>();
  displayedColumns = ['employeeId', 'firstName', 'lastName', 'email', 'phone', 'territory', 'isActive', 'acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadVendedores();
    this.setupSearch();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        if (searchTerm && searchTerm.trim().length > 0) {
          this.search(searchTerm.trim());
        } else {
          this.loadVendedores();
        }
      });
  }

  loadVendedores(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    console.log('🔍 Cargando vendedores...');
    this.getAllVendedoresUseCase.execute().subscribe({
      next: (vendedores) => {
        console.log('✅ Vendedores recibidos:', vendedores);
        console.log('📊 Cantidad:', vendedores.length);
        this.vendedores.set(vendedores);
        this.dataSource.data = vendedores;
        
        // Reasignar paginator después de cargar datos
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
            this.paginator.firstPage();
          }
        }, 0);
        
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar vendedores:', error);
        console.error('📋 Detalles del error:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          url: error.url
        });
        this.errorMessage.set('Error al cargar vendedores');
        this.notify.error('Error al cargar la lista de vendedores');
        this.loading.set(false);
      }
    });
  }

  search(criteria: string): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.searchVendedoresUseCase.execute(criteria).subscribe({
      next: (vendedores) => {
        this.vendedores.set(vendedores);
        this.dataSource.data = vendedores;
        
        // Reasignar paginator después de buscar
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
            this.paginator.firstPage();
          }
        }, 0);
        
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al buscar vendedores:', error);
        this.errorMessage.set('Error al buscar vendedores');
        this.notify.error('Error en la búsqueda');
        this.loading.set(false);
      }
    });
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.loadVendedores();
  }

  navigateToCreate(): void {
    const dialogRef = this.dialog.open(VendedorCreateComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadVendedores();
      }
    });
  }

  navigateToDetail(id: number): void {
    // Buscar el vendedor en el dataSource actual
    const vendedor = this.dataSource.data.find(v => v.id === id);
    if (vendedor) {
      this.dialog.open(VendedorDetailComponent, {
        width: '1000px',
        maxHeight: '90vh',
        disableClose: false,
        autoFocus: false,
        data: vendedor
      });
    }
  }

  navigateToEdit(id: number): void {
    const dialogRef = this.dialog.open(VendedorEditComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: false,
      data: { vendedorId: id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadVendedores();
      }
    });
  }

  async deleteVendedor(vendedor: VendedorEntity): Promise<void> {
    if (!vendedor.id) {
      this.notify.error('No se puede eliminar: vendedor sin ID');
      return;
    }

    const confirmed = await this.confirmDialog.confirmDelete(`${vendedor.firstName} ${vendedor.lastName}`).toPromise();
    
    if (confirmed) {
      this.loading.set(true);
      
      this.deleteVendedorUseCase.execute(vendedor.id).subscribe({
        next: (success) => {
          if (success) {
            this.notify.success(this.translate.instant('SALESPERSONS.DELETE_SUCCESS'));
            this.loadVendedores();
          } else {
            this.notify.error(this.translate.instant('SALESPERSONS.DELETE_ERROR_HAS_VISITS'));
            this.loading.set(false);
          }
        },
        error: (error) => {
          console.error('Error al eliminar vendedor:', error);
          this.notify.error(this.translate.instant('SALESPERSONS.DELETE_ERROR_HAS_VISITS'));
          this.loading.set(false);
        }
      });
    }
  }

  navigateBack(): void {
    this.router.navigate(['/dashboard-admin']);
  }
}

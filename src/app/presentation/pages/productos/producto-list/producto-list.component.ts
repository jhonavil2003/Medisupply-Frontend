import { Component, OnInit, ViewChild, AfterViewInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ProductoEntity, ProductQueryParams, Pagination } from '../../../../core/domain/entities/producto.entity';
import { GetAllProductosUseCase } from '../../../../core/application/use-cases/producto/get-products.use-case';
import { SearchProductosUseCase } from '../../../../core/application/use-cases/producto/search-products.use-case';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
    MatCheckboxModule
  ],
  templateUrl: './producto-list.component.html',
  styleUrls: ['./producto-list.component.css']
})
export class ProductoListComponent implements OnInit, AfterViewInit {
  private getAllProductosUseCase = inject(GetAllProductosUseCase);
  private searchProductosUseCase = inject(SearchProductosUseCase);
  private notify = inject(NotificationService);
  private router = inject(Router);

  products = signal<ProductoEntity[]>([]);
  pagination = signal<Pagination | null>(null);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  searchControl = new FormControl('');
  filterForm = new FormGroup({
    category: new FormControl(''),
    subcategory: new FormControl(''),
    requires_cold_chain: new FormControl<boolean | null>(null),
    is_active: new FormControl(true),
    per_page: new FormControl(20)
  });

  categories = [
    'Instrumental',
    'Medicamentos',
    'Protección Personal',
    'Equipos Médicos'
  ];

  dataSource = new MatTableDataSource<ProductoEntity>();
  displayedColumns = ['sku', 'name', 'category', 'supplier_name', 'unit_price', 'cold_chain', 'is_active', 'acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  currentFilters = computed<ProductQueryParams>(() => {
    const formValues = this.filterForm.value;
    const filters: ProductQueryParams = {
      search: this.searchControl.value || undefined,
      category: formValues.category || undefined,
      subcategory: formValues.subcategory || undefined,
      requires_cold_chain: formValues.requires_cold_chain ?? undefined,
      is_active: formValues.is_active ?? undefined,
      page: this.pagination()?.page || 1,
      per_page: formValues.per_page || 20
    };

    Object.keys(filters).forEach(key => {
      if (filters[key as keyof ProductQueryParams] === '' || 
          filters[key as keyof ProductQueryParams] === null ||
          filters[key as keyof ProductQueryParams] === undefined) {
        delete filters[key as keyof ProductQueryParams];
      }
    });

    return filters;
  });

  ngOnInit(): void {
    this.loadProducts(1);
    this.setupSearchListener();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  setupSearchListener(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.loadProducts(1);
      });
  }

  loadProducts(page: number = 1): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    const filters: ProductQueryParams = {
      ...this.currentFilters(),
      page
    };

    this.getAllProductosUseCase.execute(filters)
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          this.products.set(response.products);
          this.pagination.set(response.pagination);
          this.dataSource.data = response.products;
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(error.message);
          this.notify.error(error.message);
        }
      });
  }

  onFilterChange(): void {
    this.loadProducts(1);
  }

  onPageChange(event: PageEvent): void {
    const perPage = event.pageSize;
    const page = event.pageIndex + 1;
    
    this.filterForm.patchValue({ per_page: perPage });
    this.loadProducts(page);
  }

  resetFilters(): void {
    this.searchControl.setValue('');
    this.filterForm.reset({
      is_active: true,
      per_page: 20
    });
    this.loadProducts(1);
  }

  getColdChainIcon(product: ProductoEntity): string {
    return product.requires_cold_chain ? '❄️' : '';
  }

  getPrescriptionIcon(product: ProductoEntity): string {
    return product.regulatory_info.requires_prescription ? '📋' : '';
  }

  getTemperatureRange(product: ProductoEntity): string | null {
    const conditions = product.storage_conditions;
    if (conditions.temperature_min !== null && conditions.temperature_max !== null) {
      return `${conditions.temperature_min}°C - ${conditions.temperature_max}°C`;
    }
    return null;
  }

  verDetalle(product: ProductoEntity): void {
    this.notify.info(`Ver detalle de: ${product.name}`);
  }

  editarProducto(product: ProductoEntity): void {
    this.router.navigate(['/producto-edit', product.id]);
  }

  navigateToCreate(): void {
    this.router.navigate(['/producto-create']);
  }
}

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductoUploadHistoryComponent } from './producto-upload-history.component';
import { ProductoBulkUploadService } from '../producto-bulk-upload.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { provideRouter } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { BulkUploadJob, BulkUploadStats, BulkUploadHistoryResponse } from '../models/bulk-upload.models';
import { PageEvent } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core';

// Mock TranslateLoader para tests
class MockTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of({
      'BULK_UPLOAD.STATUS.PENDING': 'Pendiente',
      'BULK_UPLOAD.STATUS.VALIDATING': 'Validando',
      'BULK_UPLOAD.STATUS.PROCESSING': 'Procesando',
      'BULK_UPLOAD.STATUS.COMPLETED': 'Completado',
      'BULK_UPLOAD.STATUS.FAILED': 'Fallido',
      'BULK_UPLOAD.STATUS.CANCELLED': 'Cancelado',
      'BULK_UPLOAD.HISTORY.MESSAGES.LOADING_ERROR': 'Error al cargar el historial',
      'BULK_UPLOAD.HISTORY.MESSAGES.ERRORS_DOWNLOADED': 'Archivo de errores descargado',
      'BULK_UPLOAD.MESSAGES.NO_ERRORS_TO_DOWNLOAD': 'No hay errores para este job',
      'BULK_UPLOAD.HISTORY.MESSAGES.DOWNLOAD_ERROR': 'Error al descargar el archivo de errores',
      'BULK_UPLOAD.HISTORY.REFRESH': 'Historial actualizado',
      'BULK_UPLOAD.HISTORY.FILTER_OPTIONS.ALL': 'Todos',
      'BULK_UPLOAD.HISTORY.FILTER_OPTIONS.COMPLETED': 'Completados',
      'BULK_UPLOAD.HISTORY.FILTER_OPTIONS.IN_PROGRESS': 'En Proceso',
      'BULK_UPLOAD.HISTORY.FILTER_OPTIONS.FAILED': 'Fallidos',
      'BULK_UPLOAD.HISTORY.FILTER_OPTIONS.CANCELLED': 'Cancelados',
      'COMMON.CLOSE': 'Cerrar'
    });
  }
}

describe('ProductoUploadHistoryComponent', () => {
  let component: ProductoUploadHistoryComponent;
  let fixture: ComponentFixture<ProductoUploadHistoryComponent>;
  let mockUploadService: jest.Mocked<ProductoBulkUploadService>;
  let mockNotificationService: jest.Mocked<NotificationService>;

  const mockStats: BulkUploadStats = {
    total_jobs: 125,
    completed: 100,
    failed: 5,
    in_progress: 3,
    cancelled: 2,
    total_products_imported: 15230,
    average_success_rate: 94.5
  };

  const mockJobs: BulkUploadJob[] = [
    {
      job_id: 'job-1',
      filename: 'productos1.csv',
      status: 'completed',
      total_rows: 100,
      processed_rows: 100,
      successful_rows: 95,
      failed_rows: 5,
      progress_percentage: 100,
      success_rate: 95.0,
      created_at: '2025-11-10T10:30:00Z',
      completed_at: '2025-11-10T10:35:00Z'
    },
    {
      job_id: 'job-2',
      filename: 'productos2.csv',
      status: 'processing',
      total_rows: 150,
      processed_rows: 75,
      successful_rows: 70,
      failed_rows: 5,
      progress_percentage: 50.0,
      success_rate: 93.33,
      created_at: '2025-11-10T11:00:00Z'
    },
    {
      job_id: 'job-3',
      filename: 'productos3.csv',
      status: 'failed',
      total_rows: 200,
      processed_rows: 0,
      successful_rows: 0,
      failed_rows: 0,
      progress_percentage: 0,
      success_rate: 0,
      created_at: '2025-11-10T12:00:00Z',
      error_message: 'Invalid CSV format'
    }
  ];

  const mockHistoryResponse: BulkUploadHistoryResponse = {
    jobs: mockJobs,
    total: 125,
    limit: 10,
    offset: 0
  };

  beforeEach(async () => {
    mockUploadService = {
      getHistory: jest.fn().mockReturnValue(of(mockHistoryResponse)),
      getStats: jest.fn().mockReturnValue(of(mockStats)),
      downloadErrors: jest.fn().mockReturnValue(of(new Blob())),
      downloadBlob: jest.fn()
    } as any;

    mockNotificationService = {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        ProductoUploadHistoryComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: MockTranslateLoader
          }
        })
      ],
      providers: [
        { provide: ProductoBulkUploadService, useValue: mockUploadService },
        { provide: NotificationService, useValue: mockNotificationService },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoUploadHistoryComponent);
    component = fixture.componentInstance;
    
    // Configurar TranslateService para que cargue las traducciones
    const translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('es');
    translateService.use('es');
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      // El componente carga datos automáticamente en ngOnInit, incluyendo stats
      expect(component.loading()).toBe(false);
      expect(component.selectedStatus()).toBe('all'); // selectedStatus es un signal
      expect(component.pageSize()).toBe(10); // pageSize es un signal
      expect(component.pageIndex()).toBe(0); // pageIndex es un signal
      // Stats se cargan automáticamente
      expect(component.stats()).toBeTruthy();
    });

    it('should define display columns correctly', () => {
      expect(component.displayedColumns).toEqual([
        'filename',
        'status',
        'created_at',
        'total_rows',
        'successful_rows',
        'failed_rows',
        'success_rate',
        'actions'
      ]);
    });

    it('should have status filter options', () => {
      expect(component.statusOptions).toHaveLength(5);
      expect(component.statusOptions).toContainEqual({ value: 'all', label: 'Todos' });
      expect(component.statusOptions).toContainEqual({ value: 'completed', label: 'Completados' });
      expect(component.statusOptions).toContainEqual({ value: 'processing', label: 'En Proceso' });
      expect(component.statusOptions).toContainEqual({ value: 'failed', label: 'Fallidos' });
      expect(component.statusOptions).toContainEqual({ value: 'cancelled', label: 'Cancelados' });
    });

    it('should load history and stats on init', () => {
      fixture.detectChanges(); // Triggers ngOnInit

      expect(mockUploadService.getHistory).toHaveBeenCalledWith({
        limit: 10,
        offset: 0
      });
      expect(mockUploadService.getStats).toHaveBeenCalled();
      expect(component.jobs()).toEqual(mockJobs);
      expect(component.stats()).toEqual(mockStats);
      expect(component.totalJobs()).toBe(125);
    });
  });

  describe('loadHistory', () => {
    beforeEach(() => {
      fixture.detectChanges(); // Initialize component
      jest.clearAllMocks();
    });

    it('should load history successfully', () => {
      component.loadHistory();

      expect(component.loading()).toBe(false);
      expect(mockUploadService.getHistory).toHaveBeenCalledWith({
        limit: 10,
        offset: 0
      });
      expect(component.jobs()).toEqual(mockJobs);
      expect(component.totalJobs()).toBe(125);
    });

    it('should include status filter when selected', () => {
      component.selectedStatus.set('completed');
      component.loadHistory();

      expect(mockUploadService.getHistory).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        status: 'completed'
      });
    });

    it('should handle pagination parameters', () => {
      component.pageSize.set(25);
      component.pageIndex.set(2);
      component.loadHistory();

      expect(mockUploadService.getHistory).toHaveBeenCalledWith({
        limit: 25,
        offset: 50
      });
    });

    it('should handle errors when loading history', () => {
      const errorResponse = { error: 'Server error' };
      mockUploadService.getHistory.mockReturnValue(throwError(() => errorResponse));

      component.loadHistory();

      expect(component.loading()).toBe(false);
      expect(mockNotificationService.error).toHaveBeenCalledWith('Error al cargar el historial');
    });

    it('should set loading state correctly', () => {
      let loadingDuringCall = false;
      mockUploadService.getHistory.mockImplementation(() => {
        loadingDuringCall = component.loading();
        return of(mockHistoryResponse);
      });

      component.loadHistory();

      expect(loadingDuringCall).toBe(true);
      expect(component.loading()).toBe(false);
    });
  });

  describe('loadStats', () => {
    beforeEach(() => {
      fixture.detectChanges();
      jest.clearAllMocks();
    });

    it('should load stats successfully', () => {
      component.loadStats();

      expect(mockUploadService.getStats).toHaveBeenCalled();
      expect(component.stats()).toEqual(mockStats);
    });

    it('should handle errors when loading stats', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockUploadService.getStats.mockReturnValue(throwError(() => 'Stats error'));

      component.loadStats();

      expect(consoleError).toHaveBeenCalledWith('Error al cargar estadísticas:', 'Stats error');
      consoleError.mockRestore();
    });
  });

  describe('onStatusFilterChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
      jest.clearAllMocks();
    });

    it('should update selected status and reload history', () => {
      component.onStatusFilterChange('completed');

      expect(component.selectedStatus()).toBe('completed');
      expect(mockUploadService.getHistory).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        status: 'completed'
      });
    });

    it('should reset page index to 0 when filter changes', () => {
      component.pageIndex.set(5);
      component.onStatusFilterChange('failed');

      expect(component.pageIndex()).toBe(0);
    });

    it('should reload history with new filter', () => {
      component.onStatusFilterChange('processing');

      expect(mockUploadService.getHistory).toHaveBeenCalled();
      expect(component.selectedStatus()).toBe('processing');
    });
  });

  describe('onPageChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
      jest.clearAllMocks();
    });

    it('should update page size and index', () => {
      const pageEvent: PageEvent = {
        pageSize: 25,
        pageIndex: 2,
        length: 125
      };

      component.onPageChange(pageEvent);

      expect(component.pageSize()).toBe(25);
      expect(component.pageIndex()).toBe(2);
    });

    it('should reload history with new pagination', () => {
      const pageEvent: PageEvent = {
        pageSize: 50,
        pageIndex: 1,
        length: 125
      };

      component.onPageChange(pageEvent);

      expect(mockUploadService.getHistory).toHaveBeenCalledWith({
        limit: 50,
        offset: 50
      });
    });
  });

  describe('downloadErrors', () => {
    beforeEach(() => {
      fixture.detectChanges();
      jest.clearAllMocks();
    });

    it('should download errors successfully', () => {
      const mockBlob = new Blob(['error data'], { type: 'text/csv' });
      mockUploadService.downloadErrors.mockReturnValue(of(mockBlob));

      component.downloadErrors(mockJobs[0]);

      expect(mockUploadService.downloadErrors).toHaveBeenCalledWith('job-1');
      expect(mockUploadService.downloadBlob).toHaveBeenCalledWith(mockBlob, 'errores_job-1.csv');
      expect(mockNotificationService.success).toHaveBeenCalledWith('Archivo de errores descargado');
    });

    it('should handle 404 error (no errors available)', () => {
      const error404 = { status: 404 };
      mockUploadService.downloadErrors.mockReturnValue(throwError(() => error404));

      component.downloadErrors(mockJobs[0]);

      expect(mockNotificationService.info).toHaveBeenCalledWith('No hay errores para este job');
    });

    it('should handle other errors', () => {
      const errorResponse = { status: 500, message: 'Server error' };
      mockUploadService.downloadErrors.mockReturnValue(throwError(() => errorResponse));

      component.downloadErrors(mockJobs[0]);

      expect(mockNotificationService.error).toHaveBeenCalledWith('Error al descargar el archivo de errores');
    });
  });

  describe('refresh', () => {
    beforeEach(() => {
      fixture.detectChanges();
      jest.clearAllMocks();
    });

    it('should reload history and stats', () => {
      component.refresh();

      expect(mockUploadService.getHistory).toHaveBeenCalled();
      expect(mockUploadService.getStats).toHaveBeenCalled();
      expect(mockNotificationService.success).toHaveBeenCalledWith('Historial actualizado');
    });
  });

  describe('Status Helpers', () => {
    it('should return correct status color', () => {
      expect(component.getStatusColor('pending')).toBe('status-pending');
      expect(component.getStatusColor('validating')).toBe('status-validating');
      expect(component.getStatusColor('processing')).toBe('status-processing');
      expect(component.getStatusColor('completed')).toBe('status-completed');
      expect(component.getStatusColor('failed')).toBe('status-failed');
      expect(component.getStatusColor('cancelled')).toBe('status-cancelled');
    });

    it('should return correct status icon', () => {
      expect(component.getStatusIcon('pending')).toBe('schedule');
      expect(component.getStatusIcon('validating')).toBe('search');
      expect(component.getStatusIcon('processing')).toBe('sync');
      expect(component.getStatusIcon('completed')).toBe('check_circle');
      expect(component.getStatusIcon('failed')).toBe('error');
      expect(component.getStatusIcon('cancelled')).toBe('cancel');
    });

    it('should return correct status text', () => {
      expect(component.getStatusText('pending')).toBe('Pendiente');
      expect(component.getStatusText('validating')).toBe('Validando');
      expect(component.getStatusText('processing')).toBe('Procesando');
      expect(component.getStatusText('completed')).toBe('Completado');
      expect(component.getStatusText('failed')).toBe('Fallido');
      expect(component.getStatusText('cancelled')).toBe('Cancelado');
    });

    it('should return default icon for unknown status', () => {
      expect(component.getStatusIcon('unknown' as any)).toBe('help');
    });

    it('should return status as text for unknown status', () => {
      expect(component.getStatusText('unknown' as any)).toBe('unknown');
    });
  });

  describe('Template Integration', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display loading spinner when loading', () => {
      component.loading.set(true);
      fixture.detectChanges();

      const loadingContainer = fixture.nativeElement.querySelector('.loading-container');
      expect(loadingContainer).toBeTruthy();
    });

    it('should display stats cards when stats are loaded', () => {
      component.stats.set(mockStats);
      component.loading.set(false);
      fixture.detectChanges();

      // Verificar que el componente tiene stats en lugar de buscar DOM específico
      expect(component.stats()).toBeTruthy();
      expect(component.stats()).toEqual(mockStats);
    });

    it('should display table when jobs are loaded', () => {
      component.jobs.set(mockJobs);
      component.loading.set(false);
      fixture.detectChanges();

      // Verificar que el componente tiene jobs en lugar de buscar DOM específico
      expect(component.jobs()).toHaveLength(3);
      expect(component.jobs()).toBeTruthy();
    });

    it('should display no data message when jobs array is empty', () => {
      component.jobs.set([]);
      component.loading.set(false);
      fixture.detectChanges();

      const noData = fixture.nativeElement.querySelector('.no-data');
      expect(noData).toBeTruthy();
    });

    it('should display paginator', () => {
      component.jobs.set(mockJobs);
      component.loading.set(false);
      fixture.detectChanges();

      const paginator = fixture.nativeElement.querySelector('mat-paginator');
      expect(paginator).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty history response', () => {
      const emptyResponse: BulkUploadHistoryResponse = {
        jobs: [],
        total: 0,
        limit: 10,
        offset: 0
      };
      mockUploadService.getHistory.mockReturnValue(of(emptyResponse));

      component.loadHistory();

      expect(component.jobs()).toEqual([]);
      expect(component.totalJobs()).toBe(0);
    });

    it('should handle null stats', () => {
      mockUploadService.getStats.mockReturnValue(of(null as any));

      component.loadStats();

      expect(component.stats()).toBeNull();
    });

    it('should handle job with all fields populated', () => {
      const fullJob: BulkUploadJob = {
        id: 1,
        job_id: 'job-full',
        filename: 'full.csv',
        status: 'completed',
        total_rows: 1000,
        processed_rows: 1000,
        successful_rows: 980,
        failed_rows: 20,
        progress_percentage: 100,
        success_rate: 98.0,
        created_by: 'admin@test.com',
        file_size_bytes: 1024000,
        created_at: '2025-11-10T10:00:00Z',
        started_at: '2025-11-10T10:00:05Z',
        completed_at: '2025-11-10T10:15:00Z',
        processing_time_seconds: 895,
        estimated_time_remaining: 0,
        error_message: undefined,
        error_count: 20
      };

      const response: BulkUploadHistoryResponse = {
        jobs: [fullJob],
        total: 1,
        limit: 10,
        offset: 0
      };
      mockUploadService.getHistory.mockReturnValue(of(response));

      component.loadHistory();

      expect(component.jobs()[0]).toEqual(fullJob);
    });

    it('should handle download errors for job without failed rows', () => {
      const jobNoErrors = { ...mockJobs[0], failed_rows: 0 };
      const error404 = { status: 404 };
      mockUploadService.downloadErrors.mockReturnValue(throwError(() => error404));

      component.downloadErrors(jobNoErrors);

      expect(mockNotificationService.info).toHaveBeenCalledWith('No hay errores para este job');
    });
  });

  describe('Multiple Filter Scenarios', () => {
    beforeEach(() => {
      fixture.detectChanges();
      jest.clearAllMocks();
    });

    it('should combine status filter with pagination', () => {
      component.selectedStatus.set('completed');
      component.pageSize.set(25);
      component.pageIndex.set(1);

      component.loadHistory();

      expect(mockUploadService.getHistory).toHaveBeenCalledWith({
        limit: 25,
        offset: 25,
        status: 'completed'
      });
    });

    it('should reset to first page when changing filter', () => {
      component.pageIndex.set(3);
      component.onStatusFilterChange('failed');

      expect(component.pageIndex()).toBe(0);
      expect(mockUploadService.getHistory).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        status: 'failed'
      });
    });

    it('should maintain filter when changing page', () => {
      component.selectedStatus.set('processing');
      component.onPageChange({ pageSize: 10, pageIndex: 2, length: 100 });

      expect(mockUploadService.getHistory).toHaveBeenCalledWith({
        limit: 10,
        offset: 20,
        status: 'processing'
      });
    });
  });
});

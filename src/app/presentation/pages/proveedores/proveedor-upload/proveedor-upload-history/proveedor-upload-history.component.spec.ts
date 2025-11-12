import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProveedorUploadHistoryComponent } from './proveedor-upload-history.component';
import { ProveedorBulkUploadService } from '../proveedor-bulk-upload.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BulkUploadJob, BulkUploadStats, BulkUploadHistoryResponse } from '../models/bulk-upload.models';
import { PageEvent } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ProveedorUploadHistoryComponent', () => {
  let component: ProveedorUploadHistoryComponent;
  let fixture: ComponentFixture<ProveedorUploadHistoryComponent>;
  let mockUploadService: jest.Mocked<ProveedorBulkUploadService>;
  let mockNotificationService: jest.Mocked<NotificationService>;

  const mockStats: BulkUploadStats = {
    total_jobs: 85,
    completed: 70,
    in_progress: 5,
    failed: 8,
    jobs_by_status: {
      completed: 70,
      failed: 8,
      processing: 4,
      pending: 1,
      cancelled: 2
    },
    total_suppliers_created: 3420,
    total_rows_failed: 156,
    average_success_rate: 92.3
  };

  const mockJobs: BulkUploadJob[] = [
    {
      job_id: 'job-1',
      filename: 'proveedores1.csv',
      status: 'completed',
      file_size_bytes: 51200,
      progress: {
        total_rows: 100,
        processed_rows: 100,
        successful_rows: 95,
        failed_rows: 5,
        percentage: 100
      },
      timestamps: {
        created_at: '2025-11-10T10:30:00Z',
        started_at: '2025-11-10T10:30:05Z',
        completed_at: '2025-11-10T10:35:00Z'
      },
      error_message: null,
      created_at: '2025-11-10T10:30:00Z',
      total_rows: 100,
      successful_rows: 95,
      failed_rows: 5,
      success_rate: 95.0
    },
    {
      job_id: 'job-2',
      filename: 'proveedores2.csv',
      status: 'processing',
      file_size_bytes: 76800,
      progress: {
        total_rows: 150,
        processed_rows: 75,
        successful_rows: 70,
        failed_rows: 5,
        percentage: 50.0
      },
      timestamps: {
        created_at: '2025-11-10T11:00:00Z',
        started_at: '2025-11-10T11:00:02Z',
        completed_at: null
      },
      error_message: null,
      created_at: '2025-11-10T11:00:00Z',
      total_rows: 150,
      successful_rows: 70,
      failed_rows: 5,
      success_rate: 93.33
    },
    {
      job_id: 'job-3',
      filename: 'proveedores3.csv',
      status: 'failed',
      file_size_bytes: 102400,
      progress: {
        total_rows: 200,
        processed_rows: 0,
        successful_rows: 0,
        failed_rows: 0,
        percentage: 0
      },
      timestamps: {
        created_at: '2025-11-10T12:00:00Z',
        started_at: null,
        completed_at: null
      },
      error_message: 'Invalid CSV format',
      created_at: '2025-11-10T12:00:00Z',
      total_rows: 200,
      successful_rows: 0,
      failed_rows: 0,
      success_rate: 0
    }
  ];

  const mockHistoryResponse: BulkUploadHistoryResponse = {
    jobs: mockJobs,
    total: 85,
    pagination: {
      page: 1,
      per_page: 10,
      total_items: 85,
      total_pages: 9
    }
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
        ProveedorUploadHistoryComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: ProveedorBulkUploadService, useValue: mockUploadService },
        { provide: NotificationService, useValue: mockNotificationService },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProveedorUploadHistoryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.jobs()).toEqual([]);
      expect(component.stats()).toBeNull();
      expect(component.loading()).toBe(false);
      expect(component.totalJobs()).toBe(0);
      expect(component.selectedStatus()).toBe('all');
      expect(component.pageSize()).toBe(10);
      expect(component.pageIndex()).toBe(0);
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
      expect(component.totalJobs()).toBe(85);
    });
  });

  describe('loadHistory', () => {
    beforeEach(() => {
      fixture.detectChanges();
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
      expect(component.totalJobs()).toBe(85);
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
        length: 85
      };

      component.onPageChange(pageEvent);

      expect(component.pageSize()).toBe(25);
      expect(component.pageIndex()).toBe(2);
    });

    it('should reload history with new pagination', () => {
      const pageEvent: PageEvent = {
        pageSize: 50,
        pageIndex: 1,
        length: 85
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
      expect(mockUploadService.downloadBlob).toHaveBeenCalledWith(mockBlob, 'errores_proveedores_job-1.csv');
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
      fixture.detectChanges();

      const statsGrid = fixture.nativeElement.querySelector('.stats-grid');
      expect(statsGrid).toBeTruthy();
    });

    it('should display table when jobs are loaded', () => {
      component.jobs.set(mockJobs);
      component.loading.set(false);
      fixture.detectChanges();

      const table = fixture.nativeElement.querySelector('.history-table');
      expect(table).toBeTruthy();
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
        pagination: {
          page: 1,
          per_page: 10,
          total_items: 0,
          total_pages: 0
        }
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

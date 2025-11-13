import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProductoBulkUploadService } from './producto-bulk-upload.service';
import { BulkUploadJob, BulkUploadHistoryResponse, BulkUploadStats } from './models/bulk-upload.models';

describe('ProductoBulkUploadService', () => {
  let service: ProductoBulkUploadService;
  let httpMock: HttpTestingController;
  const API_URL = 'http://localhost:3001/api/products/bulk-upload';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductoBulkUploadService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ProductoBulkUploadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('downloadTemplate', () => {
    it('should download CSV template', () => {
      const mockBlob = new Blob(['csv data'], { type: 'text/csv' });

      service.downloadTemplate().subscribe(blob => {
        expect(blob).toEqual(mockBlob);
      });

      const req = httpMock.expectOne(`${API_URL}/template`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });

  describe('uploadCSV', () => {
    it('should upload CSV file', () => {
      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
      const mockResponse = {
        success: true,
        message: 'Archivo recibido',
        job_id: 'job-123'
      };

      service.uploadCSV(mockFile).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${API_URL}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeInstanceOf(FormData);
      req.flush(mockResponse);
    });

    it('should upload CSV file with created_by parameter', () => {
      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
      const createdBy = 'admin@test.com';
      const mockResponse = {
        success: true,
        message: 'Archivo recibido',
        job_id: 'job-123'
      };

      service.uploadCSV(mockFile, createdBy).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${API_URL}`);
      expect(req.request.method).toBe('POST');
      const formData = req.request.body as FormData;
      expect(formData.get('created_by')).toBe(createdBy);
      req.flush(mockResponse);
    });
  });

  describe('getJobStatus', () => {
    it('should get job status', () => {
      const mockJob: BulkUploadJob = {
        job_id: 'job-123',
        filename: 'test.csv',
        status: 'processing',
        total_rows: 100,
        processed_rows: 50,
        successful_rows: 45,
        failed_rows: 5,
        progress_percentage: 50,
        success_rate: 90,
        created_at: '2025-11-12T10:00:00Z'
      };

      service.getJobStatus('job-123').subscribe(job => {
        expect(job).toEqual(mockJob);
      });

      const req = httpMock.expectOne(`${API_URL}/job-123`);
      expect(req.request.method).toBe('GET');
      req.flush(mockJob);
    });

    it('should get job status with errors included', () => {
      const mockJob: BulkUploadJob = {
        job_id: 'job-123',
        filename: 'test.csv',
        status: 'completed',
        total_rows: 100,
        processed_rows: 100,
        successful_rows: 95,
        failed_rows: 5,
        progress_percentage: 100,
        success_rate: 95,
        created_at: '2025-11-12T10:00:00Z'
      };

      service.getJobStatus('job-123', true).subscribe(job => {
        expect(job).toEqual(mockJob);
      });

      const req = httpMock.expectOne(`${API_URL}/job-123?include_errors=true`);
      expect(req.request.method).toBe('GET');
      req.flush(mockJob);
    });
  });

  describe('downloadErrors', () => {
    it('should download errors CSV', () => {
      const mockBlob = new Blob(['errors data'], { type: 'text/csv' });

      service.downloadErrors('job-123').subscribe(blob => {
        expect(blob).toEqual(mockBlob);
      });

      const req = httpMock.expectOne(`${API_URL}/job-123/errors`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });

  describe('cancelJob', () => {
    it('should cancel job', () => {
      const mockResponse = {
        message: 'Job cancelado',
        job: {
          job_id: 'job-123',
          status: 'cancelled' as const
        }
      };

      service.cancelJob('job-123').subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${API_URL}/job-123/cancel`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('getHistory', () => {
    it('should get history without filters', () => {
      const mockResponse: BulkUploadHistoryResponse = {
        jobs: [
          {
            job_id: 'job-1',
            filename: 'test1.csv',
            status: 'completed',
            total_rows: 100,
            processed_rows: 100,
            successful_rows: 95,
            failed_rows: 5,
            progress_percentage: 100,
            success_rate: 95,
            created_at: '2025-11-12T10:00:00Z'
          }
        ],
        total: 1,
        limit: 10,
        offset: 0
      };

      service.getHistory().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${API_URL}/history`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should get history with filters', () => {
      const mockResponse: BulkUploadHistoryResponse = {
        jobs: [],
        total: 0,
        limit: 25,
        offset: 50
      };

      const filters = {
        limit: 25,
        offset: 50,
        status: 'completed' as const
      };

      service.getHistory(filters).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        req => req.url.includes(`${API_URL}/history`) && 
               req.params.get('limit') === '25' &&
               req.params.get('offset') === '50' &&
               req.params.get('status') === 'completed'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getStats', () => {
    it('should get statistics', () => {
      const mockStats: BulkUploadStats = {
        total_jobs: 100,
        completed: 80,
        failed: 10,
        in_progress: 5,
        cancelled: 5,
        total_products_imported: 5000,
        average_success_rate: 92.5
      };

      service.getStats().subscribe(stats => {
        expect(stats).toEqual(mockStats);
      });

      const req = httpMock.expectOne(`${API_URL}/stats`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);
    });
  });

  describe('downloadBlob', () => {
    it('should trigger download', () => {
      const mockBlob = new Blob(['test'], { type: 'text/csv' });
      const filename = 'test.csv';
      
      // Mock window.URL.createObjectURL and revokeObjectURL
      const mockUrl = 'blob:http://localhost/mock-url';
      global.URL.createObjectURL = jest.fn(() => mockUrl);
      global.URL.revokeObjectURL = jest.fn();
      
      // Create spy for createElement
      const mockLink = document.createElement('a');
      const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
      const clickSpy = jest.spyOn(mockLink, 'click').mockImplementation(() => {});

      service.downloadBlob(mockBlob, filename);

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe(mockUrl);
      expect(mockLink.download).toBe(filename);
      expect(clickSpy).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);

      createElementSpy.mockRestore();
      clickSpy.mockRestore();
    });
  });
});

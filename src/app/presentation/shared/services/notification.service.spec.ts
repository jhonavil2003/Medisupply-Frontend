import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let toastrService: any;
  let matDialog: any;

  beforeEach(() => {
    // Create spy objects
    toastrService = {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn()
    };
    
    matDialog = {
      open: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: ToastrService, useValue: toastrService },
        { provide: MatDialog, useValue: matDialog }
      ]
    });

    service = TestBed.inject(NotificationService);
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('success', () => {
    it('should call toastr success with message only', () => {
      const message = 'Success message';
      
      service.success(message);
      
      expect(toastrService.success).toHaveBeenCalledWith(message, undefined);
    });

    it('should call toastr success with message and title', () => {
      const message = 'Success message';
      const title = 'Success Title';
      
      service.success(message, title);
      
      expect(toastrService.success).toHaveBeenCalledWith(message, title);
    });

    it('should handle empty message', () => {
      service.success('');
      
      expect(toastrService.success).toHaveBeenCalledWith('', undefined);
    });

    it('should handle empty title', () => {
      const message = 'Success message';
      
      service.success(message, '');
      
      expect(toastrService.success).toHaveBeenCalledWith(message, '');
    });

    it('should handle long messages', () => {
      const longMessage = 'This is a very long success message that contains multiple words and should be handled correctly by the notification service without any issues or truncation';
      
      service.success(longMessage);
      
      expect(toastrService.success).toHaveBeenCalledWith(longMessage, undefined);
    });

    it('should handle special characters in message', () => {
      const messageWithSpecialChars = 'Success! ✓ Item saved with 100% accuracy & <script>alert("test")</script>';
      
      service.success(messageWithSpecialChars);
      
      expect(toastrService.success).toHaveBeenCalledWith(messageWithSpecialChars, undefined);
    });
  });

  describe('error', () => {
    it('should call toastr error with message only', () => {
      const message = 'Error message';
      
      service.error(message);
      
      expect(toastrService.error).toHaveBeenCalledWith(message, undefined);
    });

    it('should call toastr error with message and title', () => {
      const message = 'Error message';
      const title = 'Error Title';
      
      service.error(message, title);
      
      expect(toastrService.error).toHaveBeenCalledWith(message, title);
    });

    it('should handle empty message', () => {
      service.error('');
      
      expect(toastrService.error).toHaveBeenCalledWith('', undefined);
    });

    it('should handle empty title', () => {
      const message = 'Error message';
      
      service.error(message, '');
      
      expect(toastrService.error).toHaveBeenCalledWith(message, '');
    });

    it('should handle error messages with technical details', () => {
      const technicalError = 'HTTP 500: Internal Server Error - Database connection failed at line 42 in UserRepository.ts';
      
      service.error(technicalError);
      
      expect(toastrService.error).toHaveBeenCalledWith(technicalError, undefined);
    });

    it('should handle multiple consecutive error calls', () => {
      service.error('First error');
      service.error('Second error');
      service.error('Third error');
      
      expect(toastrService.error).toHaveBeenCalledTimes(3);
    });
  });

  describe('info', () => {
    it('should call toastr info with message only', () => {
      const message = 'Info message';
      
      service.info(message);
      
      expect(toastrService.info).toHaveBeenCalledWith(message, undefined);
    });

    it('should call toastr info with message and title', () => {
      const message = 'Info message';
      const title = 'Info Title';
      
      service.info(message, title);
      
      expect(toastrService.info).toHaveBeenCalledWith(message, title);
    });

    it('should handle empty message', () => {
      service.info('');
      
      expect(toastrService.info).toHaveBeenCalledWith('', undefined);
    });

    it('should handle empty title', () => {
      const message = 'Info message';
      
      service.info(message, '');
      
      expect(toastrService.info).toHaveBeenCalledWith(message, '');
    });

    it('should handle informational messages', () => {
      const infoMessage = 'Your data has been automatically saved. Last sync: 2 minutes ago.';
      
      service.info(infoMessage);
      
      expect(toastrService.info).toHaveBeenCalledWith(infoMessage, undefined);
    });

    it('should handle info messages with HTML content', () => {
      const htmlMessage = 'Click <strong>here</strong> to view details';
      
      service.info(htmlMessage);
      
      expect(toastrService.info).toHaveBeenCalledWith(htmlMessage, undefined);
    });
  });

  describe('warning', () => {
    it('should call toastr warning with message only', () => {
      const message = 'Warning message';
      
      service.warning(message);
      
      expect(toastrService.warning).toHaveBeenCalledWith(message, undefined);
    });

    it('should call toastr warning with message and title', () => {
      const message = 'Warning message';
      const title = 'Warning Title';
      
      service.warning(message, title);
      
      expect(toastrService.warning).toHaveBeenCalledWith(message, title);
    });

    it('should handle empty message', () => {
      service.warning('');
      
      expect(toastrService.warning).toHaveBeenCalledWith('', undefined);
    });

    it('should handle empty title', () => {
      const message = 'Warning message';
      
      service.warning(message, '');
      
      expect(toastrService.warning).toHaveBeenCalledWith(message, '');
    });

    it('should handle warning messages with recommendations', () => {
      const warningMessage = 'Low disk space detected. Consider cleaning up temporary files or upgrading your storage plan.';
      
      service.warning(warningMessage);
      
      expect(toastrService.warning).toHaveBeenCalledWith(warningMessage, undefined);
    });

    it('should handle urgent warning messages', () => {
      const urgentWarning = 'URGENT: System will restart in 5 minutes for critical security updates';
      
      service.warning(urgentWarning);
      
      expect(toastrService.warning).toHaveBeenCalledWith(urgentWarning, undefined);
    });
  });

  describe('Integration Tests', () => {
    it('should handle multiple different notification types in sequence', () => {
      service.success('Operation completed');
      service.info('Processing next item');
      service.warning('Approaching rate limit');
      service.error('Operation failed');
      
      expect(toastrService.success).toHaveBeenCalledTimes(1);
      expect(toastrService.info).toHaveBeenCalledTimes(1);
      expect(toastrService.warning).toHaveBeenCalledTimes(1);
      expect(toastrService.error).toHaveBeenCalledTimes(1);
    });

    it('should handle mixed title and no-title calls', () => {
      service.success('Success with title', 'Success');
      service.error('Error without title');
      service.info('Info with title', 'Information');
      service.warning('Warning without title');
      
      expect(toastrService.success).toHaveBeenCalledWith('Success with title', 'Success');
      expect(toastrService.error).toHaveBeenCalledWith('Error without title', undefined);
      expect(toastrService.info).toHaveBeenCalledWith('Info with title', 'Information');
      expect(toastrService.warning).toHaveBeenCalledWith('Warning without title', undefined);
    });

    it('should maintain state across multiple calls', () => {
      // Test that the service doesn't maintain any internal state that affects subsequent calls
      service.success('First call');
      service.success('Second call');
      
      expect(toastrService.success.mock.calls[0]).toEqual(['First call', undefined]);
      expect(toastrService.success.mock.calls[1]).toEqual(['Second call', undefined]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null message gracefully', () => {
      service.success(null as any);
      
      expect(toastrService.success).toHaveBeenCalledWith(null, undefined);
    });

    it('should handle undefined message gracefully', () => {
      service.error(undefined as any);
      
      expect(toastrService.error).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should handle null title gracefully', () => {
      service.info('Message', null as any);
      
      expect(toastrService.info).toHaveBeenCalledWith('Message', null);
    });

    it('should handle undefined title gracefully', () => {
      service.warning('Message', undefined);
      
      expect(toastrService.warning).toHaveBeenCalledWith('Message', undefined);
    });

    it('should handle numeric values passed as strings', () => {
      service.success('123');
      service.error('0');
      service.info('-1');
      service.warning('3.14');
      
      expect(toastrService.success).toHaveBeenCalledWith('123', undefined);
      expect(toastrService.error).toHaveBeenCalledWith('0', undefined);
      expect(toastrService.info).toHaveBeenCalledWith('-1', undefined);
      expect(toastrService.warning).toHaveBeenCalledWith('3.14', undefined);
    });

    it('should handle boolean values passed as strings', () => {
      service.success('true');
      service.error('false');
      
      expect(toastrService.success).toHaveBeenCalledWith('true', undefined);
      expect(toastrService.error).toHaveBeenCalledWith('false', undefined);
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid consecutive calls', () => {
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        service.success(`Message ${i}`);
      }
      
      expect(toastrService.success).toHaveBeenCalledTimes(iterations);
    });

    it('should handle large message content', () => {
      const largeMessage = 'A'.repeat(10000); // 10KB message
      
      service.info(largeMessage);
      
      expect(toastrService.info).toHaveBeenCalledWith(largeMessage, undefined);
    });
  });

  describe('Method Parameter Validation', () => {
    it('should call toastr methods with exact parameter count when title is provided', () => {
      service.success('msg', 'title');
      service.error('msg', 'title');
      service.info('msg', 'title');
      service.warning('msg', 'title');
      
      expect(toastrService.success).toHaveBeenCalledWith('msg', 'title');
      expect(toastrService.error).toHaveBeenCalledWith('msg', 'title');
      expect(toastrService.info).toHaveBeenCalledWith('msg', 'title');
      expect(toastrService.warning).toHaveBeenCalledWith('msg', 'title');
    });

    it('should call toastr methods with exact parameter count when title is omitted', () => {
      service.success('msg');
      service.error('msg');
      service.info('msg');
      service.warning('msg');
      
      expect(toastrService.success).toHaveBeenCalledWith('msg', undefined);
      expect(toastrService.error).toHaveBeenCalledWith('msg', undefined);
      expect(toastrService.info).toHaveBeenCalledWith('msg', undefined);
      expect(toastrService.warning).toHaveBeenCalledWith('msg', undefined);
    });
  });
});
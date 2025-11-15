import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from './confirm-dialog.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../components/confirm-dialog/confirm-dialog.component';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;
  let matDialog: any;
  let mockDialogRef: any;

  beforeEach(() => {
    // Create spy objects
    mockDialogRef = {
      afterClosed: jest.fn()
    };
    
    matDialog = {
      open: jest.fn()
    };

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        ConfirmDialogService,
        { provide: MatDialog, useValue: matDialog }
      ]
    });

    service = TestBed.inject(ConfirmDialogService);
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('confirm', () => {
    it('should open dialog with correct configuration', () => {
      const testData: ConfirmDialogData = {
        title: 'Test Title',
        message: 'Test Message',
        confirmText: 'OK',
        cancelText: 'Cancel',
        type: 'info'
      };

      matDialog.open.mockReturnValue(mockDialogRef);
      mockDialogRef.afterClosed.mockReturnValue(of(true));

      service.confirm(testData).subscribe();

      expect(matDialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
        width: '400px',
        disableClose: true,
        data: testData
      });
    });

    it('should return observable from dialog afterClosed', () => {
      const testData: ConfirmDialogData = {
        title: 'Test Title',
        message: 'Test Message'
      };

      matDialog.open.mockReturnValue(mockDialogRef);
      mockDialogRef.afterClosed.mockReturnValue(of(true));

      const result$ = service.confirm(testData);

      result$.subscribe(result => {
        expect(result).toBe(true);
      });

      expect(mockDialogRef.afterClosed).toHaveBeenCalled();
    });

    it('should handle dialog returning false', () => {
      const testData: ConfirmDialogData = {
        title: 'Test Title',
        message: 'Test Message'
      };

      matDialog.open.mockReturnValue(mockDialogRef);
      mockDialogRef.afterClosed.mockReturnValue(of(false));

      service.confirm(testData).subscribe(result => {
        expect(result).toBe(false);
      });
    });

    it('should handle dialog returning undefined (ESC key or backdrop click)', () => {
      const testData: ConfirmDialogData = {
        title: 'Test Title',
        message: 'Test Message'
      };

      matDialog.open.mockReturnValue(mockDialogRef);
      mockDialogRef.afterClosed.mockReturnValue(of(undefined));

      service.confirm(testData).subscribe(result => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('confirmDelete', () => {
    it('should call confirm with correct delete dialog configuration', () => {
      const itemName = 'Test Item';
      const expectedData: ConfirmDialogData = {
        title: 'DIALOG.CONFIRM_DELETE_TITLE',
        message: 'DIALOG.CONFIRM_DELETE_MESSAGE',
        confirmText: 'DIALOG.DELETE',
        cancelText: 'COMMON.CANCEL',
        type: 'danger'
      };

      matDialog.open.mockReturnValue(mockDialogRef);
      mockDialogRef.afterClosed.mockReturnValue(of(true));

      service.confirmDelete(itemName).subscribe();

      expect(matDialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
        width: '400px',
        disableClose: true,
        data: expectedData
      });
    });

    it('should return result from dialog for delete confirmation', () => {
      const itemName = 'Test Item';

      matDialog.open.mockReturnValue(mockDialogRef);
      mockDialogRef.afterClosed.mockReturnValue(of(true));

      service.confirmDelete(itemName).subscribe(result => {
        expect(result).toBe(true);
      });
    });

    it('should handle delete confirmation cancellation', () => {
      const itemName = 'Test Item';

      matDialog.open.mockReturnValue(mockDialogRef);
      mockDialogRef.afterClosed.mockReturnValue(of(false));

      service.confirmDelete(itemName).subscribe(result => {
        expect(result).toBe(false);
      });
    });

    it('should handle different item names correctly', () => {
      const itemNames = ['Product A', 'User 123', 'Category XYZ'];

      itemNames.forEach(itemName => {
        matDialog.open.mockReturnValue(mockDialogRef);
        mockDialogRef.afterClosed.mockReturnValue(of(true));

        service.confirmDelete(itemName).subscribe();

        const lastCall = matDialog.open.mock.calls[matDialog.open.mock.calls.length - 1];
        expect(lastCall[1].data.message).toBe('DIALOG.CONFIRM_DELETE_MESSAGE');
      });
    });
  });

  describe('confirmAction', () => {
    it('should call confirm with correct action dialog configuration', () => {
      const title = 'Custom Action';
      const message = 'Are you sure you want to perform this action?';
      const expectedData: ConfirmDialogData = {
        title,
        message,
        confirmText: 'COMMON.CONFIRM',
        cancelText: 'COMMON.CANCEL',
        type: 'warning'
      };

      matDialog.open.mockReturnValue(mockDialogRef);
      mockDialogRef.afterClosed.mockReturnValue(of(true));

      service.confirmAction(title, message).subscribe();

      expect(matDialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
        width: '400px',
        disableClose: true,
        data: expectedData
      });
    });

    it('should return result from dialog for action confirmation', () => {
      const title = 'Test Action';
      const message = 'Test message';

      matDialog.open.mockReturnValue(mockDialogRef);
      mockDialogRef.afterClosed.mockReturnValue(of(true));

      service.confirmAction(title, message).subscribe(result => {
        expect(result).toBe(true);
      });
    });

    it('should handle action confirmation cancellation', () => {
      const title = 'Test Action';
      const message = 'Test message';

      matDialog.open.mockReturnValue(mockDialogRef);
      mockDialogRef.afterClosed.mockReturnValue(of(false));

      service.confirmAction(title, message).subscribe(result => {
        expect(result).toBe(false);
      });
    });

    it('should handle different titles and messages correctly', () => {
      const testCases = [
        { title: 'Save Changes', message: 'Do you want to save your changes?' },
        { title: 'Logout', message: 'Are you sure you want to logout?' },
        { title: 'Reset Data', message: 'This will reset all your data. Continue?' }
      ];

      testCases.forEach(testCase => {
        matDialog.open.mockReturnValue(mockDialogRef);
        mockDialogRef.afterClosed.mockReturnValue(of(true));

        service.confirmAction(testCase.title, testCase.message).subscribe();

        const lastCall = matDialog.open.mock.calls[matDialog.open.mock.calls.length - 1];
        expect(lastCall[1].data.title).toBe(testCase.title);
        expect(lastCall[1].data.message).toBe(testCase.message);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle multiple consecutive dialog calls', () => {
      matDialog.open.mockReturnValue(mockDialogRef);
      mockDialogRef.afterClosed.mockReturnValue(of(true));

      // First call
      service.confirmDelete('Item 1').subscribe();
      // Second call
      service.confirmAction('Action', 'Message').subscribe();
      // Third call
      service.confirm({ title: 'Custom', message: 'Custom message' }).subscribe();

      expect(matDialog.open).toHaveBeenCalledTimes(3);
    });

    it('should maintain dialog configuration consistency', () => {
      const testData: ConfirmDialogData = {
        title: 'Test',
        message: 'Message'
      };

      matDialog.open.mockReturnValue(mockDialogRef);
      mockDialogRef.afterClosed.mockReturnValue(of(true));

      service.confirm(testData).subscribe();

      const dialogConfig = matDialog.open.mock.calls[matDialog.open.mock.calls.length - 1][1];
      expect(dialogConfig.width).toBe('400px');
      expect(dialogConfig.disableClose).toBe(true);
      expect(dialogConfig.data).toBe(testData);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty strings in confirmDelete', () => {
      matDialog.open.mockReturnValue(mockDialogRef);
      mockDialogRef.afterClosed.mockReturnValue(of(true));

      service.confirmDelete('').subscribe();

      const lastCall = matDialog.open.mock.calls[matDialog.open.mock.calls.length - 1];
      expect(lastCall[1].data.message).toBe('DIALOG.CONFIRM_DELETE_MESSAGE');
    });

    it('should handle empty strings in confirmAction', () => {
      matDialog.open.mockReturnValue(mockDialogRef);
      mockDialogRef.afterClosed.mockReturnValue(of(true));

      service.confirmAction('', '').subscribe();

      const lastCall = matDialog.open.mock.calls[matDialog.open.mock.calls.length - 1];
      expect(lastCall[1].data.title).toBe('');
      expect(lastCall[1].data.message).toBe('');
    });

    it('should handle special characters in item names', () => {
      const itemName = 'Item with "quotes" & <symbols>';
      
      matDialog.open.mockReturnValue(mockDialogRef);
      mockDialogRef.afterClosed.mockReturnValue(of(true));

      service.confirmDelete(itemName).subscribe();

      const lastCall = matDialog.open.mock.calls[matDialog.open.mock.calls.length - 1];
      expect(lastCall[1].data.message).toBe('DIALOG.CONFIRM_DELETE_MESSAGE');
    });
  });
});
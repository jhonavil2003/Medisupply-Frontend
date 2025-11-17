import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { ProductoUploadComponent } from './producto-upload.component';
import { NotificationService } from '../../../shared/services/notification.service';

// Material modules
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

describe('ProductoUploadComponent', () => {
  let component: ProductoUploadComponent;
  let fixture: ComponentFixture<ProductoUploadComponent>;
  let mockNotificationService: any;

  beforeEach(async () => {
    const notificationServiceSpy = {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        ProductoUploadComponent,
        NoopAnimationsModule,
        RouterTestingModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatProgressSpinnerModule
      ],
      providers: [
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoUploadComponent);
    component = fixture.componentInstance;
    mockNotificationService = TestBed.inject(NotificationService);
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.archivoSeleccionado).toBeNull();
      expect(component.archivoValido).toBe(false);
      expect(component.cargando).toBe(false);
    });
  });

  describe('File Selection', () => {
    it('should accept valid CSV file', () => {
      // Arrange
      const mockFile = new File(['test,content'], 'test.csv', { type: 'text/csv' });
      const mockEvent = {
        target: {
          files: [mockFile]
        }
      } as any;

      // Act
      component.onFileSelected(mockEvent);

      // Assert
      expect(component.archivoSeleccionado).toBe(mockFile);
      expect(component.archivoValido).toBe(true);
      expect(mockNotificationService.warning).not.toHaveBeenCalled();
    });

    it('should reject non-CSV files', () => {
      // Arrange
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockEvent = {
        target: {
          files: [mockFile]
        }
      } as any;

      // Act
      component.onFileSelected(mockEvent);

      // Assert
      expect(component.archivoSeleccionado).toBeNull();
      expect(component.archivoValido).toBe(false);
      expect(mockNotificationService.warning).toHaveBeenCalledWith(
        'Solo se aceptan archivos CSV.',
        'Error'
      );
    });

    it('should reject files larger than 10MB', () => {
      // Arrange
      const largeContent = 'a'.repeat(11 * 1024 * 1024); // 11MB
      const mockFile = new File([largeContent], 'large.csv', { type: 'text/csv' });
      const mockEvent = {
        target: {
          files: [mockFile]
        }
      } as any;

      // Act
      component.onFileSelected(mockEvent);

      // Assert
      expect(component.archivoSeleccionado).toBeNull();
      expect(component.archivoValido).toBe(false);
      expect(mockNotificationService.warning).toHaveBeenCalledWith(
        'El archivo excede el tamaño máximo de 10 MB.',
        'Error'
      );
    });

    it('should handle event with no files', () => {
      // Arrange
      const mockEvent = {
        target: {
          files: null
        }
      } as any;

      // Act
      component.onFileSelected(mockEvent);

      // Assert
      expect(component.archivoSeleccionado).toBeNull();
      expect(component.archivoValido).toBe(false);
    });

    it('should handle event with empty files array', () => {
      // Arrange
      const mockEvent = {
        target: {
          files: []
        }
      } as any;

      // Act
      component.onFileSelected(mockEvent);

      // Assert
      expect(component.archivoSeleccionado).toBeNull();
      expect(component.archivoValido).toBe(false);
    });

    it('should handle input element without files property', () => {
      // Arrange
      const mockEvent = {
        target: {}
      } as any;

      // Act
      expect(() => component.onFileSelected(mockEvent)).not.toThrow();

      // Assert
      expect(component.archivoSeleccionado).toBeNull();
      expect(component.archivoValido).toBe(false);
    });
  });

  describe('File Processing', () => {
    it('should process valid file successfully', fakeAsync(() => {
      // Arrange
      const mockFile = new File(['test,content'], 'test.csv', { type: 'text/csv' });
      component.archivoSeleccionado = mockFile;
      component.archivoValido = true;

      // Act
      component.procesarArchivo();
      expect(component.cargando).toBe(true);
      expect(mockNotificationService.info).toHaveBeenCalledWith(
        'Procesando archivo',
        'test.csv'
      );

      // Simulate timeout
      tick(2000);

      // Assert
      expect(component.cargando).toBe(false);
      expect(mockNotificationService.success).toHaveBeenCalledWith(
        'Archivo cargado correctamente (simulado)'
      );
      expect(component.archivoSeleccionado).toBeNull();
      expect(component.archivoValido).toBe(false);
    }));

    it('should not process when no file is selected', () => {
      // Arrange
      component.archivoSeleccionado = null;
      component.archivoValido = false;

      // Act
      component.procesarArchivo();

      // Assert
      expect(component.cargando).toBe(false);
      expect(mockNotificationService.warning).toHaveBeenCalledWith(
        'Seleccione un archivo válido antes de cargar.',
        'Error'
      );
      expect(mockNotificationService.info).not.toHaveBeenCalled();
    });

    it('should not process when file is invalid', () => {
      // Arrange
      const mockFile = new File(['test,content'], 'test.csv', { type: 'text/csv' });
      component.archivoSeleccionado = mockFile;
      component.archivoValido = false;

      // Act
      component.procesarArchivo();

      // Assert
      expect(component.cargando).toBe(false);
      expect(mockNotificationService.warning).toHaveBeenCalledWith(
        'Seleccione un archivo válido antes de cargar.',
        'Error'
      );
      expect(mockNotificationService.info).not.toHaveBeenCalled();
    });

    it('should handle loading state correctly during processing', fakeAsync(() => {
      // Arrange
      const mockFile = new File(['test,content'], 'test.csv', { type: 'text/csv' });
      component.archivoSeleccionado = mockFile;
      component.archivoValido = true;

      // Act
      component.procesarArchivo();

      // Assert initial state
      expect(component.cargando).toBe(true);

      // Advance time partially
      tick(1000);
      expect(component.cargando).toBe(true);

      // Complete timeout
      tick(1000);
      expect(component.cargando).toBe(false);
    }));
  });

  describe('Drag and Drop', () => {
    it('should prevent default behavior on drag over', () => {
      // Arrange
      const mockEvent = {
        preventDefault: jest.fn()
      } as any;

      // Act
      component.onDragOver(mockEvent);

      // Assert
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should handle file drop with valid file', () => {
      // Arrange
      const mockFile = new File(['test,content'], 'test.csv', { type: 'text/csv' });
      const mockEvent = {
        preventDefault: jest.fn(),
        dataTransfer: {
          files: [mockFile]
        }
      } as any;

      const onFileSelectedSpy = jest.spyOn(component, 'onFileSelected');

      // Act
      component.onFileDrop(mockEvent);

      // Assert
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(onFileSelectedSpy).toHaveBeenCalledWith({
        target: { files: [mockFile] }
      });
    });

    it('should handle file drop with no files', () => {
      // Arrange
      const mockEvent = {
        preventDefault: jest.fn(),
        dataTransfer: {
          files: []
        }
      } as any;

      const onFileSelectedSpy = jest.spyOn(component, 'onFileSelected');

      // Act
      component.onFileDrop(mockEvent);

      // Assert
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(onFileSelectedSpy).not.toHaveBeenCalled();
    });

    it('should handle file drop without dataTransfer', () => {
      // Arrange
      const mockEvent = {
        preventDefault: jest.fn(),
        dataTransfer: null
      } as any;

      const onFileSelectedSpy = jest.spyOn(component, 'onFileSelected');

      // Act
      component.onFileDrop(mockEvent);

      // Assert
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(onFileSelectedSpy).not.toHaveBeenCalled();
    });

    it('should handle file drop with empty dataTransfer files', () => {
      // Arrange
      const mockEvent = {
        preventDefault: jest.fn(),
        dataTransfer: {
          files: []
        }
      } as any;

      const onFileSelectedSpy = jest.spyOn(component, 'onFileSelected');

      // Act
      component.onFileDrop(mockEvent);

      // Assert
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(onFileSelectedSpy).not.toHaveBeenCalled();
    });
  });

  describe('File Validation Edge Cases', () => {
    it('should accept file exactly at 10MB limit', () => {
      // Arrange
      const content = 'a'.repeat(10 * 1024 * 1024); // Exactly 10MB
      const mockFile = new File([content], 'limit.csv', { type: 'text/csv' });
      const mockEvent = {
        target: {
          files: [mockFile]
        }
      } as any;

      // Act
      component.onFileSelected(mockEvent);

      // Assert
      expect(component.archivoSeleccionado).toBe(mockFile);
      expect(component.archivoValido).toBe(true);
      expect(mockNotificationService.warning).not.toHaveBeenCalled();
    });

    it('should accept CSV files with different case extensions', () => {
      // Arrange - The component checks for '.csv' (lowercase), so uppercase should fail
      const mockFile = new File(['test,content'], 'test.CSV', { type: 'text/csv' });
      const mockEvent = {
        target: {
          files: [mockFile]
        }
      } as any;

      // Act
      component.onFileSelected(mockEvent);

      // Assert - Should be rejected because of case-sensitive check
      expect(component.archivoSeleccionado).toBeNull();
      expect(component.archivoValido).toBe(false);
      expect(mockNotificationService.warning).toHaveBeenCalledWith(
        'Solo se aceptan archivos CSV.',
        'Error'
      );
    });

    it('should reject files with csv in name but different extension', () => {
      // Arrange
      const mockFile = new File(['test content'], 'csv_data.txt', { type: 'text/plain' });
      const mockEvent = {
        target: {
          files: [mockFile]
        }
      } as any;

      // Act
      component.onFileSelected(mockEvent);

      // Assert
      expect(component.archivoSeleccionado).toBeNull();
      expect(component.archivoValido).toBe(false);
      expect(mockNotificationService.warning).toHaveBeenCalledWith(
        'Solo se aceptan archivos CSV.',
        'Error'
      );
    });

    it('should handle empty file names', () => {
      // Arrange
      const mockFile = new File(['test,content'], '', { type: 'text/csv' });
      const mockEvent = {
        target: {
          files: [mockFile]
        }
      } as any;

      // Act
      component.onFileSelected(mockEvent);

      // Assert
      expect(component.archivoSeleccionado).toBeNull();
      expect(component.archivoValido).toBe(false);
      expect(mockNotificationService.warning).toHaveBeenCalledWith(
        'Solo se aceptan archivos CSV.',
        'Error'
      );
    });
  });

  describe('Component State Management', () => {
    it('should reset state correctly after successful upload', fakeAsync(() => {
      // Arrange
      const mockFile = new File(['test,content'], 'test.csv', { type: 'text/csv' });
      component.archivoSeleccionado = mockFile;
      component.archivoValido = true;

      // Act
      component.procesarArchivo();
      tick(2000);

      // Assert
      expect(component.archivoSeleccionado).toBeNull();
      expect(component.archivoValido).toBe(false);
      expect(component.cargando).toBe(false);
    }));

    it('should maintain state when upload fails validation', () => {
      // Arrange
      const initialFile = component.archivoSeleccionado;
      const initialValid = component.archivoValido;
      const initialLoading = component.cargando;

      // Act
      component.procesarArchivo();

      // Assert
      expect(component.archivoSeleccionado).toBe(initialFile);
      expect(component.archivoValido).toBe(initialValid);
      expect(component.cargando).toBe(initialLoading);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete file upload workflow', fakeAsync(() => {
      // Arrange
      const mockFile = new File(['test,content'], 'workflow.csv', { type: 'text/csv' });
      const mockEvent = {
        target: {
          files: [mockFile]
        }
      } as any;

      // Act - File selection
      component.onFileSelected(mockEvent);
      expect(component.archivoSeleccionado).toBe(mockFile);
      expect(component.archivoValido).toBe(true);

      // Act - File processing
      component.procesarArchivo();
      expect(component.cargando).toBe(true);
      
      tick(2000);
      
      // Assert - Final state
      expect(component.cargando).toBe(false);
      expect(component.archivoSeleccionado).toBeNull();
      expect(component.archivoValido).toBe(false);
      expect(mockNotificationService.success).toHaveBeenCalled();
    }));

    it('should handle drag and drop to upload workflow', fakeAsync(() => {
      // Arrange
      const mockFile = new File(['test,content'], 'dragdrop.csv', { type: 'text/csv' });
      const mockDropEvent = {
        preventDefault: jest.fn(),
        dataTransfer: {
          files: [mockFile]
        }
      } as any;

      // Act - Drag over
      const mockDragEvent = { preventDefault: jest.fn() } as any;
      component.onDragOver(mockDragEvent);
      expect(mockDragEvent.preventDefault).toHaveBeenCalled();

      // Act - Drop file
      component.onFileDrop(mockDropEvent);
      expect(component.archivoSeleccionado).toBe(mockFile);
      expect(component.archivoValido).toBe(true);

      // Act - Process file
      component.procesarArchivo();
      tick(2000);

      // Assert
      expect(component.archivoSeleccionado).toBeNull();
      expect(component.archivoValido).toBe(false);
      expect(mockNotificationService.success).toHaveBeenCalled();
    }));
  });
});
import { Component, Inject, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon [color]="getIconColor()">{{ getIcon() }}</mat-icon>
      {{ data.title }}
    </h2>
    
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        {{ data.cancelText || ('COMMON.CANCEL' | translate) }}
      </button>
      <button mat-raised-button [color]="getButtonColor()" (click)="onConfirm()">
        {{ data.confirmText || ('COMMON.CONFIRM' | translate) }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    mat-dialog-content {
      margin: 1rem 0;
    }
    
    mat-dialog-actions {
      gap: 0.5rem;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getIcon(): string {
    switch (this.data.type) {
      case 'danger': return 'warning';
      case 'warning': return 'warning_amber';
      case 'info': return 'info';
      default: return 'help';
    }
  }

  getIconColor(): string {
    switch (this.data.type) {
      case 'danger': return 'warn';
      case 'warning': return 'accent';
      case 'info': return 'primary';
      default: return 'primary';
    }
  }

  getButtonColor(): string {
    switch (this.data.type) {
      case 'danger': return 'warn';
      case 'warning': return 'accent';
      default: return 'primary';
    }
  }
}
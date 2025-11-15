import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogComponent, ConfirmDialogData } from '../components/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private dialog = inject(MatDialog);
  private translate = inject(TranslateService);

  confirm(data: ConfirmDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true,
      data
    });

    return dialogRef.afterClosed();
  }

  confirmDelete(itemName: string): Observable<boolean> {
    return this.confirm({
      title: this.translate.instant('DIALOG.CONFIRM_DELETE_TITLE'),
      message: this.translate.instant('DIALOG.CONFIRM_DELETE_MESSAGE', { item: itemName }),
      confirmText: this.translate.instant('DIALOG.DELETE'),
      cancelText: this.translate.instant('COMMON.CANCEL'),
      type: 'danger'
    });
  }

  confirmAction(title: string, message: string): Observable<boolean> {
    return this.confirm({
      title,
      message,
      confirmText: this.translate.instant('COMMON.CONFIRM'),
      cancelText: this.translate.instant('COMMON.CANCEL'),
      type: 'warning'
    });
  }
}
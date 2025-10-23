// notification.service.ts
import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastr = inject(ToastrService);
  private dialog = inject(MatDialog);

  // ✅ Toasts
  success(msg: string, title?: string) {
    this.toastr.success(msg, title);
  }

  error(msg: string, title?: string) {
    this.toastr.error(msg, title);
  }

  info(msg: string, title?: string) {
    this.toastr.info(msg, title);
  }

  warning(msg: string, title?: string) {
    this.toastr.warning(msg, title);
  }

}

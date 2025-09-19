// notification.service.ts
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

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

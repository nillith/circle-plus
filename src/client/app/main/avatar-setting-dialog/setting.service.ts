import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material";
import {AvatarSettingDialogComponent} from "./avatar-setting-dialog.component";

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  avatarSettingDialog: MatDialogRef<AvatarSettingDialogComponent>;

  constructor(public dialog: MatDialog) {
  }

  showAvatarSettingDialog(anchor: HTMLElement) {
    const _this = this;
    setTimeout(() => {
      _this.avatarSettingDialog = _this.dialog.open(AvatarSettingDialogComponent, {
        data: {
          anchor
        },
      });
    });
  }
}

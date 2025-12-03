import {Component, Inject, OnInit} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatButton, MatIconButton} from "@angular/material/button";
import {TranslatePipe} from "@ngx-translate/core";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-share-dialog',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    TranslatePipe,
    MatIcon,
    MatIconButton
  ],
  templateUrl: './share-dialog.html',
  styleUrl: './share-dialog.scss',
})
export class ShareDialog implements OnInit {

  constructor(private snackBar: MatSnackBar,
              @Inject(MAT_DIALOG_DATA) public data: { shareUrl: string }) {}

  ngOnInit(): void {
    this.generateQRCode();
  }

  generateQRCode() {

  }

  copyLink(): void {
    const shareUrl = this.data.shareUrl;
    navigator.clipboard.writeText(shareUrl).then(() => {
      this.snackBar.open('Link wurde kopiert', 'Schließen', {
        duration: 3000
      });
    });
  }

  downloadQRCode(): void {
    // Implementieren Sie hier die Logik zum Herunterladen des QR-Codes
    // Zum Beispiel könnte dies einen API-Aufruf beinhalten, um einen QR-Code zu generieren
    this.snackBar.open('QR-Code wird heruntergeladen...', 'Schließen', {
      duration: 3000
    });
  }
}

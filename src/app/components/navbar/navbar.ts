import { Component } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {MatToolbar} from "@angular/material/toolbar";
import {RouterLink} from "@angular/router";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {TranslateService} from "@ngx-translate/core";
import {HelpDialog} from "../dialogs/help-dialog/help-dialog";

@Component({
  selector: 'app-navbar',
  imports: [
    MatToolbar,
    RouterLink,
    MatIconButton,
    MatIcon,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  currentLang: string;

  constructor(
      private dialog: MatDialog,
      private translate: TranslateService
  ) {
    // Standardsprache setzen
    this.currentLang = translate.getCurrentLang() || 'de';
  }

  openHelpDialog(): void {
    this.dialog.open(HelpDialog, {
      width: '500px'
    });
  }

  switchLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLang = lang;
  }

}

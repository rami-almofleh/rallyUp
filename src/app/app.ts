import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Navbar} from "./components/navbar/navbar";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor(private translate: TranslateService) {
    this.translate.addLangs(['de', 'en']);
    this.translate.setFallbackLang('en');
    this.translate.use('en');
  }
}

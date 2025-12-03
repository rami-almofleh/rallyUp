import {Routes} from '@angular/router';
import {Home} from "./pages/home/home";

export const routes: Routes = [
  {path: '', component: Home}, // Hauptseite für Erstellen/Verwalten/Anzeigen
  {path: '**', redirectTo: '/'} // Alles andere zur Hauptseite umleiten
];

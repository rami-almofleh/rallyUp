import {Component, OnInit} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ShareDialog} from "../../components/dialogs/share-dialog/share-dialog";
import {MatDialog} from "@angular/material/dialog";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {TranslatePipe} from "@ngx-translate/core";
import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle
} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {Router} from "@angular/router";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-home',
  imports: [
    MatButton,
    MatIcon,
    MatFormField,
    MatInput,
    TranslatePipe,
    ReactiveFormsModule,
    MatLabel,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDatepicker,
    MatSuffix,
    MatIconButton,
    DatePipe
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  minDate: Date = new Date();
  userRole: string = 'admin'; // Standardmäßig Admin-Rechte
  form: FormGroup = new FormGroup({
    title: new FormControl(null, [Validators.required]),
    moderator: new FormControl(null, [Validators.required]),
    dueDate: new FormControl(null, [Validators.required]),
    guests: new FormArray([])
});

  constructor(private dialog: MatDialog,
              private snackBar: MatSnackBar,
              private router: Router) {}

  ngOnInit(): void {
    this.minDate = new Date();
    this.minDate.setHours(0, 0, 0, 0);

    this.addGuest();

    // Parse URL-Parameter, wenn vorhanden
    this.loadFormDataFromUrl();
  }

  get guests(): FormArray {
    return this.form.get('guests') as FormArray;
  }

  addGuest(): void {
    this.guests.push(
        new FormGroup({
          id: new FormControl(this.generateUniqueId()),
          name: new FormControl('', Validators.required),
          contribution: new FormControl('')
        })
    );
  }

  removeGuest(index: number): void {
    this.guests.removeAt(index);
  }

  openPreview(): void {
    // Link in neuem Tab öffnen
    const shareUrl = window.location.href;
    window.open(shareUrl, '_blank');
  }

  markAsDeleted(): void {
    // Enddatum ändern
    // Implementieren Sie hier die Logik zum Ändern des Enddatums
    this.snackBar.open('Enddatum wurde geändert', 'Schließen', {
      duration: 3000
    });
  }

  openShareDialog() {
    // URL ohne Rolle für Sharing erstellen
    const currentUrl = new URL(window.location.href);

    // Rolle entfernen, damit geteilte Links für normale Benutzer sind
    currentUrl.searchParams.delete('role');
    const shareUrl = currentUrl.toString();

    this.dialog.open(ShareDialog, {
      width: '500px',
      data: { shareUrl }
    });
  }

  // Neue Methode zum Speichern des Formulars
  saveForm(): void {
    if (this.form.valid) {
      // Formulardaten holen
      const formData = this.form.value;

      // Daten komprimieren und kodieren
      const encodedData = this.encodeFormData(formData);

      // URL aktualisieren mit kodierten Daten
      this.updateUrlWithFormData(encodedData);

      // Bestätigungsnachricht anzeigen
      this.snackBar.open('Formular wurde gespeichert', 'Schließen', {
        duration: 3000
      });
    } else {
      this.snackBar.open('Bitte füllen Sie alle Pflichtfelder aus', 'Schließen', {
        duration: 3000
      });
    }
  }

  // Generiert eine eindeutige ID für jeden Gast
  private generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Komprimiert und kodiert die Formulardaten für die URL
  private encodeFormData(data: any): string {
    // Datum in ISO-String umwandeln für einfachere Serialisierung
    if (data.dueDate) {
      data.dueDate = data.dueDate.toISOString();
    }

    // JSON-String erstellen
    const jsonString = JSON.stringify(data);

    // Base64-Kodierung (kompakter als URL-Encoding für komplexe Objekte)
    return btoa(jsonString);
  }

  // Aktualisiert die URL mit den kodierten Formulardaten
  private updateUrlWithFormData(encodedData: string): void {
    const url = new URL(window.location.href);

    // Daten in die URL einfügen
    url.searchParams.set('data', encodedData);

    // Für Admin-URLs immer die Rolle mit speichern
    url.searchParams.set('role', 'admin');

    // URL ohne Neuladen der Seite aktualisieren
    window.history.pushState({}, '', url.toString());
  }

  private loadFormDataFromUrl(): void {
    const url = new URL(window.location.href);
    const dataParam = url.searchParams.get('data');
    const roleParam = url.searchParams.get('role');
    // Setzen der Benutzerrolle basierend auf URL-Parameter
    this.userRole = roleParam ? roleParam : (dataParam ? 'user' : 'admin'); // Wenn kein Parameter, dann Admin

    // Formular entsprechend der Rolle konfigurieren
    this.configureFormByRole();

    // Wenn Daten vorhanden sind, diese dekodieren und in das Formular laden
    if (dataParam) {
      try {
        const decodedData = this.decodeFormData(dataParam);

        // Datum wieder in Date-Objekt umwandeln
        if (decodedData.dueDate) {
          decodedData.dueDate = new Date(decodedData.dueDate);
        }

        // Formular mit den dekodierten Daten füllen
        this.form.patchValue({
          title: decodedData.title,
          moderator: decodedData.moderator,
          dueDate: decodedData.dueDate
        });

        // Gästeliste leeren und mit den geladenen Daten füllen
        this.guests.clear();
        if (decodedData.guests && decodedData.guests.length > 0) {
          decodedData.guests.forEach((guest: any) => {
            this.guests.push(new FormGroup({
              id: new FormControl(guest.id || this.generateUniqueId()),
              name: new FormControl(guest.name, Validators.required),
              contribution: new FormControl(guest.contribution)
            }));
          });
        } else {
          this.addGuest(); // Mindestens ein leeres Gästeformular hinzufügen
        }
      } catch (e) {
        console.error('Fehler beim Dekodieren der Formulardaten:', e);
        this.snackBar.open('Fehler beim Laden der Daten', 'Schließen', {
          duration: 3000
        });
      }
    }
  }

  // Dekodiert die Base64-kodierten Formulardaten
  private decodeFormData(encodedData: string): any {
    const jsonString = atob(encodedData);
    return JSON.parse(jsonString);
  }

  // Konfiguriert das Formular basierend auf der Benutzerrolle
  private configureFormByRole(): void {
    if (this.userRole !== 'admin') {
      // Für normale Benutzer: Titel, Moderator und Fälligkeitsdatum deaktivieren
      this.form.get('title')?.disable();
      this.form.get('moderator')?.disable();
      this.form.get('dueDate')?.disable();
    } else {
      // Für Admins: Alles aktivieren
      this.form.get('title')?.enable();
      this.form.get('moderator')?.enable();
      this.form.get('dueDate')?.enable();
    }
  }
}

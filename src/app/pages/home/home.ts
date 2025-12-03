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
    MatIconButton
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  minDate: Date = new Date();
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
    this.dialog.open(ShareDialog, {
      width: '500px'
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
    // Aktualisieren der URL mit den kodierten Daten ohne Seiten-Neuladen
    const url = this.router.createUrlTree([], {
      queryParams: { data: encodedData },
      queryParamsHandling: 'merge'
    });

    window.history.replaceState({}, '', this.router.serializeUrl(url));
  }

  // Lädt Formulardaten aus URL-Parametern
  private loadFormDataFromUrl(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');

    if (encodedData) {
      try {
        // Dekodieren der Daten
        const jsonString = atob(encodedData);
        const formData = JSON.parse(jsonString);

        // Datum zurück in Date-Objekt umwandeln
        if (formData.dueDate) {
          formData.dueDate = new Date(formData.dueDate);
        }

        // Formular mit den Daten füllen
        this.fillFormWithData(formData);
      } catch (error) {
        console.error('Fehler beim Laden der Formulardaten:', error);
      }
    }
  }

  // Füllt das Formular mit den geladenen Daten
  private fillFormWithData(data: any): void {
    // Basisdaten setzen
    this.form.patchValue({
      title: data.title,
      moderator: data.moderator,
      dueDate: data.dueDate
    });

    // Gästeliste zurücksetzen und neu füllen
    const guestsArray = this.form.get('guests') as FormArray;
    guestsArray.clear();

    if (data.guests && Array.isArray(data.guests)) {
      data.guests.forEach((guest: { id: any; name: any; contribution: any; }) => {
        guestsArray.push(
            new FormGroup({
              id: new FormControl(guest.id || this.generateUniqueId()),
              name: new FormControl(guest.name, Validators.required),
              contribution: new FormControl(guest.contribution)
            })
        );
      });
    }
  }
}

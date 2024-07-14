# Wetterbasierte Aufgaben App

## Übersicht

Die **Wetterbasierte Aufgaben App** ist eine Progressive Web App (PWA), die es Benutzern ermöglicht, Aufgaben basierend auf den aktuellen Wetterbedingungen zu verwalten. Benutzer können Aufgaben hinzufügen, die nur bei bestimmten Wetterbedingungen angezeigt werden. Die App verwendet die Open-Meteo API, um aktuelle Wetterdaten abzurufen, und bietet eine intuitive Benutzeroberfläche zum Hinzufügen und Verwalten von Aufgaben.

## Features

- **PWA-Unterstützung**: Installieren Sie die App auf Ihrem Homescreen und verwenden Sie sie wie eine native App.
- **Wetterbasierte Aufgaben**: Fügen Sie Aufgaben hinzu, die nur bei bestimmten Wetterbedingungen angezeigt werden.
- **Geolocation-Unterstützung**: Die App verwendet Ihre aktuelle Position, um die Wetterdaten abzurufen.
- **Benutzerfreundliche Oberfläche**: Einfaches Hinzufügen, Bearbeiten und Löschen von Aufgaben.
- **Lokale Speicherung**: Aufgaben werden im Local Storage Ihres Browsers gespeichert.


## Verwendung

1. **Aufgabe hinzufügen**:
    - Klicken Sie auf den Button **"Aufgabe Hinzufügen"**.
    - Geben Sie die Aufgabe, eine Beschreibung, die Mindesttemperatur und den Regenstatus ein.
    - Klicken Sie auf **"Speichern"**, um die Aufgabe hinzuzufügen.

2. **Aufgabe anzeigen**:
    - Passende Aufgaben werden basierend auf dem aktuellen Wetter angezeigt.
    - Alle Aufgaben können durch Klicken auf **"Alle Aufgaben anzeigen"** eingesehen werden.

3. **Aufgabe löschen**:
    - Klicken Sie auf den **"Löschen"**-Button neben der Aufgabe, um sie zu entfernen.

## Technologien

- **HTML**: Struktur der Anwendung.
- **CSS**: Styling der Anwendung.
- **JavaScript**: Logik und Interaktivität der Anwendung.
- **Service Worker**: Ermöglicht PWA-Funktionalität.
- **Open-Meteo API**: Abfrage aktueller Wetterdaten.

## Manifest und Service Worker

Die App ist als PWA konfiguriert und enthält die folgenden Dateien:

- **manifest.json**: Enthält Metadaten zur Konfiguration der PWA.
- **sw.js**: Service Worker für das Caching und Offline-Unterstützung.

## Beispielbild

![screenshot](https://github.com/user-attachments/assets/68b593d4-14cc-4659-a9fb-8abb642a78fc)



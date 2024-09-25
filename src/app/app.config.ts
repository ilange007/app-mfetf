import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from '../app/app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { environment } from '../environments/environment';
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Enrutamiento con la vinculación de inputs de los componentes
    provideRouter(routes, withComponentInputBinding()),

     // Configuración de Firebase (la configuración se movió a environment.ts para mayor limpieza)
     provideFirebaseApp(() => initializeApp(environment.firebaseConfig)), // Usar environment.firebaseConfig si lo tienes configurado en environment.ts
     provideAuth(() => getAuth(initializeApp(environment.firebaseConfig))),
     provideDatabase(() => getDatabase())
  ]
};

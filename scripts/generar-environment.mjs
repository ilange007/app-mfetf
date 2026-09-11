#!/usr/bin/env node
// Genera src/environments/environment.ts a partir de la configuración web de
// Firebase que llega en la variable de entorno FIREBASE_CONFIG (un JSON).
//
//   FIREBASE_CONFIG='{"apiKey":"…","projectId":"…"}' \
//     node scripts/generar-environment.mjs [--production]
//
// Existe porque src/environments/ está en .gitignore (docs/arquitectura.md §11.1):
// ni el runner de CI ni una clonación limpia tienen ese archivo, y sin él
// `ng build` falla al importarlo desde app.config.ts.
//
// En CI el JSON viene de un secret del repositorio:
//   FIREBASE_CONFIG_PROD     → producción (tfemf-839ad)
//   FIREBASE_CONFIG_STAGING  → staging    (tfemfdev)

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const DESTINO = 'src/environments/environment.ts';
const CLAVES_REQUERIDAS = ['apiKey', 'authDomain', 'projectId', 'appId'];

const crudo = process.env.FIREBASE_CONFIG;
if (!crudo || !crudo.trim()) {
  console.error(
    'ERROR: falta la variable de entorno FIREBASE_CONFIG.\n' +
      'En CI viene de un secret del repositorio (FIREBASE_CONFIG_PROD o\n' +
      'FIREBASE_CONFIG_STAGING). En local, expórtala antes de ejecutar.',
  );
  process.exit(1);
}

let firebaseConfig;
try {
  firebaseConfig = JSON.parse(crudo);
} catch (error) {
  // No imprimimos el valor: puede traer la apiKey y acabaría en los logs.
  console.error(`ERROR: FIREBASE_CONFIG no es un JSON válido (${error.message}).`);
  process.exit(1);
}

const faltantes = CLAVES_REQUERIDAS.filter((clave) => !firebaseConfig[clave]);
if (faltantes.length > 0) {
  console.error(`ERROR: a FIREBASE_CONFIG le faltan estas claves: ${faltantes.join(', ')}.`);
  process.exit(1);
}

const production = process.argv.includes('--production');

mkdirSync(dirname(DESTINO), { recursive: true });
writeFileSync(
  DESTINO,
  `// Archivo generado por scripts/generar-environment.mjs — no lo edites a mano.
export const environment = {
  production: ${production},
  firebaseConfig: ${JSON.stringify(firebaseConfig, null, 2).replace(/\n/g, '\n  ')},
};
`,
);

// projectId no es secreto: viaja en el bundle público. Sirve para confirmar
// en el log de CI que se desplegó contra el proyecto que tocaba.
console.log(`${DESTINO} generado · proyecto "${firebaseConfig.projectId}" · production: ${production}`);

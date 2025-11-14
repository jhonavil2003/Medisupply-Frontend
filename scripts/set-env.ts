// Script para cargar variables de entorno desde .env
// Este archivo se ejecuta antes del build de Angular

import * as dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

// Cargar variables de entorno desde .env
dotenv.config();

// Obtener el modo (development o production)
const isProd = process.argv.includes('--prod');

// Construir el objeto de entorno
const environment = {
  production: isProd,
  catalogApiUrl: isProd 
    ? 'http://lb-catalog-service-11171664.us-east-1.elb.amazonaws.com'
    : (process.env['CATALOG_BASE_URL'] || 'http://localhost:3001'),
  logisticsApiUrl: isProd
    ? 'http://lb-logistics-service-1435144637.us-east-1.elb.amazonaws.com'
    : (process.env['LOGISTICS_BASE_URL'] || ''),
  salesApiUrl: isProd
    ? 'http://lb-sales-service-570996197.us-east-1.elb.amazonaws.com/'
    : (process.env['SALES_BASE_URL'] || ''),
  googleMapsApiKey: process.env['GOOGLE_MAPS_API_KEY'] || ''
};

// Generar el contenido del archivo
const content = `// Este archivo es generado automáticamente por set-env.ts
// NO EDITAR MANUALMENTE - Los cambios serán sobrescritos

export const environment = ${JSON.stringify(environment, null, 2)};
`;

// Determinar la ruta del archivo de destino
const targetPath = isProd
  ? resolve(__dirname, '../src/environments/environment.prod.generated.ts')
  : resolve(__dirname, '../src/environments/environment.generated.ts');

// Escribir el archivo
writeFileSync(targetPath, content, { encoding: 'utf-8' });

console.log(`✅ Variables de entorno cargadas para modo: ${isProd ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
console.log(`📝 Archivo generado: ${targetPath}`);
console.log(`🔑 Google Maps API Key configurada: ${environment.googleMapsApiKey ? 'Sí' : 'No'}`);

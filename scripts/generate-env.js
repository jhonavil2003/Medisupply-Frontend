#!/usr/bin/env node

/**
 * Script para generar env.json desde .env
 * Este script lee el archivo .env y crea un archivo JSON
 * que puede ser servido como asset estático
 */

const fs = require('fs');
const path = require('path');

// Ruta del archivo .env
const envPath = path.resolve(__dirname, '../.env');
const outputPath = path.resolve(__dirname, '../src/assets/env.json');

console.log('🔄 Generando archivo de configuración de entorno...');

// Verificar si existe el archivo .env
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: No se encontró el archivo .env');
  console.log('💡 Crea un archivo .env basado en .env.example');
  process.exit(1);
}

// Leer el archivo .env
const envContent = fs.readFileSync(envPath, 'utf-8');

// Parsear el contenido
const envVars = {};
envContent.split('\n').forEach(line => {
  // Ignorar comentarios y líneas vacías
  if (line.trim() && !line.trim().startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    
    if (key && value) {
      envVars[key.trim()] = value;
    }
  }
});

// Crear el objeto de configuración
const config = {
  GOOGLE_MAPS_API_KEY: envVars.GOOGLE_MAPS_API_KEY || '',
  CATALOG_BASE_URL: envVars.CATALOG_BASE_URL || '',
  LOGISTICS_BASE_URL: envVars.LOGISTICS_BASE_URL || '',
  SALES_BASE_URL: envVars.SALES_BASE_URL || ''
};

// Escribir el archivo JSON
fs.writeFileSync(outputPath, JSON.stringify(config, null, 2), 'utf-8');

console.log('✅ Archivo env.json generado exitosamente');
console.log(`📁 Ubicación: ${outputPath}`);
console.log('\n📋 Configuración cargada:');
console.log(`   - Google Maps API Key: ${config.GOOGLE_MAPS_API_KEY ? '✓ Configurada' : '✗ No configurada'}`);
console.log(`   - Catalog Base URL: ${config.CATALOG_BASE_URL || '(usar por defecto)'}`);
console.log(`   - Logistics Base URL: ${config.LOGISTICS_BASE_URL || '(usar por defecto)'}`);
console.log(`   - Sales Base URL: ${config.SALES_BASE_URL || '(usar por defecto)'}`);
console.log('');

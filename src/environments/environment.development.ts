// Environment para desarrollo
// Configurado para usar el backend de AWS

// Para usar AWS (actual):
const baseUrl = 'http://lb-catalog-service-11171664.us-east-1.elb.amazonaws.com'

// Para usar localhost (comentar la línea de arriba y descomentar esta):
// const baseUrl = 'http://localhost:3001'

export const environment = {
    production: true,
    baseUrl,
    catalogApiUrl: 'http://localhost:3001'
};

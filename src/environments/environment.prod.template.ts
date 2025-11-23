export const environment = {
  production: true,
  catalogApiUrl: 'http://lb-catalog-service-11171664.us-east-1.elb.amazonaws.com',
  logisticsApiUrl: 'http://lb-logistics-service-1435144637.us-east-1.elb.amazonaws.com',
  salesApiUrl: 'http://lb-sales-service-570996197.us-east-1.elb.amazonaws.com',
  googleMapsApiKey: '__API_KEY__',
  cognito: {
    region: 'us-east-1',
    userPoolId: '__USER_POOL_ID__',
    userPoolClientId: '__USER_POOL_CLIENT_ID__',
  }
};

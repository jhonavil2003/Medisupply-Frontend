import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import {environment} from "./environments/environment";
import {Amplify} from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: environment.cognito.userPoolId,
      userPoolClientId: environment.cognito.userPoolClientId,
      // No necesitamos loginWith aquí porque la web no hace sign-in
    }
  }
});


bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));

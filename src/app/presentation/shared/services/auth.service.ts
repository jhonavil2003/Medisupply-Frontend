import { Injectable } from '@angular/core';
import {
  signUp,
  confirmSignUp,
  resendSignUpCode
} from 'aws-amplify/auth';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  async register(input: {
    userName: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    territory: string;
  }) {
    // Importante: autoSignIn en false para NO iniciar sesión en la web
    return await signUp({
      username: input.userName,
      password: "Password123!",
      options: {
        autoSignIn: false,
        userAttributes: {
          phone_number: input.phone,
          email: input.email,
          'custom:first_name': input.firstName,
          'custom:last_name': input.lastName,
          'custom:role': 'SELLER',
          'custom:territory': input.territory
        }
      }
    });
  }

  async confirm(username: string, code: string) {
    return await confirmSignUp({ username, confirmationCode: code });
  }

  async resend(username: string) {
    return await resendSignUpCode({ username });
  }
}

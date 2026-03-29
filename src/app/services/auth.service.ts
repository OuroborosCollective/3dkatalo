import { Injectable, inject } from '@angular/core';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { auth } from '../firebase';
import { BehaviorSubject } from 'rxjs';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  isAuthReady$ = new BehaviorSubject<boolean>(false);

  private dataService = inject(DataService);

  constructor() {
    onAuthStateChanged(auth, (user: User | null) => {
      this.userSubject.next(user);
      this.isAuthReady$.next(true);
      if (user) {
        this.dataService.initRealtime();
      }
    });
  }

  async login() {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
}

import { Injectable } from '@angular/core';
import {GoogleAuthProvider, Auth, User, user, signOut, signInWithPopup} from '@angular/fire/auth'
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Esto asegura que el servicio esté disponible globalmente
})
export class LoginsvcService {
  usrGoogle: Observable<User | null>;
  usr = new Usuario;
  

  constructor(private aut:Auth, private router:Router) {
    this.usrGoogle = user(this.aut);
  }

  //Detectar Credenciales
  detectarCredenciales(){
    this.usrGoogle.subscribe(user => {
      if(user){
        this.usr.uid+=user?.uid;
        //this.usr.displayName+=user?.displayName;
        //this.usr.email+=user?.email;
        this.usr.photoURL="";
        this.usr.photoURL+=user?.photoURL;
      }
      else this.router.navigate(['/login']);
    })
  }

  // Iniciar sesión con Google
  loginWithGooglePop() {
    return signInWithPopup(this.aut, new GoogleAuthProvider())
  }
  logout(){
    return signOut(this.aut)
  }
  //Controlar Rutas Permitidas
  controlarRuta(){
    console.log(this.router.url);
    if (["/solicitudes"].includes(this.router.url)) 
      this.router.navigate(['/']);
  }
}

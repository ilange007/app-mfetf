import { Injectable } from '@angular/core';
import {GoogleAuthProvider, Auth, User, user, signOut, signInWithPopup} from '@angular/fire/auth'
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario';
import { Observable } from 'rxjs';
import { FirestoreService } from '../services/firestore.service';

@Injectable({
  providedIn: 'root' // Esto asegura que el servicio esté disponible globalmente
})
export class LoginsvcService {
  usrGoogle: Observable<User | null>;
  usr = new Usuario;
  distritoId: string = "";

  constructor(private aut:Auth, private router:Router, public firestoreService: FirestoreService) {
    this.usrGoogle = user(this.aut);
  }

  //Detectar Credenciales
  detectarCredenciales(){
    this.usrGoogle.subscribe(user => {
      if(user){
        this.firestoreService.getRecordById('Usuarios', user.uid).subscribe((data: any) => {
          if (data) {
            this.usr.uid = user?.uid;
            this.usr.idPersona = data.personaId;
            this.usr.photoURL = user?.photoURL;//data.photoURL;
            this.usr.email = user?.email;//data.email;
            this.usr.roles = data.roles;            
            this.distritoId = data.roles[0].idDistrito;//Hacer codigo para el caso de que haya más de un rol
          }
          else this.router.navigate(['/login']);
        });
      }
      else this.router.navigate(['/login']);
    })
  }

  // Iniciar sesión con Google
  loginWithGooglePop() {
    return signInWithPopup(this.aut, new GoogleAuthProvider())
  }
  logout(){
    this.usr = new Usuario();
    this.router.navigate(['/login']);
    return signOut(this.aut)
  }
  //Controlar Rutas Permitidas
  controlarRuta(){    
    if (["/solicitudes"].includes(this.router.url)) 
      this.router.navigate(['/']);
  }
}

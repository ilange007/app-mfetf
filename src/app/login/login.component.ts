import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginsvcService } from '../services/loginsvc.service';
import { User, user } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  user: User | null = null;
  private userSubscription: Subscription | null = null;

  constructor(private loginService: LoginsvcService, private router:Router) {}

  ngOnInit(): void {
    // Suscribirse al observable del servicio de autenticación para obtener el estado del usuario
    this.userSubscription = this.loginService.usrGoogle.subscribe((user) => {
      this.user = user;            
    });
  }

  // Iniciar sesión con Google
  login(): void {
    this.loginService.loginWithGooglePop().then((result) => {      
      this.router.navigate(['/']);
    }).catch((error) => {
      console.error("Error en autenticación:", error);
    });
  }

  // Cerrar sesión
  logout(): void {
    this.loginService.logout().then(() => {
      console.log("Usuario desautenticado");
      this.user = null; // Limpia el estado del usuario en el componente
    }).catch((error) => {
      console.error("Error al cerrar sesión:", error);
    });
  }

  // Limpiar la suscripción al destruir el componente
  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
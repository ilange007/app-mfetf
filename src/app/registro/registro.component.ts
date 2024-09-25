import { Component } from '@angular/core';
import { LoginsvcService } from '../services/loginsvc.service';


@Component({
  selector: 'app-registro',
  standalone: true,
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  constructor(public loginService: LoginsvcService) {}
  loginClick(){
    this.loginService.loginWithGooglePop()
  }
  showButtonLogin = true;
  onClick() {
    this.showButtonLogin = false;
  }
}

import { Component } from '@angular/core';
import { LoginsvcService } from '../services/loginsvc.service';
import { FirestoreService } from '../services/firestore.service';
import { Distrito } from '../models/distrito';
import { Usuario } from '../models/usuario';

@Component({
  selector: 'app-registro',
  standalone: true,
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  newRecord = { name: 'Nuevo', email: 'ilange' };  // Un ejemplo de registro
  constructor(public loginService: LoginsvcService, private firestoreService: FirestoreService) {
    this.firestoreService.getRecords().subscribe(records => {
      records.forEach(record => {
        console.log(record);
      });
    });
  }
  loginClick(){
    this.loginService.loginWithGooglePop()
  }
  showButtonLogin = true;
  onClick() {
    this.showButtonLogin = false;
  }
  crearDistrito(){
    this.firestoreService.createRecord(new Usuario);
  }
}

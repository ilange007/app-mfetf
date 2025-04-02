import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirestoreService } from '../services/firestore.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoginsvcService } from '../services/loginsvc.service';

@Component({
  selector: 'app-familias',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './familias.component.html',
  styleUrl: './familias.component.css'
})
export class FamiliasComponent {
  @Output() selectFamilia = new EventEmitter<any>();  
  familias: any[] = [];
  formFamilia: FormGroup = new FormGroup({
    nombre: new FormControl('',[Validators.required, Validators.minLength(3)]),
  });

  constructor(private firestoreService: FirestoreService, private router: Router, private loginSvc: LoginsvcService) {}

  ngOnInit(): void {
    if (this.loginSvc.usr.roles[0]?.nombreRol != "SuperAdmin") this.router.navigate(['/login']); // Redirigir a la página de inicio de sesión si el rol no está permitido
  }

  onFamiliaSubmit() {
    if (this.formFamilia.valid) {
      this.formFamilia.value.nombre = this.formFamilia.value.nombre.toUpperCase();
      this.firestoreService.createRecord('Familias', this.formFamilia.value);
    }
    else console.log('Formulario inválido');
  }

  search() {
    if (this.formFamilia.value.nombre.length < 3) {
      this.familias = [];
      return;
    }
    else {
      const searchTerm = this.formFamilia.value.nombre ? this.formFamilia.value.nombre.toLowerCase() : '';
      this.firestoreService.getRecords('Familias').subscribe(records => {
        this.familias = records.filter(record => 
          record.nombre.toLowerCase().includes(searchTerm)
        );
      });
    }
  }
  select(familia: any) {
    this.selectFamilia.emit(familia);
  }  
  openFamilia() {    
    //Obtener el idFamilia de la familia seleccionada y pasarlo al componente Familia
    const idFamilia = this.familias[0].id;    
    this.router.navigate(['/familia', idFamilia]);
  }
}

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../services/firestore.service';
import { LoginsvcService } from '../services/loginsvc.service';

@Component({
  selector: 'app-personas',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './personas.component.html',
  styleUrl: './personas.component.css'
})

export class PersonasComponent implements OnInit {
  personaForm!: FormGroup;
  pathFiresotre: string = "";

  constructor(public firestoreService: FirestoreService, private loginSvc:LoginsvcService) {
    this.pathFiresotre = "Distritos/" + this.loginSvc.distritoId + "/Personas";
  }

  ngOnInit() {
    this.personaForm = new FormGroup({
      id: new FormControl(''),
      familiaId: new FormControl(''),
      roles: new FormArray([]),
      nombre: new FormControl(''),
      paterno: new FormControl(''),
      materno: new FormControl(''),
      fechaNac: new FormControl(''),
      sexo: new FormControl(''),
      telefono: new FormControl(''),
      direccion: new FormControl(''),
      correo: new FormControl(''),
      estadosSalud: new FormArray([]),
      habilidades: new FormArray([]),
      activo: new FormControl(false)
    });    
  }

  get roles() {
    return this.personaForm.get('roles') as FormArray;
  }

  get estadosSalud() {
    return this.personaForm.get('estadosSalud') as FormArray;
  }

  get habilidades() {
    return this.personaForm.get('habilidades') as FormArray;
  }

  addRol() {
    this.roles.push(new FormGroup({
      rol: new FormControl(''),
      descripcion: new FormControl('')
    }));
  }

  addEstadoSalud() {
    this.estadosSalud.push(new FormGroup({
      elemento: new FormControl(''),
      valor: new FormControl(''),
      fecha: new FormControl(''),
      url: new FormControl('')
    }));
  }

  addHabilidad() {
    this.habilidades.push(new FormGroup({
      habilidad: new FormControl(''),
      descripcion: new FormControl('')
    }));
  }

  onSubmit() {
    this.personaForm.get('familiaId')?.setValue("LangeV");
    const formValues = this.personaForm.value;
    this.firestoreService.createRecord(this.pathFiresotre,formValues);
  }
}
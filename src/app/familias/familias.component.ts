import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../services/firestore.service';

@Component({
  selector: 'app-familias',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './familias.component.html',
  styleUrl: './familias.component.css'
})
export class FamiliasComponent implements OnInit {
  familiaForm!: FormGroup;
  pathFiresotre: string = "Familias";

  constructor(public firestoreService: FirestoreService) {}

  ngOnInit() {
    this.familiaForm = new FormGroup({
      id: new FormControl(''),
      nombre: new FormControl(''),
      direccion: new FormControl(''),
      ubicacion: new FormControl(''),
      miembros: new FormArray([])
    });
  }

  get miembros() {
    return this.familiaForm.get('miembros') as FormArray;
  }

  addMiembro() {
    this.miembros.push(new FormControl(''));
  }

  onSubmit() {
    const formValues = this.familiaForm.value;
    this.firestoreService.createRecord(this.pathFiresotre,formValues);
  }
}

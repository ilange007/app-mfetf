import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../services/firestore.service';
import { Distrito } from '../models/distrito';

@Component({
  selector: 'app-distritos',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './distritos.component.html',
  styleUrl: './distritos.component.css'
})
export class DistritosComponent {
  searchTerm: string = '';
  data: Distrito[]= [];/*[
    {nombre:"D1",geografia:"lat-long",id:"1",usuarios:["admi","otr"]},
    {nombre:"D2",geografia:"lat-long",id:"10",usuarios:["admi","otr"]},
  ];*/

  constructor(private firestoreService:FirestoreService){
    //Datos desde Firestore
    this.firestoreService.getRecords("").subscribe(records => {
      this.data = records.map(record => new Distrito(record)); // Convierte cada registro en una instancia de Distrito      
    });
  }

  // Datos simulados para mostrar en la tabla
  /*data = [
    { beneficiarios: 'Juán Daniel', voluntario: 'Juán Daniel', aportante: 'Flia Alarcón', tipo: 'Normal', estado: 'Activo' },
    { aportante: 'Julio', voluntario: 'Juán Daniel', beneficiarios: 'Flia Martha', tipo: 'Especial', estado: 'Activo' },
    { aportante: 'Mary Cruz', voluntario: 'Pedro', beneficiarios: 'Flia Eduardo', tipo: 'Normal', estado: 'Inactivo' },
    { aportante: 'Mary Cruz', voluntario: 'Mary Cruz', beneficiarios: 'Flia Julia', tipo: 'Normal', estado: 'Activo' },
    { aportante: 'Julio', voluntario: 'Pedro', beneficiarios: 'Flia Ana', tipo: 'Normal', estado: 'Activo' }
  ];*/  

  //data = this.registros;

  // Columnas dinámicas basadas en los datos
  //columns: (keyof typeof this.data[0])[] = Object.keys(this.data[0]) as (keyof typeof this.data[0])[];
  //columns: (keyof Distrito)[] = [];
  columns: (keyof Distrito)[] = ['nombre']; // Define las columnas relevantes.
  
  // Variables para ordenar
  sortColumn!: keyof typeof this.data[0];// = "aportante";
  sortDirection: 'asc' | 'desc' | null = null;

  // Método para filtrar los datos según el término de búsqueda
  get filteredData() {
    let filtered = this.data.filter(item =>
      Object.values(item).some(val =>
        val.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    );
  
    if (this.sortColumn && this.sortDirection && this.isSortableColumn(this.sortColumn)) {
      filtered.sort((a, b) => {        
        const valA = a[this.sortColumn];
        const valB = b[this.sortColumn];
  
        if (valA < valB) {
          return this.sortDirection === 'asc' ? -1 : 1;
        } else if (valA > valB) {
          return this.sortDirection === 'asc' ? 1 : -1;
        } else {
          return 0;
        }
      });
    }
  
    return filtered;
  }
   // Función auxiliar para verificar que la columna es válida
   isSortableColumn(column: string): column is keyof typeof this.data[0] {
    return column in this.data[0];
  }
  

  // Método para ordenar por columna
  sort(column: typeof this.sortColumn) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-beneficiarios',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './beneficiarios.component.html',
  styleUrl: './beneficiarios.component.css'
})
export class BeneficiariosComponent {
  searchTerm: string = '';
  isFormVisible: boolean = false; // Variable para controlar la visibilidad del formulario
  selectedRecordIndex: number | null = null; // Índice de la fila seleccionada
  
  // Datos simulados para mostrar en la tabla
  data = [
    { beneficiarios: 'Juán Daniel', voluntario: 'Juán Daniel', aportante: 'Flia Alarcón', tipo: 'Normal', estado: 'Activo' },
    { aportante: 'Julio', voluntario: 'Juán Daniel', beneficiarios: 'Flia Martha', tipo: 'Especial', estado: 'Activo' },
    { aportante: 'Mary Cruz', voluntario: 'Pedro', beneficiarios: 'Flia Eduardo', tipo: 'Normal', estado: 'Inactivo' },
    { aportante: 'Mary Cruz', voluntario: 'Mary Cruz', beneficiarios: 'Flia Julia', tipo: 'Normal', estado: 'Activo' },
    { aportante: 'Julio', voluntario: 'Pedro', beneficiarios: 'Flia Ana', tipo: 'Normal', estado: 'Activo' }
  ];

  // Columnas dinámicas basadas en los datos
    columns: (keyof typeof this.data[0])[] = Object.keys(this.data[0]) as (keyof typeof this.data[0])[];

  // Variables para ordenar
  sortColumn!: keyof typeof this.data[0];// = "aportante";
  sortDirection: 'asc' | 'desc' | null = null;

  // Objeto para vincular el formulario
  newRecord: { [key: string]: string } = {};

  // Método para mostrar/ocultar el formulario
  toggleForm() {
    this.isFormVisible = !this.isFormVisible; // Alterna entre visible y no visible
  }

  // Método para agregar una nueva fila a la tabla
  addRecord() {
    this.data.push({ ...this.newRecord } as any); // Agregar el nuevo registro
    this.newRecord = {}; // Reiniciar el formulario
    this.isFormVisible = false; // Ocultar el formulario después de agregar
  }

   // Método para seleccionar una fila y cargar los datos en el formulario
   selectRecord(record: { [key: string]: string }, index: number) {
    this.newRecord = { ...record }; // Copiar los datos de la fila seleccionada al formulario
    this.selectedRecordIndex = index; // Guardar el índice de la fila seleccionada
    this.isFormVisible = true; // Mostrar el formulario automáticamente cuando se selecciona una fila
  }

  // Método para agregar o actualizar una fila en la tabla
  addOrUpdateRecord() {
    if (this.selectedRecordIndex !== null) {
      // Si hay una fila seleccionada, actualiza esa fila
      this.data[this.selectedRecordIndex] = { ...this.newRecord } as unknown as typeof this.data[0];
    } else {
      // Si no hay una fila seleccionada, agrega una nueva fila
      this.data.push({ ...this.newRecord } as any);
    }
    this.limpiarForm();
  }

  limpiarForm(){
    this.newRecord = {}; // Reiniciar el formulario
    this.isFormVisible = false; // Ocultar el formulario después de guardar
    this.selectedRecordIndex = null; // Reiniciar el índice de selección
  }

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

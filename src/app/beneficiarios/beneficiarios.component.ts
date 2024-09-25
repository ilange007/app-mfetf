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
  // Datos simulados para mostrar en la tabla
  data = [
    { aportante: 'Juán Daniel', voluntario: 'Juán Daniel', beneficiarios: 'Flia Alarcón', tipo: 'Normal', estado:'Activo' },
    { aportante: 'Julio', voluntario: 'Juán Daniel', beneficiarios: 'Flia Martha', tipo: 'Especial', estado:'Activo' },
    { aportante: 'Mary Cruz', voluntario: 'Pedro', beneficiarios: 'Flia Eduardo', tipo: 'Normal', estado:'Inactivo' },
    { aportante: 'Mary Cruz', voluntario: 'Mary Cruz', beneficiarios: 'Flia Julia', tipo: 'Normal', estado:'Activo' },
    { aportante: 'Julio', voluntario: 'Pedro', beneficiarios: 'Flia Ana', tipo: 'Normal', estado:'Activo' },
    
  ];

  // Método para filtrar los datos según el término de búsqueda
  get filteredData() {
    return this.data.filter(item =>
      item.aportante.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      item.voluntario.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      item.beneficiarios.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      item.tipo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      item.estado.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}

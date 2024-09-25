import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-canasta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './canasta.component.html',
  styleUrl: './canasta.component.css'
})
export class CanastaComponent {
  searchTerm: string = '';
  // Datos simulados para mostrar en la tabla
  data = [
    { tipo: 'Normal', numBeneficiarios: 60, proyeccion: 153, subTotal:9180 },
    { tipo: 'Especial 1', numBeneficiarios: 14, proyeccion: 175, subTotal:2450 },
    { tipo: 'Especial 2', numBeneficiarios: 6, proyeccion: 190, subTotal:1140 },
  ];

  // Método para filtrar los datos según el término de búsqueda
  get filteredData() {
    return this.data.filter(item =>
      item.tipo.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}

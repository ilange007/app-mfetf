import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-entregas',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './entregas.component.html',
  styleUrl: './entregas.component.css'
})
export class EntregasComponent {
  searchTerm: string = '';
  // Datos simulados para mostrar en la tabla
  data = [
    { completo: 'Juán Daniel', numBeneficiarios: 4, tipo: 'Normal', estado:'Recogido' },
    { completo: 'Julio', numBeneficiarios: 3, tipo: 'Especial', estado:'Recogido' },
    { completo: 'Mary Cruz', numBeneficiarios: 2, tipo: 'Normal', estado:'Recogido' },    
    { completo: 'Mary Cruz', numBeneficiarios: 1, tipo: 'Especial', estado:'Recogido' },
    { completo: 'Pedro', numBeneficiarios: 5, tipo: 'Normal', estado:'Recogido' },
  ];

  // Método para filtrar los datos según el término de búsqueda
  get filteredData() {
    return this.data.filter(item =>
      item.completo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      item.estado.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      item.tipo.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}

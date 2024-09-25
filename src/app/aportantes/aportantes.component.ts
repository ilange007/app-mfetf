import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-aportantes',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './aportantes.component.html',
  styleUrl: './aportantes.component.css'
})
export class AportantesComponent {
  searchTerm: string = '';
  // Datos simulados para mostrar en la tabla
  data = [
    { completo: 'Juán Daniel', numBeneficiarios: 4, estado: 'Pagado', mes:'oct' },
    { completo: 'Mary Cruz', numBeneficiarios: 2, estado: 'Pagado', mes:'oct' },
    { completo: 'Julio', numBeneficiarios: 3, estado: 'Debe', mes:'ago' },
    { completo: 'Andrea Romero', numBeneficiarios: 1, estado: 'Debe', mes:'oct' },
    { completo: 'Pedro', numBeneficiarios: 5, estado: 'Pagado', mes:'oct' },
  ];

  // Método para filtrar los datos según el término de búsqueda
  get filteredData() {
    return this.data.filter(item =>
      item.completo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      item.estado.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      item.mes.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}

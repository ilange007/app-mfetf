import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../services/firestore.service';
import { LoginsvcService } from '../services/loginsvc.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-medicamentos',
  standalone: true,
  imports: [
      FormsModule,
      CommonModule,
      ReactiveFormsModule,      
    ],
  templateUrl: './medicamentos.component.html',
  styleUrl: './medicamentos.component.css'
})
export class MedicamentosComponent {
  pathFiresotre: string;
  searchTerm: string = ''; // Término de búsqueda para filtrar los datos
  data: any[] = [{ 
    //"id": "m001",
    "nombre": "Paracetamol",
    "principio_activo": "Paracetamol 500mg",
    "concentracion": "500 mg",
    "stock": 150,
    "laboratorio": "Genfar",
    "categoria": "Analgésico",
    "presentacion": "Tabletas",
    //“stock_minimo": 20,
    //“lote": "L-2025-ABC",
    "fecha_vencimiento": "2025-12-31",
    //“precio_compra": 0.50,
    //“precio_venta": 1.20,
    "requiere_receta": false,
    //“codigo_barras": "123456789012",
    "ubicacion": "Estante A3"
  }];

  constructor(public firestoreService: FirestoreService, private router:Router, private loginSvc: LoginsvcService) {
    loginSvc.detectarCredenciales();
    this.pathFiresotre= "Distritos/" + this.loginSvc.distritoId + "/Medicamentos"; // Ruta de la colección de Firestore
  }

  ngOnInit() {
    if (""==this.loginSvc.distritoId) this.router.navigate(['/login']); // Redirigir a la página de inicio de sesión si no hay un distrito seleccionado
    // Obtener los Aportantes de la colección de Firestore
    this.firestoreService.getRecords(this.pathFiresotre).subscribe(records => {      
      this.data = records.map(record => ({
        id: record.id,
        nombre: record.nombre,
        principio_activo: record.principio_activo,
        laboratorio: record.laboratorio,
        categoria: record.categoria,
        presentacion: record.presentacion,
        concentracion: record.concentracion,
        stock: record.stock,
        stock_minimo: record.stock_minimo,
        lote: record.lote,
        fecha_vencimiento: record.fecha_vencimiento,
        precio_compra: record.precio_compra,
        precio_venta: record.precio_venta,
        requiere_receta: record.requiere_receta,
        codigo_barras: record.codigo_barras,
        ubicacion: record.ubicacion,
      }));
    });

  }

  // Columnas dinámicas basadas en los datos
  columns: (keyof typeof this.data[0])[] = Object.keys(this.data[0]) as (keyof typeof this.data[0])[];
  // Variables para ordenar
  sortColumn!: keyof typeof this.data[0];// = "aportante";
  sortDirection: 'asc' | 'desc' | null = null;
  // Objeto para vincular el formulario
  newRecord: { [key: string]: string } = {};
  // Función auxiliar para verificar que la columna es válida
  isSortableColumn(column: keyof typeof this.data[0]): column is keyof typeof this.data[0] {
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
  // Método para filtrar los datos según el término de búsqueda
  get filteredData() {
    let filtered = this.data.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(this.searchTerm.toLowerCase())
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

  addItem() {
    // Crear un nuevo objeto con valores predeterminados
    const newItem = {
      nombre: 'Desparangüatirimicuarodol',
      principio_activo: 'Desparangüatirimicuarodolodina',
      laboratorio: 'Genfar',
      categoria: 'Analgésico',
      presentacion: 'Tabletas',
      concentracion: '500 mg',
      stock: 0,
      stock_minimo: 0,
      lote: 'L-2025-ABC',
      fecha_vencimiento: 'año-mes-dia',
      precio_compra: 0,
      precio_venta: 0,
      requiere_receta: false,
      codigo_barras: '123456789012',
      ubicacion: 'Estante A3',
    };

    // Agregar el nuevo objeto a la colección en Firestore
    this.firestoreService.createRecord(this.pathFiresotre, newItem)
      .then((docRef) => {
        // Agregar el nuevo registro a la lista local con su ID asignado por Firestore
        this.data.push({ ...newItem});
      })
      .catch((error) => {
        console.error('Error al agregar el nuevo registro a Firestore:', error);
      });
  }

  enableEdit(item: any): void {
    item.isEditing = true;
    item.originalData = { ...item }; // Guardar una copia de los datos originales
  }

  saveEdit(item: any): void {
    // Guardar los cambios en Firestore
    this.firestoreService.updateRecord(this.pathFiresotre, item.id, item)
    .catch((error) => {
        console.error('Error al actualizar los datos en Firestore:', error);
      });
  }

  cancelEdit(item: any): void {
    Object.assign(item, item.originalData); // Restaurar los datos originales
    item.isEditing = false;
    delete item.originalData;
  }
}

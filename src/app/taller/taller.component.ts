import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../services/firestore.service';
import { LoginsvcService } from '../services/loginsvc.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-taller',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,      
  ],
  templateUrl: './taller.component.html',
  styleUrl: './taller.component.css'
})
export class TallerComponent {
  
  
  pathFiresotre: string;
  searchTerm: string = ''; // Término de búsqueda para filtrar los datos
  data: any[] = [{ 
    //"id": "e001",
    "nombre": "Taladro Inalámbrico",
    "tipo": "Herramienta eléctrica",
    //"marca": "DeWalt",
    "modelo": "DCD771C2",
    "cantidad": 10,
    //"numero_serie": "SN-2023-4567",
    "estado": "Nuevo", // "Usado", "En reparación"
    "fecha_adquisicion": "2023-05-10",
    //"costo": 250.00,
    "vida_util": 5, // Años
    "ubicacion": "Almacén Taller",
    "responsable": "Juan Pérez", // Persona asignada
    //"fecha_mantenimiento": "2024-06-01", // Próximo mantenimiento
    //"garantia": true,
    //"fecha_fin_garantia": "2025-05-10"
  }];

  constructor(public firestoreService: FirestoreService, private router:Router, private loginSvc: LoginsvcService) {
    loginSvc.detectarCredenciales();
    this.pathFiresotre= "Distritos/" + this.loginSvc.distritoId + "/Enseres"; // Ruta de la colección de Firestore
  }

  ngOnInit() {
    if (""==this.loginSvc.distritoId) this.router.navigate(['/login']); // Redirigir a la página de inicio de sesión si no hay un distrito seleccionado
    // Obtener los Aportantes de la colección de Firestore
    this.firestoreService.getRecords(this.pathFiresotre).subscribe(records => {      
      this.data = records.map(record => ({
        id: record.id,
        nombre: record.nombre,
        tipo: record.tipo,
        modelo: record.modelo,
        cantidad: record.cantidad,
        estado: record.estado,
        fecha_adquisicion: record.fecha_adquisicion,
        vida_util: record.vida_util,
        ubicacion: record.ubicacion,
        responsable: record.responsable,
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
      //"id": "e001",
      nombre: "Taladro Inalámbrico",
      tipo: "Herramienta eléctrica",
      //"marca": "DeWalt",
      modelo: "DCD771C2",
      cantidad: 10,
      //"numero_serie": "SN-2023-4567",
      estado: "Nuevo", // "Usado", "En reparación"
      fecha_adquisicion: "2023-05-10",
      //"costo": 250.00,
      vida_util: 5, // Años
      ubicacion: "Almacén Taller",
      responsable: "Juan Pérez", // Persona asignada
      //"fecha_mantenimiento": "2024-06-01", // Próximo mantenimiento
      //"garantia": true,
      //"fecha_fin_garantia": "2025-05-10"
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

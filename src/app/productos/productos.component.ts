import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../services/firestore.service';
import { LoginsvcService } from '../services/loginsvc.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,      
  ],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent {
  
  pathFiresotre: string;
  searchTerm: string = ''; // Término de búsqueda para filtrar los datos
  data: any[] = [{ 
    //"id": "p001",
    "nombre": "Leche en Polvo",
    "marca": "Alpina",
    "categoria": "Lácteos",
    "presentacion": "Bolsa 500g",
    "unidad_medida": "gramos", // o "litros", "unidades"
    "contenido": 500,
    "stock": 80,
    "stock_minimo": 10,
    //"lote": "L-2024-XYZ",
    "fecha_vencimiento": "2024-10-15",
    "precio_compra": 2.80,
    "precio_venta": 4.50,
    //"impuesto": 0.19, // IVA o impuesto aplicable
    //"codigo_barras": "987654321098",
    "ubicacion": "Estante B2",
    "proveedor": "Distribuidora Alimentos S.A.",
    "perecedero": true // ¿Es perecedero?
  }];

  constructor(public firestoreService: FirestoreService, private router:Router, private loginSvc: LoginsvcService) {
    loginSvc.detectarCredenciales();
    this.pathFiresotre= "Distritos/" + this.loginSvc.distritoId + "/Productos"; // Ruta de la colección de Firestore
  }

  ngOnInit() {
    if (""==this.loginSvc.distritoId) this.router.navigate(['/login']); // Redirigir a la página de inicio de sesión si no hay un distrito seleccionado
    // Obtener los Aportantes de la colección de Firestore
    this.firestoreService.getRecords(this.pathFiresotre).subscribe(records => {      
      this.data = records.map(record => ({
        id: record.id,
        nombre: record.nombre,        
        marca: record.marca,
        categoria: record.categoria,
        presentacion: record.presentacion,
        unidad_medida: record.unidad_medida,
        contenido: record.contenido,
        stock: record.stock,
        stock_minimo: record.stock_minimo,
        //lote: record.lote,
        fecha_vencimiento: record.fecha_vencimiento,
        precio_compra: record.precio_compra,
        precio_venta: record.precio_venta,
        //impuesto: record.impuesto,
        //codigo_barras: record.codigo_barras,
        ubicacion: record.ubicacion,
        proveedor: record.proveedor,
        perecedero: record.perecedero,        
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
      nombre: "Leche en Polvo",
      marca: "Alpina",
      categoria: "Lácteos",
      presentacion: "Bolsa 500g",
      unidad_medida: "gramos", // o "litros", "unidades"
      contenido: 500,
      stock: 80,
      stock_minimo: 10,
      //lote: "L-2024-XYZ",
      fecha_vencimiento: "2024-10-15",
      precio_compra: 2.80,
      precio_venta: 4.50,
      //impuesto: 0.19, // IVA o impuesto aplicable
      //codigo_barras: "987654321098",
      ubicacion: "Estante B2",
      proveedor: "Distribuidora Alimentos S.A.",
      perecedero: true // ¿Es perecedero?
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

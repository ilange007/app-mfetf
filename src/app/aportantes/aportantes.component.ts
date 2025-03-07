import { Component, DebugElement, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../services/firestore.service';
import { LoginsvcService } from '../services/loginsvc.service';

@Component({
  selector: 'app-aportantes',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './aportantes.component.html',
  styleUrl: './aportantes.component.css'
})
export class AportantesComponent implements OnInit {
  searchTerm: string = ''; // Término de búsqueda para filtrar los datos
  isFormVisible: boolean = false; // Variable para controlar la visibilidad del formulario
  selectedRecordIndex: number | null = null; // Índice de la fila seleccionada
  formAportante!: FormGroup;
  data: any[] = [{ 
    Aportante: 'Flia Aportante',
    Beneficiarios:'Flias Beneficiarias',    
    Pagado: '2021-09-01',
    Estado: 'Activo',
  }];
  pathFiresotre: string = "";
  costoAporte: number = 150;

  constructor(public firestoreService: FirestoreService, private loginSvc: LoginsvcService) {
    this.pathFiresotre = "Distritos/" + this.loginSvc.distritoId + "/Aportantes";
  }

  cont: number = 0;
  ngOnInit() {
    this.formAportante = new FormGroup({
      idFamilia: new FormControl(''),
      nombreFam: new FormControl(''),
      estado: new FormControl('Activo'),
      beneficiarios: new FormArray([]),
      aportes: new FormArray([]),
      mesInicio: new FormControl('enero'),
      monto: new FormControl(),
      fliaBeneficiaria: new FormControl(''),
      pagado: new FormControl(''),
      debe: new FormControl(''),
    });

    // Obtén los registros de Firebase y asigna los datos a la variable data    
    this.firestoreService.getRecords(this.pathFiresotre).subscribe(records => {      
      this.data = records.map(record => ({        
        Aportante: this.firestoreService.getRecordById("Familias", record.idFamilia).subscribe(familia => { this.data[this.cont++].Aportante = familia.nombre; }),
        Beneficiarios: record.beneficiarios?.length,        
        Pagado: record.pagado,
        Estado: obtenerEstado(record.pagado),
      }));
      this.cont = 0;
    });
  }

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
  // Método para seleccionar una fila y cargar los datos en el formulario
  selectRecord(record: { [key: string]: string }, index: number) {
    this.newRecord = { ...record }; // Copiar los datos de la fila seleccionada al formulario
    this.selectedRecordIndex = index; // Guardar el índice de la fila seleccionada
    this.isFormVisible = true; // Mostrar el formulario automáticamente cuando se selecciona una fila
  }
  addAporte() {
    const aportes = this.formAportante.get('aportes') as FormArray;
    const mesInicio = new Date(this.formAportante.get('mesInicio')?.value);    
    const mesFin = new Date(mesInicio.getFullYear(), mesInicio.getMonth() + (this.formAportante.get('monto')?.value/this.costoAporte+1), 0);
    const mesRango = (mesInicio.getMonth()+1)+'/'+mesInicio.getFullYear() + ' a ' + mesFin.getMonth()+'/'+mesFin.getFullYear();        
    aportes.push(new FormControl({ id: aportes.length, mesCubierto: mesRango },));
    this.formAportante.get('pagado')?.setValue(mesRango);
    this.formAportante.get('debe')?.setValue(150-this.formAportante.get('monto')?.value%this.costoAporte);
    this.formAportante.get('mesInicio')?.setValue('');
    this.formAportante.get('monto')?.setValue('');
  }
  addBeneficiario() {
    const beneficiarios = this.formAportante.get('beneficiarios') as FormArray;    
    beneficiarios.push(new FormControl({id:0, nombreFam: this.formAportante.get('fliaBeneficiaria')?.value}));
    this.formAportante.get('fliaBeneficiaria')?.setValue('');
  }
  onSubmit() {
    const formValues = this.formAportante.value;
    const ids: string[]=[];
    formValues.estado = 'Activo';    
    this.firestoreService.createRecord("Familias", { nombre: formValues.nombreFam }).then((docRef) => {
      formValues.idFamilia = docRef;
      for(let i=0; i<formValues.beneficiarios.length; i++) {
        this.firestoreService.createRecord("Familias",{nombre: formValues.beneficiarios[i].nombreFam}).then((docRef) => {
          const beneficiarios = this.formAportante.get('beneficiarios') as FormArray;
          beneficiarios.controls[i].setValue(docRef);          
          ids.push(docRef);
        });
      }      
      this.firestoreService.createRecord(this.pathFiresotre, formValues).then((docRef) => {
        this.firestoreService.updateRecord(this.pathFiresotre, docRef, { beneficiarios: ids });
      });
      delete formValues.nombreFam;// borrar nombreFam de formValues
    }).catch((error) => {
      console.error("Error adding document: ", error);
    });    
    this.formAportante.reset();
    this.isFormVisible = false;
  }
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
}
function obtenerEstado(pagado: string): string {
  const hoy = new Date();//Fecha actual 
  const pm = parseInt((pagado?.split(' a ')[1])?.split('/')[0]);//Mes pagado
  const py = parseInt((pagado?.split(' a ')[1])?.split('/')[1]);//Año pagado
  if ((py>=hoy.getFullYear())&&(pm>=hoy.getMonth()+1)) {
    return 'Pagado';
  }
  else {
    return 'Debe';
  }
}


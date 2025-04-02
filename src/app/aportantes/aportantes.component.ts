import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../services/firestore.service';
import { LoginsvcService } from '../services/loginsvc.service';
import { Router } from '@angular/router';
import { FamiliasComponent } from '../familias/familias.component';

@Component({
  selector: 'app-aportantes',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    FamiliasComponent,
  ],
  templateUrl: './aportantes.component.html',
  styleUrl: './aportantes.component.css'
})
export class AportantesComponent implements OnInit {
  //idFliaAportante: string = '';
  idFliaBeneficiaria: string = '';
  indexAporte: number = -1;
  searchTerm: string = ''; // Término de búsqueda para filtrar los datos
  isFormVisible: boolean = false; // Variable para controlar la visibilidad del formulario
  selectedIdAportante: string = ''; // Índice de la fila seleccionada
  isModalVisible: boolean = false;
  isFamiliaAportante: boolean = false;
  formAportante!: FormGroup;
  data: any[] = [{ 
    Aportante: 'Flia Aportante',
    Beneficiarios:'Flias Beneficiarias',    
    Pago: 'Pago más reciente',
    Saldo: 'Saldo',
    Estado: 'Activo',
  }];
  pathFiresotre: string = "";
  costoAporte: number = 150;
  totalSaldos: number = 0;
  totalDeudores: number = 0;
  totalAportantes: number = 0;
  totalBeneficiarias: number = 0;

  constructor(public firestoreService: FirestoreService, private router:Router, private loginSvc: LoginsvcService) {
    loginSvc.detectarCredenciales();
    this.pathFiresotre= "Distritos/" + this.loginSvc.distritoId + "/Aportantes";
  }

  cont: number = 0;
  ngOnInit() {
    if (""==this.loginSvc.distritoId) this.router.navigate(['/login']); // Redirigir a la página de inicio de sesión si no hay un distrito seleccionado
    this.formAportante = new FormGroup({
      idAportante: new FormControl(''),
      idFamilia: new FormControl(''),
      nombreFam: new FormControl('',[Validators.required, Validators.minLength(3)]),//input del formulario
      estado: new FormControl('Activo'),
      beneficiarios: new FormArray([]),//select del formulario
      aportes: new FormArray([]),//select del formulario
      mesInicio: new FormControl(),//input del formulario
      monto: new FormControl(),//input del formulario
      depositante: new FormControl(),//input del formulario
      fechaDepo: new FormControl(),//input del formulario
      fliaBeneficiaria: new FormControl(''),//input del formulario
    });
    //
    // Obtener los Aportantes de la colección de Firestore
    this.firestoreService.getRecords(this.pathFiresotre).subscribe(records => {      
      this.data = records.map(record => ({
        idAportante: record.id,
        idFamilia: record.idFamilia,
        ListaAportes: record.aportes,
        ListaBeneficiarios: record.beneficiarios,
        Aportante: this.firestoreService.getRecordById("Familias", record.idFamilia).subscribe(familia => { this.data[this.cont++].Aportante = familia.nombre; }),
        Beneficiarios: record.beneficiarios?.length,        
        Pago: record.aportes?.length>0?record.aportes[0].mesCubierto:'',
        Saldo: obtenerSaldo(this.costoAporte,parseFloat(record.aportes?.length>0?record.aportes[0].saldo:'0'),record.aportes?.length>0?record.aportes[0].mesCubierto:'',record.beneficiarios?.length),
        //Estado: record.aportes?.length>0?obtenerEstado(record.aportes[record.aportes.length-1].mesCubierto):'',
        Estado: obtenerEstado(this.costoAporte,parseFloat(record.aportes?.length>0?record.aportes[0].saldo:'0'),record.aportes?.length>0?record.aportes[0].mesCubierto:'',record.beneficiarios?.length),
      }));
      this.cont = 0;
      this.totalSaldos = 0; // Restablecer totales
      this.totalDeudores = 0;
      this.totalAportantes = 0;
      this.totalBeneficiarias = 0;
      this.calcularTotales();// Calcular el total de saldos de los aportantes
    });    
  }
  // Método para calcular el total de saldos de los aportantes
  calcularTotales(){
    this.data.forEach((aportante: any) => {
      if (parseFloat(aportante.Saldo)>=0){
        this.totalBeneficiarias += aportante.Beneficiarios;
      }
      else this.totalDeudores++;
      this.totalAportantes++;      
    });
    this.totalSaldos += this.totalBeneficiarias*this.costoAporte;
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
    this.selectedIdAportante = ''; // Restablecer el índice de la fila seleccionada
    this.onReset(); // Restablecer el formulario    
  }
  //Metodo para abrir Modal de Familia Aportante
  onChangeFamiliaAportante() {
    this.isFamiliaAportante = true;
    this.isModalVisible = true;
    }
  // Método para seleccionar una fila y cargar los datos en el formulario
  selectRecord(record: { [key: string]: any }, index: number) {
    this.newRecord = { ...record }; // Copiar los datos de la fila seleccionada al formulario
    this.selectedIdAportante = record['idAportante'] || ''; // Guardar el índice de la fila seleccionada
    this.isFormVisible = true; // Mostrar el formulario automáticamente cuando se selecciona una fila    
    // Asignar los valores del registro seleccionado a los controles del formulario
    this.formAportante.patchValue({      
      idFamilia: record['idFamilia'] || '',
      nombreFam: record['Aportante'] || '',
      estado: record['Estado'] || 'Activo',      
    });
    // Limpiar y agregar beneficiarios al FormArray
    const beneficiarios = this.formAportante.get('beneficiarios') as FormArray;
    beneficiarios.clear();
    if (record['ListaBeneficiarios']) {
      const beneficiariosArray = record['ListaBeneficiarios'];
      beneficiariosArray.forEach((beneficiario: any) => {
        beneficiarios.push(new FormControl({id:(beneficiario.id !== undefined ? beneficiario.id : beneficiario), nombreFam: ''}));
      });
      beneficiariosArray.map((beneficiario: any, index: number) => {
        this.firestoreService.getRecordById("Familias", beneficiario.id !== undefined ? beneficiario.id : beneficiario).subscribe(familia => {
          beneficiarios.controls[index].setValue({id:(beneficiario.id !== undefined ? beneficiario.id : beneficiario), nombreFam: familia.nombre});
        });});
      this.formAportante.get('monto')?.setValue(this.costoAporte*beneficiarios.length);
    }
    // Limpiar y agregar aportes al FormArray
    const aportes = this.formAportante.get('aportes') as FormArray;    
    aportes.clear();
    if (record['ListaAportes']) {
      const aportesArray = record['ListaAportes'];      
      aportesArray.forEach((aporte: any) => {
        aportes.push(new FormControl(aporte));
      });
    }
  }
  // Método para agregar aportes al FormArray
  addAporte() {
    const aportes = this.formAportante.get('aportes') as FormArray;
    const nuevoSaldo = aportes.length>0?
      (this.formAportante.get('monto')?.value)-this.costoAporte*this.formAportante.value.beneficiarios.length+parseFloat(aportes.value[0].saldo)      
      :(this.formAportante.get('monto')?.value)-this.costoAporte*this.formAportante.value.beneficiarios.length;    
    const hoy = (new Date()).getFullYear()+'-'+((new Date()).getMonth()+1)+'-'+(new Date()).getDate();
    const nuevaFechaDepo = (this.formAportante.get('fechaDepo')?.value!=''&&this.formAportante.get('fechaDepo')?.value!=null)?this.formAportante.get('fechaDepo')?.value:hoy;
    //Cambiar por una función que cubra el rango de meses
    let mesInicio = (this.formAportante.get('mesInicio')?.value!=''&&this.formAportante.get('mesInicio')?.value!=null)?this.formAportante.get('mesInicio')?.value
      :aportes.length>0?calcularMeses(aportes.value[0].mesCubierto):hoy;
    mesInicio = mesInicio.split('-')[0]+'-'+mesInicio.split('-')[1];
    aportes.insert(0, new FormControl({ 
      id: aportes.length, 
      mesCubierto: mesInicio,// Almacenar datos del mes pagado, num de beneficiarios, monto, etc.
      saldo: nuevoSaldo,
      fechaDepo: nuevaFechaDepo,
      descripcion: this.formAportante.get('monto')?.value
        +' | '+mesInicio
        +' | NumBen: '+this.formAportante.value.beneficiarios.length
        +' | Saldo: '+ nuevoSaldo
        +' | '+this.formAportante.get('depositante')?.value
        +' | '+nuevaFechaDepo
        +' | Usr: '+this.loginSvc.usr.email
    },));
    this.formAportante.get('mesInicio')?.setValue('');
    this.formAportante.get('fechaDepo')?.setValue('');    
    this.formAportante.get('depositante')?.setValue('');
  }
  // Método para seleccionar un aporte
  onSelectAportesChange(event: any) {
    const selectedValues = Array.from(event.target.selectedOptions, (option: any) => option.value).reverse();
    this.indexAporte = selectedValues[0];//ERROR selecciona al reves
  }
  // Método para eliminar un aporte
  delAporte(){    
    const aportes = this.formAportante.get('aportes') as FormArray;
    aportes.removeAt(0);
  }
  // Método para agregar una flia beneficiaria al FormArray
  addBeneficiario() {
    this.showModal();
  }
  // Método para eliminar una flia beneficiaria
  delBeneficiario() {
    if (this.idFliaBeneficiaria != '') {
      //this.firestoreService.deleteRecord("Familias", this.idFliaBeneficiaria); No se debe eliminar una familia beneficiaria desde aquí
      const beneficiarios = this.formAportante.get('beneficiarios') as FormArray;
      const index = beneficiarios.controls.findIndex(control => control.value.id === this.idFliaBeneficiaria);
      if (index !== -1) {
        beneficiarios.removeAt(index);
        this.formAportante.get('monto')?.setValue(this.costoAporte*beneficiarios.length);
      }
      this.formAportante.get('fliaBeneficiaria')?.setValue('');
      this.idFliaBeneficiaria = '';
    }
  }
  // Método para seleccionar una flia beneficiaria
  onSelectBeneficiariosChange(event: any) {
    const selectedValues = Array.from(event.target.selectedOptions, (option: any) => option);    
    this.formAportante.get('fliaBeneficiaria')?.setValue(selectedValues[0].text);
    this.idFliaBeneficiaria = selectedValues[0].value;
  }
  // Método para actualizar el nombre de una flia beneficiaria
  updateBeneficiario() {
    this.firestoreService.updateRecord("Familias", this.idFliaBeneficiaria, { nombre: this.formAportante.get('fliaBeneficiaria')?.value });
    this.idFliaBeneficiaria = '';
    this.formAportante.get('fliaBeneficiaria')?.setValue('');
  }
  // Método para mostrar el modal
  showModal() {
    this.isModalVisible = true;
  }

  // Método para manejar la selección de una familia
  onFamiliaSelected(familia: any) {
    if (familia) {
      if(this.isFamiliaAportante) {
        this.formAportante.get('nombreFam')?.setValue(familia.nombre);
        this.formAportante.get('idFamilia')?.setValue(familia.id);
        this.isFamiliaAportante = false;
      }
      else {
        const beneficiarios = this.formAportante.get('beneficiarios') as FormArray;
        beneficiarios.push(new FormControl({ id: familia.id, nombreFam: familia.nombre }));
        this.formAportante.get('monto')?.setValue(this.costoAporte*beneficiarios.length);
      }
    }
    this.isModalVisible = false;
  }
  // Método para manejar el reset del formulario
  onReset() {
    (this.formAportante.get('aportes') as FormArray).clear(); // Limpiar el FormArray de aportes
    (this.formAportante.get('beneficiarios') as FormArray).clear(); // Limpiar el FormArray de beneficiarios
    this.formAportante.reset(); // Limpiar el formulario
  }
  // Método para enviar el formulario
  onSubmit() { // Hacer que no haya necesidad de addAporte
    if (this.selectedIdAportante !== '') {
      this.onUpdate();
    } else {
      this.onCreate();
    }
  }
  
  // Método para crear un nuevo registro
  onCreate() {
    if (this.formAportante.get('aportes')?.value.length==0) this.addAporte()// Agregar aportes de forma automática
    const formValues = this.formAportante.value;    
    formValues.estado = 'Activo';
    const IDs: any[] = [];
    (this.formAportante.get('beneficiarios') as FormArray).controls.forEach((beneficiario: any) => {
      IDs.push(beneficiario.value.id);
    });
    formValues.beneficiarios=IDs;
    this.limpiarCamposDocumento(formValues);// Eliminar campos no necesarios
    this.firestoreService.createRecord(this.pathFiresotre, formValues);
    this.formAportante.reset();
    this.isFormVisible = false;
  }
  // Método para actualizar un registro
  onUpdate() {
    const formValues = this.formAportante.value;
    const IDs: any[] = [];
    (this.formAportante.get('beneficiarios') as FormArray).controls.forEach((beneficiario: any) => {
      IDs.push(beneficiario.value.id);
    });
    formValues.beneficiarios=IDs;
    // Agregar código para actualizar el nombreFam en la tabla
    this.limpiarCamposDocumento(formValues);// Eliminar campos no necesarios
    this.firestoreService.updateRecord(this.pathFiresotre, this.selectedIdAportante, formValues);
    this.formAportante.reset();
    this.isFormVisible = false;
  }
  // Método para eliminar los campos no necesarios del documento
  limpiarCamposDocumento(formValues: any) {
    delete formValues.idAportante;// borrar idAportante de formValues
    delete formValues.nombreFam;// borrar nombreFam de formValues
    delete formValues.fliaBeneficiaria;// borrar fliaBeneficiaria de formValues
    delete formValues.mesInicio;// borrar mesInicio de formValues
    delete formValues.monto;// borrar monto de formValues
    delete formValues.depositante;// borrar depositante de formValues
    delete formValues.fechaDepo;// borrar fechaDepo de formValues
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

// Función para obtener el estado de un aportante
function obtenerEstado(costoAporte:number, saldo: number, fechaDepo: string, numBeneficiarios:number): string {
  saldo = parseFloat(obtenerSaldo(costoAporte, saldo, fechaDepo, numBeneficiarios));
  if (saldo >= 0) {
    return 'Activo';
  }
  else {
    return 'Debe';
  }
}
// Función para obtener el saldo de un aportante
function obtenerSaldo(costoAporte:number, saldo: number, fechaDepo: string, numBeneficiarios:number): string {
  const hoy = new Date();//Fecha actual 
  const pm = parseInt(fechaDepo.split('-')[1]);//Mes pagado
  const py = parseInt(fechaDepo.split('-')[0]);//Año pagado
  const difMeses = (hoy.getFullYear()-py)*12+(hoy.getMonth()+1-pm);
  saldo -= difMeses*costoAporte*numBeneficiarios;    
  return (saldo).toFixed(2);
}

function calcularMeses(mesCubierto:string): string {
  //convertir a fecha
  const nuevoMes = new Date(mesCubierto+'-28');
  //sumar un mes
  nuevoMes.setMonth(nuevoMes.getMonth()+1);
  //convertir a string  
  return nuevoMes.getFullYear()+'-'+(nuevoMes.getMonth()+1);    
}

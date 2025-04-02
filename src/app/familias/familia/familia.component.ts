import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';
import { CommonModule } from '@angular/common';
import { LoginsvcService } from '../../services/loginsvc.service';

@Component({
  selector: 'app-familia',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule],
  templateUrl: './familia.component.html',
  styleUrls: ['./familia.component.css']
})
export class FamiliaComponent implements OnInit {
  idFamilia: string | null = null;
  familiaForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private router:Router,
    private loginSvc: LoginsvcService,
  ) {
    this.familiaForm = this.fb.group({
      nombre: ['',[Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit(): void {
    if (this.loginSvc.usr.roles[0]?.nombreRol != "SuperAdmin") this.router.navigate(['/login']); // Redirigir a la página de inicio de sesión si el rol no está permitido
    // Obtener el idFamilia del router
    this.route.paramMap.subscribe(params => {
      this.idFamilia = params.get('id');
      if (this.idFamilia) {
        this.cargarDatosFamilia(this.idFamilia);
      }
    });
  }

  cargarDatosFamilia(id: string): void {
    this.firestoreService.getRecordById("Familias",id).subscribe(familia => {
      this.familiaForm.patchValue({
        nombre: familia.nombre,        
      });
    });
  }

  guardarCambios(): void {
    if (this.familiaForm.valid) {
      const datosFamilia = this.familiaForm.value;
      this.firestoreService.updateRecord("Familias",this.idFamilia!, datosFamilia);
    }
    this.router.navigate(['/login']); // Redirigir a la página de inicio de sesión
  }

  convertirAMayusculas(controlName: string): void {
    const control = this.familiaForm.get(controlName);
    if (control) {
      const valor = control.value || '';
      control.setValue(valor.toUpperCase(), { emitEvent: false });
    }
  }
}
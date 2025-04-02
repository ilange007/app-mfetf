import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RegistroComponent } from './registro/registro.component';
import { AportantesComponent } from './aportantes/aportantes.component';
import { EntregasComponent } from './entregas/entregas.component';
import { BeneficiariosComponent } from './beneficiarios/beneficiarios.component';
import { CanastaComponent } from './canasta/canasta.component';
import { DistritosComponent } from './distritos/distritos.component';
import { FamiliaComponent } from './familias/familia/familia.component';
import { FamiliasComponent } from './familias/familias.component';

export const routes: Routes = [
    { path: '', component: DashboardComponent },  // Ruta por defecto
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegistroComponent },
    { path: 'aportantes', component: AportantesComponent },
    { path: 'entregas', component: EntregasComponent },
    { path: 'beneficiarios', component: BeneficiariosComponent },
    { path: 'canasta', component: CanastaComponent },
    { path: 'distritos', component: DistritosComponent },
    { path: 'familias', component: FamiliasComponent },
    { path: 'familia/:id', component: FamiliaComponent },
];

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from "./menu/menu.component";
import { LoginsvcService } from './services/loginsvc.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
}
)
export class AppComponent {
  title = 'app-mfetf';  
  constructor(public loginSvc: LoginsvcService) {
    loginSvc.detectarCredenciales();
  }
}

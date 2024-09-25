import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

class Hora{
    hour:number=0;
    minute:number=0;
}
export class Paciente {
    name?:string;
    fecha?:NgbDateStruct;
    hora:Hora={hour:0,minute:0};
}

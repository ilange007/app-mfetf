class EstadoSalud{
    elemento:string="";
    valor:string="";
    fecha!:Date;
    url!:string;
}
class Habilidad{
    habilidad:string="";
    descripcion:string="";
}
export class Persona {
    id:string="";
    familiaId:string="";
    rol:string="";
    nombre:string="";
    paterno!:string;
    materno!:string;
    fechaNac!:Date;
    sexo!:string;
    telefono!:string;
    correo!:string;
    estadosSalud!:[EstadoSalud];
    habilidades!:[Habilidad];
}

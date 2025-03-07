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
class Rol {
    rol:string="";
    descripcion:string="";
}
export class Persona {
    id:string="";
    familiaId:string="";
    roles!: [Rol];
    nombre:string="";
    paterno!:string;
    materno!:string;
    fechaNac!:Date;
    sexo!:string;
    telefono!:string;
    direccion!:string;
    correo!:string;
    estadosSalud!:[EstadoSalud];
    habilidades!:[Habilidad];
    activo!:boolean;
}

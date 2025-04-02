class Rol{
    nombreRol:string="SuperAdmin";
    idDistrito:string="hKDkvEBDlkuiugiR8CKw";
}
export class Usuario {
    uid:string | null = "";
    photoURL:string | null = "logoMGR.webp";
    idPersona:string | null = "";
    roles:[Rol]=[new Rol];
    email: string | null = "";
}

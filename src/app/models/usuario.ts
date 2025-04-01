class Rol{
    nombre:string="SuperAdmin";
    distritoId:string="hKDkvEBDlkuiugiR8CKw";
}
export class Usuario {
    uid:string | null = "";
    photoURL:string | null = "logoMGR.webp";
    personaId:string | null = "";
    roles:[Rol]=[new Rol];
    displayName: string | null = "";
    email: string | null = "";
}

export class Distrito {
    id!:string;
    nombre:string="Cercado";
    geografia!:string;    
    usuarios:string[]=['asdfdsa'];

    constructor(init?: Partial<Distrito>) {
        Object.assign(this, init); // Inicializa las propiedades desde el objeto recibido
      }
}

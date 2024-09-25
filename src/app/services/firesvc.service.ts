import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Clinica } from '../models/clinica';
import { Paciente } from '../models/paciente';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class FiresvcService {

  selectedPaciente: Paciente = new Paciente();
  selectedClinica:Clinica = new Clinica;
  selectedUsuario:Usuario = new Usuario;

  constructor(private firestore:AngularFirestore) { }

  //Usuarios
  readClinicasUsuario(uid:string){
    //let lista=[""];
    console.log(uid);
    this.firestore.collection('usuarios'/*, ref=>ref.where("uid","==",uid)*/).valueChanges().subscribe((resp)=>console.log(resp.length))// toPromise().then((re)=>console.log(re.length)).catch(e => console.error(e));
    //return clinicasUsuario;
  }

  //Solicitudes  
  createSolicitud(clinica:Object,usuario:Usuario){
    this.firestore.collection('solicitudes').doc(usuario.uid).set(Object.assign(clinica,usuario));
    //this.firestore.collection('solicitudes/'+usuario.uid+'/contacto').add(Object.assign({},usuario));
  }

  readSolicitudes(){//Luego ordenar por fecha
    return this.firestore.collection('solicitudes', ref => ref.orderBy('name')).valueChanges({idField:'idSolicitud'});
  }

  deleteSolicitudes(key:string){
    this.firestore.collection('solicitudes').doc(key).delete();
  }

  createClinica(clinica:Object,usuario:Usuario){
    const usrLange=new Usuario//Usuario Admin en todas las clinicas
    usrLange.uid="AvYUjJRxiPgBBKSG2X27zMoWQZG3";
    usrLange.admin= true;
    usrLange.displayName="Isaac Lange Aguilar";
    usrLange.email= "ilange007@gmail.com";
    usrLange.photoURL= "https://lh3.googleusercontent.com/a-/AOh14Gg0kvZ9n5IeCE0-HvRWqIlAag8zTsbnN1y52qDdnKQ=s96-c";
    this.firestore.collection('clinicas').add(Object.assign({},clinica)).then(
      x=>{
        x.collection('usuarios').doc(usrLange.uid).set(Object.assign({},usrLange));
        x.collection('usuarios').doc(usuario.uid).set(Object.assign({},usuario));
      }
    );
  }
/*
  readClinica(clinicaId:string){
    const refe = this.firestore.collection('clinicas').doc(clinicaId).get();
    refe.toPromise(function(res,){})
  }*/

  //Otros
  create(objeto:Object,clcId:string,col:string){
      this.firestore.collection('clinicas').doc(clcId).collection(col).add(objeto);
  }

  read(clcId?:string,col:string="",campoOrden:string="",fecha?:Date){
    if(clcId==null) {
      return this.firestore.collection('clinicas',ref=>ref.orderBy('name')).valueChanges({idField: 'idClinica'})
    }
    if(fecha!=null)
      return this.firestore.collection('clinicas').doc(clcId)
      .collection(col, 
        ref => ref.where("fecha","==",{day:fecha.getDate(),month:fecha.getMonth()+1,year:fecha.getFullYear()})
        )
      .valueChanges({idField: 'id'});
    else
      return this.firestore.collection('clinicas').doc(clcId).collection(col,ref=>ref.orderBy(campoOrden))
      .valueChanges({idField: 'id'});
  }

  update(clcId:string,col:string,id:string,objeto:Object){
    this.firestore.collection('clinicas').doc(clcId).collection(col).doc(id).update(objeto);
  }

  delete(clcId:string,col:string,id:string){
    this.firestore.collection('clinicas').doc(clcId).collection(col).doc(id).delete();
  }
}
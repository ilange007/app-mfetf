import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, updateDoc, deleteDoc, addDoc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: Firestore) {}

  // Método para crear un nuevo documento y devolver el ID del documento
  async createRecord(collectionPath: string, data: any): Promise<string> {
    const ref = doc(collection(this.firestore, collectionPath)); // Crea una referencia de documento con un ID generado
    await setDoc(ref, JSON.parse(JSON.stringify(data))); // Establece los datos del documento
    return ref.id; // Devuelve el ID del documento
  }

  // Método para obtener todos los registros (observable para usar en la vista)
  getRecords(collectionPath:string, ): Observable<any[]> {
    const ref = collection(this.firestore, collectionPath);
    return collectionData(ref, { idField: 'id' }) as Observable<any[]>;
  }

  // Método para obtener un documento por ID
  getRecordById(collectionPath:string, id: string): Observable<any> {
    const ref = doc(this.firestore, `${collectionPath}/${id}`);
    return docData(ref, { idField: 'id' }) as Observable<any>;
  }

  // Método para actualizar un documento por ID
  updateRecord(collectionPath:string, id: string, data: any): Promise<void> {
    const ref = doc(this.firestore, `${collectionPath}/${id}`);
    return updateDoc(ref, data);
  }

  // Método para eliminar un documento por ID
  deleteRecord(collectionPath:string, id: string): Promise<void> {
    const ref = doc(this.firestore, `${collectionPath}/${id}`);
    return deleteDoc(ref);
  }
}

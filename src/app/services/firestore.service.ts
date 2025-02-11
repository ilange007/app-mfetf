import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, updateDoc, deleteDoc, addDoc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  private collectionPath = 'Distritos';  // Cambia esto al nombre de la colección en Firestore

  constructor(private firestore: Firestore) {}

  // Método para crear un nuevo documento
  createRecord(data: any): Promise<void> {
    const ref = doc(collection(this.firestore, this.collectionPath));
    return setDoc(ref, JSON.parse(JSON.stringify(data)));
  }

  // Método para obtener todos los registros (observable para usar en la vista)
  getRecords(): Observable<any[]> {
    const ref = collection(this.firestore, this.collectionPath);
    return collectionData(ref, { idField: 'id' }) as Observable<any[]>;
  }

  // Método para obtener un documento por ID
  getRecordById(id: string): Observable<any> {
    const ref = doc(this.firestore, `${this.collectionPath}/${id}`);
    return docData(ref, { idField: 'id' }) as Observable<any>;
  }

  // Método para actualizar un documento por ID
  updateRecord(id: string, data: any): Promise<void> {
    const ref = doc(this.firestore, `${this.collectionPath}/${id}`);
    return updateDoc(ref, data);
  }

  // Método para eliminar un documento por ID
  deleteRecord(id: string): Promise<void> {
    const ref = doc(this.firestore, `${this.collectionPath}/${id}`);
    return deleteDoc(ref);
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { IProduct,  } from './Models/i-product';
import { IOrder } from './Models/i-order';
import { IProductRequest } from './Models/iproduct-request';
import { iUser } from './Models/iUser';

@Injectable({
  providedIn: 'root'
})
export class CRUDService {

  private productItems: IProduct[] = [];
  private orderItems: IOrder[] = [];
  private userItems: iUser[] = [];

  private productItemsSubject = new BehaviorSubject<IProduct[]>([]);
  private orderItemsSubject = new BehaviorSubject<IOrder[]>([]);
  private userItemsSubject = new BehaviorSubject<iUser[]>([]);

  public productItems$ = this.productItemsSubject.asObservable();
  public orderItems$ = this.orderItemsSubject.asObservable();
  public userItems$ = this.userItemsSubject.asObservable();

  public searchQuery = new BehaviorSubject<string>('');
  currentSearchQuery = this.searchQuery.asObservable();
  constructor (private http: HttpClient) {

  }

  //---------- CODICE PER BARRA DI RICERCA
  // changeSearchQuery(query: string) {
  //   this.searchQuery.next(query);
  // }

  // searchEntities(url:string,query = ''): Observable<T[]> {
  //   return this.http.get<T[]>(`${url}?q=${query}`);
  // }

  getAllEntities(url: string, type: 'product' | 'order' | 'user'): Observable<any[]> {
    return this.http.get<any[]>(url).pipe(
      tap((items) => {
        switch (type) {
          case 'product':
            this.productItems = items as IProduct[];
            this.productItemsSubject.next(this.productItems);
            break;
          case 'order':
            this.orderItems = items as IOrder[];
            this.orderItemsSubject.next(this.orderItems);
            break;
          case 'user':
            this.userItems = items as iUser[];
            this.userItemsSubject.next(this.userItems);
            break;
        }
      })
    );
  }


  getOneEntity(url: string, id: number, type: 'product' | 'order' | 'user'): Observable<any> {
    return this.http.get<any>(`${url}/${id}`);
  }

  deleteEntity(url: string, id: number, type: 'product' | 'order' | 'user'): Observable<void> {
    return this.http.delete<void>(`${url}/${id}`).pipe(
      tap(() => {
        switch (type) {
          case 'product':
            this.productItems = this.productItems.filter(item => item.id !== id);
            this.productItemsSubject.next(this.productItems);
            break;
          case 'order':
            this.orderItems = this.orderItems.filter(item => item.id !== id);
            this.orderItemsSubject.next(this.orderItems);
            break;
          case 'user':
            this.userItems = this.userItems.filter(item => item.id !== id);
            this.userItemsSubject.next(this.userItems);
            break;
        }
      })
    );
  }

  createEntity(url: string, body: Partial<any>, type: 'product' | 'order' | 'user'): Observable<any> {
    return this.http.post<any>(url, body).pipe(
      tap((newItem) => {
        switch (type) {
          case 'product':
            this.productItems.push(newItem as IProduct);
            this.productItemsSubject.next(this.productItems);
            break;
          case 'order':
            this.orderItems.push(newItem as IOrder);
            this.orderItemsSubject.next(this.orderItems);
            break;
          case 'user':
            this.userItems.push(newItem as iUser);
            this.userItemsSubject.next(this.userItems);
            break;
        }
      })
    );
  }

  createProductWithImage(url: string, entity: Partial<IProductRequest>, file: File): Observable<IProduct> {
    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(entity)], { type: 'application/json' }));
    formData.append('file', file);

    return this.http.post<IProduct>(url, formData).pipe(
      tap((newItem) => {
        this.productItems.push(newItem);
        this.productItemsSubject.next(this.productItems);
      })
    );
  }

  updateProduct(apiUrl: string, id: number, entity: Partial<IProduct>, file?: File): Observable<IProduct> {
    const formData: FormData = new FormData();
    formData.append('product', new Blob([JSON.stringify(entity)], { type: 'application/json' }));

    if (file) {
      formData.append('file', file, file.name);
    }

    return this.http.put<IProduct>(`${apiUrl}/${id}`, formData).pipe(
      tap((updatedItem) => {
        this.productItems = this.productItems.map(item => item.id === id ? updatedItem : item);
        this.productItemsSubject.next(this.productItems);
      })
    );
  }

  patchOrderChecked(url: string, id: number, checked: boolean): Observable<IOrder> {
    return this.http.patch<IOrder>(`${url}/${id}/checked`, { checked }).pipe(
      tap((updatedOrder) => {
        this.orderItems = this.orderItems.map(order => order.id === id ? updatedOrder : order);
        this.orderItemsSubject.next(this.orderItems);
      })
    );
  }

  patchOrderPending(url: string, id: number, pending: boolean): Observable<IOrder> {
    return this.http.patch<IOrder>(`${url}/${id}/pending`, { pending }).pipe(
      tap((updatedOrder) => {
        this.orderItems = this.orderItems.map(order => order.id === id ? updatedOrder : order);
        this.orderItemsSubject.next(this.orderItems);
      })
    );
  }
}

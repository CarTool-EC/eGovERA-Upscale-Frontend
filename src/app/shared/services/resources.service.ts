import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResourcesService {
  private url = environment.backendUrl;
  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  private fileHeaders: HttpHeaders = new HttpHeaders({
    'Content-Type': 'multipart/form-data'
  })

  constructor(
    private http: HttpClient
  ) { }

  getABB(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/getABB`, {
      headers: this.headers
    });
  }

  getDBC(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/getDBC`, {
      headers: this.headers
    });
  }

  getDPS(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/getDPS`, {
      headers: this.headers
    });
  }

  postModel(model: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', model);

    return this.http.post<any>(`${this.url}/processModel`, formData);
  }

  getTestABB(): Observable<any[]> {
    return this.http.get<any[]>("/assets/raw/ABB-v6.0.json", {
      headers: this.headers
    });
  }

  getTestDBC(): Observable<any[]> {
    return this.http.get<any[]>("/assets/raw/DBC-v6.0.json", {
      headers: this.headers
    });
  }

  getTestDPS(): Observable<any[]> {
    return this.http.get<any[]>("/assets/raw/DPS-v6.0.json", {
      headers: this.headers
    });
  }
}

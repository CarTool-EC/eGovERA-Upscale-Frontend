import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResourcesService {
  private url = "/api/resources";
  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });

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

import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private server = 'http://localhost:8080/api';

  public constructor(private httpClient: HttpClient) {}

  //TODO: Define function to upload files
  public upload(formData: FormData): Observable<HttpEvent<string[]>> {
    return this.httpClient.post<string[]>(
      `${this.server}/file/upload`,
      formData,
      {
        reportProgress: true,
        observe: 'events',
      }
    );
  }

  //TODO: Define function to download files
  public download(filename: string): Observable<HttpEvent<Blob>> {
    return this.httpClient.get(`${this.server}/file/download/${filename}`, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob',
    });
  }

  public downloadBytes(filename: string): Observable<HttpEvent<Object>> {
    return this.httpClient.get(
      `${this.server}/file/byte/download/${filename}`,
      {
        reportProgress: true,
        observe: 'events',
        responseType: 'json',
      }
    );
  }
}

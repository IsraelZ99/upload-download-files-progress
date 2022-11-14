import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
} from '@angular/common/http';
import { Component } from '@angular/core';
import { saveAs } from 'file-saver';
import { FileService } from './services/file.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  public filenames: string[] = [];
  public fileStatus = {
    status: '',
    requestType: '',
    percent: 0,
  };
  public constructor(private fileService: FileService) {
    this.filenames.push('catfish.mp3');
  }

  //TODO: Define a function to upload files
  public onUploadFiles(evt: any): void {
    const files: File[] = evt.target.files;
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file, file.name);
    }
    this.fileService.upload(formData).subscribe({
      next: (event) => {
        console.log(event);
        this.reportProgress(event);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  //TODO: Define a function to upload files
  public onDownloadFiles(filename: string): void {
    if (filename === 'catfish.mp3') {
      this.fileService.downloadBytes(filename).subscribe({
        next: (event) => {
          console.log(event);
          this.reportProgressWithBytes(event);
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        },
      });
    } else {
      this.fileService.download(filename).subscribe({
        next: (event) => {
          console.log(event);
          this.reportProgress(event);
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        },
      });
    }
  }

  private reportProgressWithBytes(httpEvent: HttpEvent<Object>): void {
    switch (httpEvent.type) {
      case HttpEventType.UploadProgress:
        this.updateStatus(httpEvent.loaded, httpEvent.total!, 'Uploading... ');
        break;
      case HttpEventType.DownloadProgress:
        this.updateStatus(
          httpEvent.loaded,
          httpEvent.total!,
          'Downloading... '
        );
        break;
      case HttpEventType.ResponseHeader:
        console.log('Header returned ', httpEvent);
        break;
      case HttpEventType.Response:
        if (httpEvent.body instanceof Array) {
          this.fileStatus.status = 'done';
          for (const filename of httpEvent.body) {
            this.filenames.unshift(filename);
          }
        } else {
          console.log(httpEvent.body);
        }
        this.fileStatus.status = 'done';
        break;
      default:
        console.log(httpEvent);
        break;
    }
  }

  private reportProgress(httpEvent: HttpEvent<string[] | Blob>): void {
    switch (httpEvent.type) {
      case HttpEventType.UploadProgress:
        this.updateStatus(httpEvent.loaded, httpEvent.total!, 'Uploading... ');
        break;
      case HttpEventType.DownloadProgress:
        this.updateStatus(
          httpEvent.loaded,
          httpEvent.total!,
          'Downloading... '
        );
        break;
      case HttpEventType.ResponseHeader:
        console.log('Header returned ', httpEvent);
        break;
      case HttpEventType.Response:
        if (httpEvent.body instanceof Array) {
          this.fileStatus.status = 'done';
          for (const filename of httpEvent.body) {
            this.filenames.unshift(filename);
          }
        } else {
          //TODO: Download logic
          saveAs(
            new File([httpEvent.body!], httpEvent.headers.get('File-Name')!, {
              type: `${httpEvent.headers.get('Content-Type')};charset=utf-8`,
            })
          );
          // As new Blob
          // saveAs(
          //   new Blob([httpEvent.body!], {
          //     type: `${httpEvent.headers.get('Content-Type')};charset=utf-8`,
          //   }),
          //   httpEvent.headers.get('File-Name')
          // );
        }
        this.fileStatus.status = 'done';
        break;
      default:
        console.log(httpEvent);
        break;
    }
  }

  private updateStatus(loaded: number, total: number, requestType: string) {
    this.fileStatus.status = 'progress';
    this.fileStatus.requestType = requestType;
    this.fileStatus.percent = Math.round((100 * loaded) / total);
  }
}

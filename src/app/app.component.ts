import { Component } from '@angular/core';
import { Headers, RequestOptions } from '@angular/http';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  url = 'http://127.0.0.1:8200/v1/secret/foo';
  token;
  headers;
  result;
  action: String = 'Get';
  actions = [
    'Get',
    'Put',
    'Post',
    'List',
    'Delete'
  ];
  constructor(private http: HttpClient) { }

  performAction(action: String) {
    this.result = "";
    console.log("Doing a get @" + this.url);
    switch (action) {
      case "Get":
        this.doGet();
        break;
      case "List":
        this.doList();
        break;
      case "Post":
        this.doPost();
        break;
      case "Delete":
        this.doDelete();
        break;
      case "Put":
        this.doPut();
        break;
      default:
        // code...
        break;
    }
  }

  doPut() {
    
  }

  doGet() {
    this.http.get(this.url, {
      headers: new HttpHeaders({ 'X-Vault-Token': this.token })
    }).subscribe((res) => {
        this.result = JSON.stringify(res.data, null, 2);
    }, (err) => {
        console.log(err);
        this.result = JSON.stringify(err.statusText);
    });
  }

  doList() {
    this.http.get(this.url+"?list=true", {
      headers: new HttpHeaders({ 'X-Vault-Token': this.token })
    }).subscribe((res) => {
        this.result = JSON.stringify(res.data.keys, null, 2);
    }, (err) => {
        this.result = JSON.stringify(err.statusText);
    });
  }

  doDelete() {
    this.http.delete(this.url, {
      headers: new HttpHeaders({ 'X-Vault-Token': this.token })
    }).subscribe((res) => {
        this.result = 'Secret deleted if it existed';
    }, (err) => {
        this.result = JSON.stringify(err.statusText);
    });
  }

  doPost() {
    
  }

  setAction(action: String) {
    this.action = action;
  }
}
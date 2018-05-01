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
  vaultVersion = "/v1/secret/"
  baseUrl = 'http://127.0.0.1:8200';
  key; // used during a put request
  value; // used during a put request
  token;
  headers;
  result;
  supportedVerbs = [
    'Get',
    'Put',
    'List',
    'Delete'
  ];
  verb: String = this.supportedVerbs[0];
  constructor(private http: HttpClient) { }

  performAction(selectedVerb: String) {
    this.result = "";
    var secret = {
      key: this.getAbsolutePath(this.key)
    };
    switch (selectedVerb) {
      case "Get":
        this.doGet(secret);
        break;
      case "List":
        this.doList(secret);
        break;
      case "Delete":
        this.doDelete(secret);
        break;
      case "Put":
        secret['value'] = this.value;
        this.doPut(secret);
        break;
      default:
        // code...
        break;
    }
  }
  
  getAbsolutePath(relativePath: string) {
    return this.removeTrailingSlashIfExists(this.baseUrl).concat(this.vaultVersion).concat(relativePath);
  }

  removeTrailingSlashIfExists(path: string) {
    if (path.endsWith("/")) {
      var idx = path.lastIndexOf("/");
      return path.substring(0, idx);
    }
    return path;
  }

  doPut(secret) {
    this.http.put(secret.key, {"value":secret.value}, {
      headers: new HttpHeaders({ 'X-Vault-Token': this.token })
    }).subscribe((res) => {
        this.result = secret.value + " was saved with the key -> " + this.key;
    }, (err) => {
        this.result = JSON.stringify(err.statusText);
    });
  }

  doGet(secret) {
    this.http.get(secret.key, {
      headers: new HttpHeaders({ 'X-Vault-Token': this.token })
    }).subscribe((res) => {
        this.result = JSON.stringify(res['data'], null, 2);
    }, (err) => {
        this.result = JSON.stringify(err.statusText);
    });
  }

  doList(secret) {
    this.http.get(secret.key + "?list=true", {
      headers: new HttpHeaders({ 'X-Vault-Token': this.token })
    }).subscribe((res) => {
        this.result = JSON.stringify(res['data'].keys, null, 2);
    }, (err) => {
        this.result = JSON.stringify(err.statusText);
    });
  }

  doDelete(secret) {
    this.http.delete(secret.key, {
      headers: new HttpHeaders({ 'X-Vault-Token': this.token })
    }).subscribe((res) => {
        this.result = 'Secret deleted if it existed';
    }, (err) => {
        this.result = JSON.stringify(err.statusText);
    });
  }

  isPut() {
    return this.verb === "Put"
  }
  
  setAction(action: String) {
    this.verb = action;
  }
}
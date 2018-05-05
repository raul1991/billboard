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
  requests = [];
  supportedVerbs = [
  'Get',
  'Put',
  'List',
  'Delete'
  ];
  verb: String = this.supportedVerbs[0];
  constructor(private http: HttpClient) { }

  prepareRequestObj(verb: string) {
    return {
      secret: {
        key: this.key,
        value: this.value
      },
      verb: verb,
      url: this.getAbsolutePath(this.key),
      headers: new HttpHeaders({ 'X-Vault-Token': this.token })
    }
  }
  
  performAction(selectedVerb: string) {
    this.result = "";
    var request = this.prepareRequestObj(selectedVerb);
    switch (selectedVerb) {
      case "Get":
      this.doGet(request);
      break;
      case "List":
      this.doList(request);
      break;
      case "Delete":
      this.doDelete(request);
      break;
      case "Put":
      request['value'] = this.value;
      this.doPut(request);
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

    doPut(request) {
      var secret = request.secret;
      this.http.put(request.url, {"value":secret.value}, {
        headers: request.headers
      }).subscribe((res) => {
        this.result = secret.value + " was saved with the key -> " + secret.key;
        this.requests.push(request);
      }, (err) => {
        this.result = JSON.stringify(err.statusText);
      });
    }

    doGet(request) {
      var secret = request.secret;
      this.http.get(request.url, {
        headers: request.headers
      }).subscribe((res) => {
        this.result = JSON.stringify(res['data'], null, 2);
        this.requests.push(request);
      }, (err) => {
        this.result = JSON.stringify(err.statusText);
      });
    }

    doList(request) {
      var secret = request.secret;
      this.http.get(request.url + "?list=true", {
        headers: request.headers
      }).subscribe((res) => {
        this.result = JSON.stringify(res['data'].keys, null, 2);
        this.requests.push(request);
      }, (err) => {
        this.result = JSON.stringify(err.statusText);
      });
    }

    doDelete(request) {
      var secret = request.secret;
      this.http.delete(request.url, {
        headers: secret.headers
      }).subscribe((res) => {
        this.result = 'Secret deleted if it existed';
        this.requests.push(request);
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
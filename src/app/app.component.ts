import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { VaultRequest } from '../app/models/request';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string = 'app';
  vaultVersion: string = "/v1/secret/"
  baseUrl: string = 'http://127.0.0.1:8200';
  key: string = ''; // used during a put request
  value: string = ''; // used during a put request
  token: string = '';
  headers: HttpHeaders;
  result: string;
  isCorsEnabled: boolean;
  toggleCORSText: string; // it says 'Disable' when cors are enabled to tell user to disable it.
  requests: Array<VaultRequest> = [];
  supportedVerbs: Array<string> = [
  'Get',
  'Put',
  'List',
  'Delete'
  ];
  verb: String = this.supportedVerbs[0];
  constructor(private http: HttpClient) { 
    //todo : Load from the session.
    this.toggleCORSText = 'Enable';
  }

  private prepareRequestObj(verb: string) {
    return {
      secret: {
        key: this.key,
        value: this.value
      },
      verb: verb,
      url: this.getAbsolutePath(this.key),
      headers: new HttpHeaders({ 'X-Vault-Token': this.token }),
      token: this.token || ''
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

    private getAbsolutePath(relativePath: string) {
      return this.removeTrailingSlashIfExists(this.baseUrl).concat(this.vaultVersion).concat(relativePath);
    }

    private removeTrailingSlashIfExists(path: string) {
      if (path.endsWith("/")) {
        var idx = path.lastIndexOf("/");
        return path.substring(0, idx);
      }
      return path;
    }

    doPut(request: VaultRequest) {
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

    doGet(request: VaultRequest) {
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

    doList(request: VaultRequest) {
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

    doDelete(request: VaultRequest) {
      var secret = request.secret;
      this.http.delete(request.url, {
        headers: request.headers
      }).subscribe((res) => {
        this.result = 'Secret deleted if it existed';
        this.requests.push(request);
      }, (err) => {
        this.result = JSON.stringify(err.statusText);
      });
    }

    toggleCORS() {
      var doWhat = !this.isCorsEnabled;
       var url = this.getAbsolutePath("sys/config/cors");
       this.http.put(url, {"enabled": doWhat,"allowed_origins": "*"}, {
         headers: new HttpHeaders({'X-Vault-Token': this.token})
       }).subscribe((res) => {
          this.setCORS(doWhat);
          this.toggleCORSMessage(doWhat);
          this.result = 'Cors ' + (this.isCorsEnabled ? 'enabled' : 'disabled');
       }, (err) => {
          this.result = JSON.stringify(err.statusText);
       });
    }

    public isPut() {
      return this.verb === "Put"
    }

    private setAction(action: String) {
      this.verb = action;
    }

    private setCORS(what: boolean) {
      this.isCorsEnabled = what;
    }

    private toggleCORSMessage(isEnabled: boolean) {
      this.toggleCORSText = (isEnabled ? 'Disable' : 'Enable');
    }

    replayRequest(request: VaultRequest) {
       this.baseUrl = request.url.split(this.vaultVersion)[0];
       this.headers = new HttpHeaders({'X-Vault-Token': request.token});
       this.key = request.secret.key;
       this.value = request.secret.value;
       this.token = request.token;
    }
  }
import {Component, Input} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {VaultRequest} from './models/request';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  vaultVersion = '/v1/secret/';
  baseUrl = 'http://127.0.0.1:8200';
  key = ''; // used during a put request
  value = ''; // used during a put request
  token = '';
  headers: HttpHeaders;
  result: string;
  isCorsEnabled: boolean;
  toggleCORSText: string; // it says 'Disable' when cors are enabled to tell user to disable it.
  @Input('requests')
  requests: Array<VaultRequest> = [];
  supportedVerbs: Array<string> = [
    'Get',
    'Put',
    'List',
    'Delete'
  ];
  verb: String = this.supportedVerbs[0];
  recentRequestsLimit = 10; // number of requests to keep.
  private static removeTrailingSlashIfExists(path: string) {
    if (path.endsWith('/')) {
      const idx = path.lastIndexOf('/');
      return path.substring(0, idx);
    }
    return path;
  }

  constructor(private http: HttpClient) {
    // todo : Load from the session.
    this.toggleCORSText = 'Enable';
  }

  private prepareRequestObj(verb: string): VaultRequest {
    return {
      secret: {
        key: this.key,
        value: this.value
      },
      verb: verb,
      url: this.getAbsolutePath(this.key),
      headers: new HttpHeaders({'X-Vault-Token': this.token}),
      token: this.token || ''
    };
  }

  performAction(selectedVerb: string) {
    this.result = '';
    const request = this.prepareRequestObj(selectedVerb);
    switch (selectedVerb) {
      case 'Get':
        this.doGet(request);
        break;
      case 'List':
        this.doList(request);
        break;
      case 'Delete':
        this.doDelete(request);
        break;
      case 'Put':
        request['value'] = this.value;
        this.doPut(request);
        break;
      default:
        // code...
        break;
    }
  }

  private getAbsolutePath(relativePath: string) {
    return AppComponent.removeTrailingSlashIfExists(this.baseUrl).concat(this.vaultVersion).concat(relativePath);
  }

  doPut(request: VaultRequest) {
    const secret = request.secret;
    this.http.put(request.url, {'value': secret.value}, {
      headers: request.headers
    }).subscribe((res) => {
      request.response = this.result = secret.value + ' was saved with the key -> ' + secret.key;
      this.addRequest(request);
    }, (err) => {
      this.result = JSON.stringify(err.statusText);
      this.addRequest(request);
    });
  }

  doGet(request: VaultRequest) {
    const secret = request.secret;
    this.http.get(request.url, {
      headers: request.headers
    }).subscribe((res) => {
      request.response = this.result = JSON.stringify(res['data'], null, 2);
      this.addRequest(request);
    }, (err) => {
      this.result = JSON.stringify(err.statusText);
      this.addRequest(request);
    });
  }

  doList(request: VaultRequest) {
    const secret = request.secret;
    this.http.get(request.url + '?list=true', {
      headers: request.headers
    }).subscribe((res) => {
      request.response = this.result = JSON.stringify(res['data'].keys, null, 2);
      this.addRequest(request);
    }, (err) => {
      this.result = JSON.stringify(err.statusText);
      this.addRequest(request);
    });
  }

  doDelete(request: VaultRequest) {
    const secret = request.secret;
    this.http.delete(request.url, {
      headers: request.headers
    }).subscribe((res) => {
      request.response = this.result = 'Secret deleted if it existed';
      this.addRequest(request);
    }, (err) => {
      this.result = JSON.stringify(err.statusText);
      this.addRequest(request);
    });
  }

  toggleCORS() {
    const doWhat = !this.isCorsEnabled;
    const url = this.baseUrl.concat('/v1/sys/config/cors');
    this.http.put(url, {'enabled': doWhat, 'allowed_origins': '*'}, {
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
    return this.verb === 'Put';
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
    this.result = request.response;
    this.baseUrl = request.url.split(this.vaultVersion)[0];
    this.headers = new HttpHeaders({'X-Vault-Token': request.token});
    this.key = request.secret.key;
    this.value = request.secret.value;
    this.verb = request.verb;
    this.token = request.token;
  }

  addRequest(request: VaultRequest) {
    const idx = (this.requests.length >= this.recentRequestsLimit) ? 0 : this.requests.length++;
    this.requests[idx] = request;
  }
}

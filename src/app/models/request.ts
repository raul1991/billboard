import { HttpHeaders } from '@angular/common/http';
export class VaultRequest {
  url: string;
  headers: HttpHeaders;
  secret?: {key: string, value: string};
  token = '';
  response?: string;
  verb;
}

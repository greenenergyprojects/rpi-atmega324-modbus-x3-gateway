import { Injectable, isDevMode } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable()
export class ServerService {

    private _serverUri: string;

    constructor (private httpClient: HttpClient) {
        // ng serve      --> development mode, server running on same host
        // npm run build --prod --> production mode, server can run on any host and supports loading ngx app
        // this._serverUri = isDevMode() ? 'http://localhost:8080' : '';
        this._serverUri = isDevMode() ? 'http://pi-test:8080' : '';
    }

    public async httpGetJson(resource: string): Promise<Object> {
        try {
            const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
            const uri = this._serverUri + resource;
            const response = await this.httpClient.get(uri, { headers: headers, responseType: 'json' }).toPromise();
            return response;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

}

import { Component, OnInit } from '@angular/core';
import { ServerService } from './services/server.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'ngx';

    constructor (private serverService: ServerService) {

    }

    public async ngOnInit () {
        console.log('init');
        try {
            const res = await this.serverService.httpGetJson('/data/server/about');
            console.log(res);
        } catch (err) {
            console.log(err);
        }
    }

}

import {Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart, NavigationEnd, Event as NavigationEvent } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, Subscription } from 'rxjs';
import { User } from '../data/common/home-control/user';


@Component({
    selector: 'app-navbar-component',
    templateUrl: 'navbar.component.html'
})
export class NavbarComponent implements OnInit, OnDestroy {

    public isCollapsed = true;
    public menuItems: IMenuItem [] = [];

    private _userSubsrciption: Subscription;

    public constructor (private activatedRoute: ActivatedRoute, private router: Router, private _auth: AuthService) {
    }

    public ngOnInit() {
        this.router.events.subscribe( (evt: NavigationEvent) => {
           if (evt instanceof NavigationStart) {
                console.log('router event', evt);
                this.isCollapsed = true;
           }
        });
        this._userSubsrciption = this._auth.userObservable.subscribe( (u) => {
            console.log('Navbar: ', u);
            this.menuItems = [];
            this.menuItems.push({ label: 'Überblick', routerLink: 'app/overview' });
            this.menuItems.push({ label: 'Verlauf', routerLink: 'app/chart' });
            this.menuItems.push({ label: 'Archiv', routerLink: 'app/archive' });
            this.menuItems.push({ label: 'Boiler', routerLink: 'app/boiler' });
            this.menuItems.push({ label: 'Heizung', routerLink: 'app/nibe1155' });
            if (this._auth.user.isAdmin) {
                this.menuItems.push({ label: 'Fronius-Symo', routerLink: 'app/froniussymo' });
            }
        });
        // this.activatedRoute.url.subscribe(url => {
        //     console.log(url);
        // });
    }

    public ngOnDestroy() {
        if (this._userSubsrciption) {
            this._userSubsrciption.unsubscribe();
            this._userSubsrciption = null;
        }
    }

}

interface IMenuItem {
    label: string;
    routerLink: string;
}

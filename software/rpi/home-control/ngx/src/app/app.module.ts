import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ModalLoginComponent } from './modals/modal-login';
import { SyncButtonComponent } from './components/sync-button.component';

import { ServerService } from './services/server.service';
import { AuthService } from './services/auth.service';
import { AddAuthHeaderInterceptor } from './services/add-auth-header.interceptor';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faEye, faEyeSlash, faSpinner, faSync } from '@fortawesome/free-solid-svg-icons';
library.add(faEye, faEyeSlash, faSpinner, faSync);

@NgModule({
    declarations: [
        AppComponent, ModalLoginComponent, SyncButtonComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule, ReactiveFormsModule,
        HttpClientModule,
        NgbModule,
        FontAwesomeModule
    ],
    providers: [ ServerService, AuthService, {
        provide: HTTP_INTERCEPTORS,
        useClass: AddAuthHeaderInterceptor,
        multi: true,
    } ],
    entryComponents: [ ModalLoginComponent ],
    bootstrap: [AppComponent]
})
export class AppModule { }

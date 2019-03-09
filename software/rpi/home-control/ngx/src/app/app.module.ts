import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule, NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { NavbarComponent } from './navbar/navbar.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ModalLoginComponent } from './modals/modal-login';
import { ModalArchiveChartComponent } from './modals/modal-archive-chart.component';
import { SyncButtonComponent } from './components/sync-button.component';
import { OverviewComponent } from './components/overview.component';
// import { OverviewChartComponent } from './components/overview-chart.component';
import { BoilerComponent } from './components/boiler.component';
import { BoilerControllerComponent } from './components/boiler-controller.component';
import { Nibe1155ControllerComponent } from './components/nibe1155-controller.component';
import { FroniusSymoComponent } from './components/fronius-symo.component';
import { Nibe1155Component } from './components/nibe1155.component';
import { ChartComponent } from './components/chart.component';
import { ArchiveComponent } from './components/archive.component';
import { ArchiveChartComponent } from './components/archive-chart.component';

import { ConfigService } from './services/config.service';
import { DataService } from './services/data.service';
import { ServerService } from './services/server.service';
import { AuthService } from './services/auth.service';
import { AddAuthHeaderInterceptor } from './services/add-auth-header.interceptor';
import { ValidatorDirective } from './directives/validator.directive';
import { LetDirective } from './directives/let.directive';
import { FocusDirective } from './directives/focus.directive';
import { FilterPipe } from './pipes/filter-pipe';

import { ChartsModule } from 'ng4-charts/ng4-charts';
import { library } from '@fortawesome/fontawesome-svg-core';
import * as fa from '@fortawesome/free-solid-svg-icons';

library.add(
    fa.faEye, fa.faEyeSlash, fa.faSpinner, fa.faSync, fa.faBars,
    fa.faAngleLeft, fa.faAngleDoubleLeft, fa.faAngleRight, fa.faAngleDoubleRight,
    fa.faSearchPlus, fa.faSearchMinus, fa.faHandPointLeft, fa.faHandPointRight
);

@NgModule({
    declarations: [
        ValidatorDirective, LetDirective, FocusDirective, FilterPipe,
        NavbarComponent, AppComponent,
        ModalLoginComponent, ModalArchiveChartComponent, SyncButtonComponent,
        OverviewComponent,
        ArchiveComponent, ArchiveChartComponent,
        ChartComponent,
        BoilerComponent, BoilerControllerComponent, Nibe1155ControllerComponent,
        FroniusSymoComponent,
        Nibe1155Component,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule, ReactiveFormsModule,
        HttpClientModule,
        NgbModule, NgbAccordionModule,
        FontAwesomeModule, ChartsModule
    ],
    providers: [
        ConfigService,
        DataService,
        ServerService,
        AuthService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AddAuthHeaderInterceptor,
            multi: true,
        }
    ],
    entryComponents: [ ModalLoginComponent ],
    bootstrap: [AppComponent]
})
export class AppModule { }

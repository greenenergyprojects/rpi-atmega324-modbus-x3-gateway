import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OverviewComponent } from './components/overview.component';
import { ChartComponent } from './components/chart.component';
import { BoilerComponent } from './components/boiler.component';
import { Nibe1155Component } from './components/nibe1155.component';
import { FroniusSymoComponent } from './components/fronius-symo.component';
import { ArchiveComponent } from './components/archive.component';

const routes: Routes = [
    { path: '', redirectTo: '/app/overview', pathMatch: 'full' },
    { path: 'app/overview', component: OverviewComponent },
    { path: 'app/chart', component: ChartComponent },
    { path: 'app/archive', component: ArchiveComponent },
    { path: 'app/froniussymo', component: FroniusSymoComponent },
    { path: 'app/boiler', component: BoilerComponent },
    { path: 'app/nibe1155', component: Nibe1155Component }

];


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }

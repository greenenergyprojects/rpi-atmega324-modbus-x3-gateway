import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OverviewComponent } from './components/overview.component';
import { FroniusSymoComponent } from './components/fronius-symo.component';
import { BoilerComponent } from './components/boiler.component';
import { Nibe1155Component } from './components/nibe1155.component';
import { TestComponent } from './components/test.component';

const routes: Routes = [
    { path: '', redirectTo: '/app/overview', pathMatch: 'full' },
    // { path: 'app/overview', component: OverviewComponent },
    // { path: 'app/froniussymo', component: FroniusSymoComponent },
    // { path: 'app/boiler', component: BoilerComponent },
    // { path: 'app/nibe1155', component: Nibe1155Component },
    { path: 'app/overview', component: TestComponent },
    { path: 'app/test', component: TestComponent },
    { path: 'app/froniussymo', component: TestComponent },
    { path: 'app/boiler', component: BoilerComponent },
    { path: 'app/nibe1155', component: Nibe1155Component }

];


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }

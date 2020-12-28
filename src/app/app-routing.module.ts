import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IndexComponent } from './index/index.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { PositionCalculatorComponent } from './position-calculator/position-calculator.component';
import { ProjectionsComponent } from './projections/projections.component';

const routes: Routes = [
    { path: 'home', component: IndexComponent },
    { path: 'position-calculator', component: PositionCalculatorComponent },
    { path: 'projections', component: ProjectionsComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full'},
    { path: '**', component: NotFoundComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }

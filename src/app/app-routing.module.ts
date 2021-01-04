import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BatterProjectionsComponent } from './batter-projections/batter-projections.component';
import { IndexComponent } from './index/index.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { PitcherProjectionsComponent } from './pitcher-projections/pitcher-projections.component';
import { PositionCalculatorComponent } from './position-calculator/position-calculator.component';
import { ProjectionsComponent } from './projections/projections.component';

const routes: Routes = [
    { path: 'home', component: IndexComponent },
    { path: 'position-calculator', component: PositionCalculatorComponent },
    { path: 'projections', component: ProjectionsComponent },
    { path: 'batter-projections', component: BatterProjectionsComponent },
    { path: 'pitcher-projections', component: PitcherProjectionsComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full'},
    { path: '**', component: NotFoundComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IndexComponent } from './index/index.component';
import { PositionCalculatorComponent } from './position-calculator/position-calculator.component';

const routes: Routes = [
    { path: '', component: IndexComponent },
    { path: 'position-calculator', component: PositionCalculatorComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }

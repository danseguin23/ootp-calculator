import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { IndexComponent } from './index/index.component';
import { FooterComponent } from './footer/footer.component';
import { PositionCalculatorComponent } from './position-calculator/position-calculator.component';
import { FormsModule } from '@angular/forms';
import { ProjectionsComponent } from './projections/projections.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { BatterProjectionsComponent } from './batter-projections/batter-projections.component';
import { PitcherProjectionsComponent } from './pitcher-projections/pitcher-projections.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    IndexComponent,
    FooterComponent,
    PositionCalculatorComponent,
    ProjectionsComponent,
    NotFoundComponent,
    BatterProjectionsComponent,
    PitcherProjectionsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

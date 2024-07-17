import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OverviewAndGuidelinesRoutingModule } from './overview-and-guidelines-routing.module';
import { OverviewAndGuidelinesComponent } from './overview-and-guidelines.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    OverviewAndGuidelinesComponent
  ],
  imports: [
    CommonModule,
    OverviewAndGuidelinesRoutingModule,
    SharedModule
  ]
})
export class OverviewAndGuidelinesModule { }

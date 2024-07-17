import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OverviewAndGuidelinesComponent } from './overview-and-guidelines.component';

const routes: Routes = [
  { path: '', component: OverviewAndGuidelinesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OverviewAndGuidelinesRoutingModule { }

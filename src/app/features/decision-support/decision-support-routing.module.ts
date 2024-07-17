import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DecisionSupportComponent } from './decision-support.component';

const routes: Routes = [
  { path: '', component: DecisionSupportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DecisionSupportRoutingModule { }

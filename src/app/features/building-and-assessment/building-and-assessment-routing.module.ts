import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuildingAndAssessmentComponent } from './building-and-assessment.component';

const routes: Routes = [
  { path: '', component: BuildingAndAssessmentComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuildingAndAssessmentRoutingModule { }

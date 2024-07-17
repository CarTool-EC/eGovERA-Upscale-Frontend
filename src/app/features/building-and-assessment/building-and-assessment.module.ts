import { NgModule } from '@angular/core';

import { BuildingAndAssessmentRoutingModule } from './building-and-assessment-routing.module';
import { SharedModule } from '@shared/shared.module';
import { BuildingAndAssessmentComponent } from './building-and-assessment.component';
import { InitializationFormComponent } from './initialization-form/initialization-form.component';
import { CapabilityAssessmentComponent } from './capability-assessment/capability-assessment.component';
import { RequirementsAssessmentComponent } from './requirements-assessment/requirements-assessment.component';
import { SurveyDownloadComponent } from './survey-download/survey-download.component';


@NgModule({
  declarations: [
    BuildingAndAssessmentComponent,
    InitializationFormComponent,
    CapabilityAssessmentComponent,
    RequirementsAssessmentComponent,
    SurveyDownloadComponent
  ],
  imports: [
    BuildingAndAssessmentRoutingModule,
    SharedModule
  ]
})
export class BuildingAndAssessmentModule { }

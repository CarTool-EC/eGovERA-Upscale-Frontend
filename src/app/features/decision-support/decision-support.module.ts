import { NgModule } from '@angular/core';

import { DecisionSupportRoutingModule } from './decision-support-routing.module';
import { DecisionSupportComponent } from './decision-support.component';
import { PortfolioManagementComponent } from './portfolio-management/portfolio-management.component';
import { DigitalTransformationRoadmapComponent } from './digital-transformation-roadmap/digital-transformation-roadmap.component';
import { ExportPdfComponent } from './export-pdf/export-pdf.component';
import { SharedModule } from '@shared/shared.module';

import { BaseChartDirective } from 'ng2-charts';


@NgModule({
  declarations: [
    DecisionSupportComponent,
    PortfolioManagementComponent,
    DigitalTransformationRoadmapComponent,
    ExportPdfComponent
  ],
  imports: [
    DecisionSupportRoutingModule,
    SharedModule,
    BaseChartDirective
  ]
})
export class DecisionSupportModule { }

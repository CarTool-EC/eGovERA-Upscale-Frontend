import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: '', redirectTo: 'overview-and-guidelines', pathMatch: 'full' },
    { path: 'overview-and-guidelines', loadChildren: () => import('./features/overview-and-guidelines/overview-and-guidelines.module').then(m => m.OverviewAndGuidelinesModule) },
    { path: 'building-and-assessment', loadChildren: () => import('./features/building-and-assessment/building-and-assessment.module').then(m => m.BuildingAndAssessmentModule) },
    { path: 'decision-support', loadChildren: () => import('./features/decision-support/decision-support.module').then(m => m.DecisionSupportModule) },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes),
    ],
})
export class AppRoutingModule {}

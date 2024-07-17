import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingAndAssessmentComponent } from './building-and-assessment.component';

describe('BuildingAndAssessmentComponent', () => {
  let component: BuildingAndAssessmentComponent;
  let fixture: ComponentFixture<BuildingAndAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildingAndAssessmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BuildingAndAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

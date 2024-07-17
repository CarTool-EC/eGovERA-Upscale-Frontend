import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementsAssessmentComponent } from './requirements-assessment.component';

describe('RequirementsAssessmentComponent', () => {
  let component: RequirementsAssessmentComponent;
  let fixture: ComponentFixture<RequirementsAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequirementsAssessmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequirementsAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

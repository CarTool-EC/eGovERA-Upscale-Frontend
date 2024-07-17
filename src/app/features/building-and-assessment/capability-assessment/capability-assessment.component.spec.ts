import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CapabilityAssessmentComponent } from './capability-assessment.component';

describe('CapabilityAssessmentComponent', () => {
  let component: CapabilityAssessmentComponent;
  let fixture: ComponentFixture<CapabilityAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CapabilityAssessmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CapabilityAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

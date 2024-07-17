import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitalTransformationRoadmapComponent } from './digital-transformation-roadmap.component';

describe('DigitalTransformationRoadmapComponent', () => {
  let component: DigitalTransformationRoadmapComponent;
  let fixture: ComponentFixture<DigitalTransformationRoadmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DigitalTransformationRoadmapComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DigitalTransformationRoadmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

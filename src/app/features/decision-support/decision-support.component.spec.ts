import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionSupportComponent } from './decision-support.component';

describe('DecisionSupportComponent', () => {
  let component: DecisionSupportComponent;
  let fixture: ComponentFixture<DecisionSupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecisionSupportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DecisionSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

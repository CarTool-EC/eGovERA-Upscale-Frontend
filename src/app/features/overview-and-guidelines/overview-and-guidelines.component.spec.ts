import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewAndGuidelinesComponent } from './overview-and-guidelines.component';

describe('OverviewAndGuidelinesComponent', () => {
  let component: OverviewAndGuidelinesComponent;
  let fixture: ComponentFixture<OverviewAndGuidelinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewAndGuidelinesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OverviewAndGuidelinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

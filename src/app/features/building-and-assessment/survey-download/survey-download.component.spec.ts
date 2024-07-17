import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyDownloadComponent } from './survey-download.component';

describe('SurveyDownloadComponent', () => {
  let component: SurveyDownloadComponent;
  let fixture: ComponentFixture<SurveyDownloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyDownloadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SurveyDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

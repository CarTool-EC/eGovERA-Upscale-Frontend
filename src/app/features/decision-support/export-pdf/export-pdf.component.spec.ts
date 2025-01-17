import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportPdfComponent } from './export-pdf.component';

describe('ExportPdfComponent', () => {
  let component: ExportPdfComponent;
  let fixture: ComponentFixture<ExportPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportPdfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExportPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

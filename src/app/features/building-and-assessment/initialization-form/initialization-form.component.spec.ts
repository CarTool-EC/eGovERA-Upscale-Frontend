import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitializationFormComponent } from './initialization-form.component';

describe('InitializationFormComponent', () => {
  let component: InitializationFormComponent;
  let fixture: ComponentFixture<InitializationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitializationFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InitializationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DigitalBusinessCapability } from '@shared/classes/DigitalBusinessCapability.class';
import { Assessment } from '@shared/classes/Assessment.class';
import { StorageService } from '@shared/services/storage.service';

@Component({
  selector: 'app-initialization-form',
  templateUrl: './initialization-form.component.html',
  styleUrl: './initialization-form.component.scss'
})
export class InitializationFormComponent implements OnInit {
  @Output() startAssessment: EventEmitter<{ contactInfo: any, domainList: { id: string, value: string }[] }> = new EventEmitter();
  @Output() loadedSurvey: EventEmitter<{ selectedDBCs: { businessAgnostic: DigitalBusinessCapability[], customs: DigitalBusinessCapability[], health: DigitalBusinessCapability[], taxes: DigitalBusinessCapability[] }, assessments: Assessment[], selectedDomains: { id: string, value: string }[], contactInfo: any }> = new EventEmitter();

  public completeDomainList: { id: string, value: string }[] = [
    { id: 'businessAgnostic', value: 'Business Agnostic' },
    { id: 'customs', value: 'Customs' },
    { id: 'health', value: 'Health' },
    { id: 'taxes', value: 'Taxes' }
  ];
  public contactInformationForm: FormGroup;
  public businessDomainForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private storageService: StorageService,
  ) { }

  ngOnInit(): void {
    this.contactInformationForm = this.fb.group({
      fullName: new FormControl({ value: null, disabled: false }, [Validators.required]),
      organisation: new FormControl({ value: null, disabled: false }, [Validators.required]),
      organisationEmail: new FormControl({ value: null, disabled: false }, [Validators.required]),
      country: new FormControl({ value: null, disabled: false }, [Validators.required]),
    });

    this.businessDomainForm = this.fb.group({
      businessAgnostic: new FormControl({ value: true, disabled: false }),
      customs: new FormControl({ value: false, disabled: false }),
      health: new FormControl({ value: false, disabled: false }),
      taxes: new FormControl({ value: false, disabled: false })
    });
  }

  public onStartAssessmentClick(): void {
    let selectedDomainList: { id: string, value: string }[] = [];

    this.completeDomainList.forEach((domain: { id: string, value: string }) => {
      if (this.businessDomainForm.get(domain.id).value) {
        selectedDomainList.push(domain);
      }
    });

    this.startAssessment.emit({ contactInfo: this.contactInformationForm.value, domainList: selectedDomainList });
  }

  public surveyUpload(event): void {
    this.loadFile(event.target.files[0]);
  }

  private loadFile(file: File): void {
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      let result = e.target.result;
      if (typeof result === 'string') {
        let loadedData: { data: any[], contactInfo: any } = JSON.parse(result);
        let surveyAssessments: Assessment[] = [];
        loadedData.data.forEach((data: any) => {
          surveyAssessments.push(Assessment.parseAssessmentSurvey(data));
        });

        let DBCs: { businessAgnostic: DigitalBusinessCapability[], customs: DigitalBusinessCapability[], health: DigitalBusinessCapability[], taxes: DigitalBusinessCapability[] } = this.storageService.getFilteredDBCs();
        let surveyDBCs: { businessAgnostic: DigitalBusinessCapability[], customs: DigitalBusinessCapability[], health: DigitalBusinessCapability[], taxes: DigitalBusinessCapability[] } = { businessAgnostic: [], customs: [], health: [], taxes: [] };
        let surveyDomains: { id: string, value: string }[] = [];
        surveyAssessments.forEach((assessment: Assessment) => {
          let assessedDomain: { id: string, value: string } = this.completeDomainList.filter(element => element.value === assessment.Policy)[0];
          let assessedDBC: DigitalBusinessCapability = DBCs[assessedDomain.id].filter((dbc: DigitalBusinessCapability) => dbc.Puri === assessment.Puri)[0];
          if (assessedDBC != undefined) {
            surveyDBCs[assessedDomain.id].push(assessedDBC);
            if (!surveyDomains.includes(assessedDomain)) {
              surveyDomains.push(assessedDomain);
            }
          }
        });

        let uploadedSurvey: { selectedDBCs: { businessAgnostic: DigitalBusinessCapability[], customs: DigitalBusinessCapability[], health: DigitalBusinessCapability[], taxes: DigitalBusinessCapability[] }, assessments: Assessment[], selectedDomains: { id: string, value: string }[], contactInfo: any } = {
          selectedDBCs: surveyDBCs,
          assessments: surveyAssessments,
          selectedDomains: surveyDomains,
          contactInfo: loadedData.contactInfo
        }

        this.loadedSurvey.emit(uploadedSurvey);
      }
    }

    fileReader.readAsText(file);
  }

  public isFormValid(): boolean {
    return this.contactInformationForm.valid;
  }
}

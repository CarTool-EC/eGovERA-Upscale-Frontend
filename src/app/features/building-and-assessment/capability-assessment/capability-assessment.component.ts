import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DigitalBusinessCapability } from '@shared/classes/DigitalBusinessCapability.class';
import { Assessment } from '@shared/classes/Assessment.class';
import { EuiDialogComponent } from '@eui/components/eui-dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { StorageService } from '@shared/services/storage.service';

@Component({
  selector: 'app-capability-assessment',
  templateUrl: './capability-assessment.component.html',
  styleUrl: './capability-assessment.component.scss'
})
export class CapabilityAssessmentComponent implements OnInit {
  @ViewChild('dbcDialog') dbcDialog: EuiDialogComponent;
  @ViewChild('instructionsDialog') instructionsDialog: EuiDialogComponent;

  @Input() selectedDomains: {id: string, value: string}[];
  @Input() previouslySelectedDBCs: {businessAgnostic: DigitalBusinessCapability[], customs: DigitalBusinessCapability[], health: DigitalBusinessCapability[], taxes: DigitalBusinessCapability[]} = {businessAgnostic: [], customs: [], health: [], taxes: []};
  @Input() assessments: Assessment[];

  @Output() capabilityAssessment: EventEmitter<{selectedDBCs: {businessAgnostic: DigitalBusinessCapability[], customs: DigitalBusinessCapability[], health: DigitalBusinessCapability[], taxes: DigitalBusinessCapability[]}, assessments: Assessment[]}> = new EventEmitter();
  @Output() pauseAssessment: EventEmitter<Assessment[]> = new EventEmitter();
  @Output() returnToStart: EventEmitter<boolean> = new EventEmitter();

  public DBCs: {businessAgnostic: DigitalBusinessCapability[], customs: DigitalBusinessCapability[], health: DigitalBusinessCapability[], taxes: DigitalBusinessCapability[]};

  public currentDomain: string;
  public currentDomainDBCs: DigitalBusinessCapability[] = [];

  public selectedDBC: DigitalBusinessCapability = null
  public selectedDBCs: {businessAgnostic: DigitalBusinessCapability[], customs: DigitalBusinessCapability[], health: DigitalBusinessCapability[], taxes: DigitalBusinessCapability[]} = {businessAgnostic: [], customs: [], health: [], taxes: []};

  public selectedAssessment: Assessment = null;
  public assessmentList: Assessment[] = [];

  // public loading: boolean = true;

  public ratingOptions: number[] = [1, 2, 3, 4, 5];
  public strategicFitForm: FormGroup;

  constructor(
    private storageService: StorageService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.currentDomain = this.selectedDomains[0].id;
    this.strategicFitForm = this.fb.group({
      strategicFit: new FormControl({ value: null, disabled: false })
    });
    if (this.assessments != null) {
      this.selectedDBCs = this.previouslySelectedDBCs;
      this.assessmentList = this.assessments;
    }
    this.loadDigitalBusinessCapabilities();
  }

  public onSaveSurveyClick(): void {
    this.pauseAssessment.emit(this.assessmentList);
  }

  public onDbcCardClick(pClickedDbc: DigitalBusinessCapability): void {
    this.selectedDBC = pClickedDbc;

    if (this.selectedDBCs[this.currentDomain].includes(this.selectedDBC)) {
      this.selectedAssessment = this.assessmentList.filter((assessment: Assessment) => assessment.Puri === this.selectedDBC.Puri)[0];
      this.strategicFitForm.get('strategicFit').setValue(this.selectedAssessment.StrategicFit);
    } else {
      this.strategicFitForm.get('strategicFit').setValue(null);
    }

    this.dbcDialog.openDialog();
  }

  public onDialogConfirm(): void {
    if (this.selectedDBCs[this.currentDomain].includes(this.selectedDBC)) {
      this.selectedAssessment.setStrategicFit(this.strategicFitForm.get('strategicFit').value);
    } else {
      this.selectedDBCs[this.currentDomain].push(this.selectedDBC);

      let newAssessment: Assessment = Assessment.initializeNewAssessment(this.selectedDBC.Puri, this.selectedDBC.Name, this.selectedDBC.Policy, this.strategicFitForm.get('strategicFit').value);
      this.assessmentList.push(newAssessment);
    }

    this.dbcDialog.closeDialog();
  }

  public onDialogCancel(): void {
    if (this.selectedDBCs[this.currentDomain].includes(this.selectedDBC)) {
      let dbcIndex: number = this.selectedDBCs[this.currentDomain].indexOf(this.selectedDBC);
      this.selectedDBCs[this.currentDomain].splice(dbcIndex, 1);

      let assessmentIndex: number = this.assessmentList.indexOf(this.selectedAssessment);
      this.assessmentList.splice(assessmentIndex, 1);
    }

    this.dbcDialog.closeDialog();
  }

  public onReturnToForm(): void {
    this.returnToStart.emit(true);
  }

  public onRemoveAllClick() {
    this.selectedDBCs = {businessAgnostic: [], customs: [], health: [], taxes: []};
    this.assessmentList = [];
  }
  
  public onTabSelect(event: any) {
    this.currentDomain = this.selectedDomains[event.index].id;
    this.currentDomainDBCs = this.DBCs[this.currentDomain];
  }

  public onNextStepClick() {
    this.selectedDomains.forEach((domain: {id: string, value: string}) => {
      this.selectedDBCs[domain.id].sort(function(a, b) {
        let textA = a.Name.toUpperCase();
        let textB = b.Name.toUpperCase();
  
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });
    });

    let capabilityAssessment: {selectedDBCs: {businessAgnostic: DigitalBusinessCapability[], customs: DigitalBusinessCapability[], health: DigitalBusinessCapability[], taxes: DigitalBusinessCapability[]}, assessments: Assessment[]} = {
      selectedDBCs: this.selectedDBCs, 
      assessments: this.assessmentList
    }

    this.capabilityAssessment.emit(capabilityAssessment);
  }

  public getSelectedDbcNumber(domain: {id: string, value: string}) {
    return this.selectedDBCs[domain.id].filter((dbc: DigitalBusinessCapability) => dbc.Policy === domain.value).length;
  }

  public onShowInstructionsClick(): void {
    this.instructionsDialog.openDialog();
  }

  private loadDigitalBusinessCapabilities() {
    this.DBCs = this.storageService.getFilteredDBCs();
    this.currentDomainDBCs = this.DBCs[this.currentDomain];
  }
}

import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DigitalBusinessCapability } from '@shared/classes/DigitalBusinessCapability.class';
import { Assessment } from '@shared/classes/Assessment.class';
import { EuiDialogComponent } from '@eui/components/eui-dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { StorageService } from '@shared/services/storage.service';
import { ModelDigitalBusinessCapability } from '@shared/classes/ModelDigitalBusinessCapability.class';

@Component({
  selector: 'app-capability-assessment',
  templateUrl: './capability-assessment.component.html',
  styleUrl: './capability-assessment.component.scss',
  standalone: false
})
export class CapabilityAssessmentComponent implements OnInit {
  @ViewChild('dbcDialog') dbcDialog: EuiDialogComponent;
  @ViewChild('instructionsDialog') instructionsDialog: EuiDialogComponent;
  @ViewChild('nameFileDialog') nameFileDialog: EuiDialogComponent;
  @ViewChild('saveSurveyDialog') saveSurveyDialog: EuiDialogComponent;

  @Input() selectedDomains: {id: string, value: string}[];
  @Input() previouslySelectedDBCs: {businessAgnostic: DigitalBusinessCapability[], customs: DigitalBusinessCapability[], health: DigitalBusinessCapability[], taxes: DigitalBusinessCapability[]} = {businessAgnostic: [], customs: [], health: [], taxes: []};
  @Input() assessments: Assessment[];
  @Input() modelDBCs: {businessAgnostic: ModelDigitalBusinessCapability[], customs: ModelDigitalBusinessCapability[], health: ModelDigitalBusinessCapability[], taxes: ModelDigitalBusinessCapability[]};
  
  @Output() capabilityAssessment: EventEmitter<{selectedDBCs: {businessAgnostic: DigitalBusinessCapability[], customs: DigitalBusinessCapability[], health: DigitalBusinessCapability[], taxes: DigitalBusinessCapability[]}, assessments: Assessment[]}> = new EventEmitter();
  @Output() pauseAssessment: EventEmitter<void> = new EventEmitter();
  @Output() downloadAssessment: EventEmitter<{filename: string, assessments: Assessment[]}> = new EventEmitter();
  @Output() returnToStart: EventEmitter<boolean> = new EventEmitter();
  
  public DBCs: {businessAgnostic: DigitalBusinessCapability[], customs: DigitalBusinessCapability[], health: DigitalBusinessCapability[], taxes: DigitalBusinessCapability[]};

  public currentDomain: string;
  public currentDomainDBCs: DigitalBusinessCapability[] = [];

  public selectedDBC: DigitalBusinessCapability = null
  public selectedDBCs: {businessAgnostic: DigitalBusinessCapability[], customs: DigitalBusinessCapability[], health: DigitalBusinessCapability[], taxes: DigitalBusinessCapability[]} = {businessAgnostic: [], customs: [], health: [], taxes: []};

  public selectedAssessment: Assessment = null;
  public assessmentList: Assessment[] = [];

  public ratingOptions: number[] = [1, 2, 3, 4, 5];
  public strategicFitForm: FormGroup;
  public filename: FormGroup;

  constructor(
    private storageService: StorageService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.currentDomain = this.selectedDomains[0].id;
    // this.strategicFitForm = this.fb.group({
    //   strategicFit: new FormControl({ value: null, disabled: false })
    // });
    this.strategicFitForm = new FormGroup({
      strategicFit: new FormControl({value: null, disabled: false})
    });
    this.filename = this.fb.group({
      filename: new FormControl({value: null, disabled: false}, [Validators.required])
    });
    if (this.assessments != null) {
      this.selectedDBCs = this.previouslySelectedDBCs;
      this.assessmentList = this.assessments;
    }
    this.loadDigitalBusinessCapabilities();
  }

  public downloadSurvey(): void {
    console.log(this.filename.value.filename);
    let lDownloadAssessment: {filename: string, assessments: Assessment[]} = {filename: this.filename.value.filename, assessments: this.assessmentList };
    this.downloadAssessment.emit(lDownloadAssessment);
  }

  public onSaveSurveyClick(): void {
    this.nameFileDialog.openDialog();
  }

  public onContinueClick(): void {
    this.downloadSurvey();
    this.nameFileDialog.closeDialog();
    this.saveSurveyDialog.openDialog();
  }

  public onCancelClick(): void {
    this.filename.reset();
    this.nameFileDialog.closeDialog();
  }

  public onReturnToFormClick(): void {
    this.saveSurveyDialog.closeDialog();
    this.pauseAssessment.emit();
  }

  public onContinueAssessmentClick(): void {
    this.saveSurveyDialog.closeDialog();
  }

  public onDbcCardClick(pClickedDbc: DigitalBusinessCapability): void {
    this.selectedDBC = pClickedDbc;

    if (this.selectedDBCs[this.currentDomain].includes(this.selectedDBC)) {
      this.selectedAssessment = this.assessmentList.filter((assessment: Assessment) => assessment.Puri === this.selectedDBC.Puri)[0];
      this.strategicFitForm.get('strategicFit').setValue(this.selectedAssessment.StrategicFit);
    } else {
      this.strategicFitForm.reset();
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

  shouldDisplayModelName(list: any[], index: number): boolean {
    if (index === 0) return true;
    return list[index].modelName !== list[index - 1].modelName;
  }
}

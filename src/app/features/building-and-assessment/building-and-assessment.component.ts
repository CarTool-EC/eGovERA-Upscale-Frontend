import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DigitalBusinessCapability } from '@shared/classes/DigitalBusinessCapability.class';
import { Assessment } from '@shared/classes/Assessment.class';

@Component({
  selector: 'app-building-and-assessment',
  templateUrl: './building-and-assessment.component.html',
  styleUrl: './building-and-assessment.component.scss'
})
export class BuildingAndAssessmentComponent implements OnInit {

  public showInitializationForm: boolean = true;
  public showCapabilityAssessment: boolean = false;
  public showRequirementsAssessment: boolean = false;
  public showSurveyDownload: boolean = false;

  public selectedDomainList: { id: string, value: string }[];
  public selectedDBCs: { businessAgnostic: DigitalBusinessCapability[], customs: DigitalBusinessCapability[], health: DigitalBusinessCapability[], taxes: DigitalBusinessCapability[] } = null;
  public assessments: Assessment[] = null;
  public contactInfo: any = null;

  constructor() { }

  ngOnInit(): void {

  }

  public onPauseAssessmentClick(assessmentList: Assessment[]) {
    this.downloadAssessmentJson(assessmentList);

    this.selectedDomainList = [];
    this.selectedDBCs = null;
    this.assessments = null;

    this.showCapabilityAssessment = false;
    this.showRequirementsAssessment = false;
    this.showSurveyDownload = false;
    this.showInitializationForm = true;
  }

  public onReturnToStartFormClick(action: boolean): void {
    this.showCapabilityAssessment = false;
    this.showRequirementsAssessment = false;
    this.showSurveyDownload = false;
    this.showInitializationForm = true;
  }

  private downloadAssessmentJson(assessmentList: Assessment[]): void {
    let link = document.createElement("a")
    link.href = URL.createObjectURL(new Blob([JSON.stringify(assessmentList, null, 2)], {
      type: "application/json"
    }));

    link.setAttribute("download", "survey_result.json");
    link.click();
  }

  public onReturnClick(assessmentList: Assessment[]): void {
    this.assessments = assessmentList;
    this.showRequirementsAssessment = false;
    this.showCapabilityAssessment = true;
  }

  public onStartAssessmentClick(startInfo: {contactInfo: any, domainList: { id: string, value: string }[]}): void {
    this.selectedDomainList = startInfo.domainList;
    this.contactInfo = startInfo.contactInfo;
    this.showInitializationForm = false;
    this.showCapabilityAssessment = true;
  }

  public onCapabilityAssessmentFinish(capabilityAssessment: { selectedDBCs: { businessAgnostic: DigitalBusinessCapability[], customs: DigitalBusinessCapability[], health: DigitalBusinessCapability[], taxes: DigitalBusinessCapability[] }, assessments: Assessment[] }): void {
    this.selectedDBCs = capabilityAssessment.selectedDBCs;
    this.assessments = capabilityAssessment.assessments;

    this.showCapabilityAssessment = false;
    this.showRequirementsAssessment = true;
  }

  public finalizeAssessment(assessmentList: Assessment[]): void {
    this.assessments = assessmentList;

    this.showRequirementsAssessment = false;
    this.showSurveyDownload = true;
  }

  public onLoadedSurvey(capabilityAssessment: { selectedDBCs: { businessAgnostic: DigitalBusinessCapability[], customs: DigitalBusinessCapability[], health: DigitalBusinessCapability[], taxes: DigitalBusinessCapability[] }, assessments: Assessment[], selectedDomains: { id: string, value: string }[], contactInfo: any }): void {
    console.log(capabilityAssessment);
    this.selectedDBCs = capabilityAssessment.selectedDBCs;
    this.assessments = capabilityAssessment.assessments;
    console.log(this.assessments);
    this.contactInfo = capabilityAssessment.contactInfo;
    this.selectedDomainList = capabilityAssessment.selectedDomains;

    this.showInitializationForm = false;
    this.showCapabilityAssessment = true;
  }
}

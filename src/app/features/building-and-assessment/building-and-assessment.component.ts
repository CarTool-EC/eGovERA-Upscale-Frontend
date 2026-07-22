import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DigitalBusinessCapability } from '@shared/classes/DigitalBusinessCapability.class';
import { Assessment } from '@shared/classes/Assessment.class';
import { ModelDigitalBusinessCapability } from '@shared/classes/ModelDigitalBusinessCapability.class';
import { ArchitectureBuildingBlock } from '@shared/classes/ArchitectureBuildingBlock.class';
import { StorageService } from '@shared/services/storage.service';

@Component({
  selector: 'app-building-and-assessment',
  templateUrl: './building-and-assessment.component.html',
  styleUrl: './building-and-assessment.component.scss',
  standalone: false
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
  public modelDBCs: {businessAgnostic: ModelDigitalBusinessCapability[], customs: ModelDigitalBusinessCapability[], health: ModelDigitalBusinessCapability[], taxes: ModelDigitalBusinessCapability[]} = {businessAgnostic: [], customs: [], health: [], taxes: []};
  public modelABBs: Map<string, ArchitectureBuildingBlock[]> = new Map();

  public defaultFilename: string = "survey_result.json";

  constructor(private storageService: StorageService) { }

  ngOnInit(): void {

  }

  public onPauseAssessmentClick() {
    this.selectedDomainList = [];
    this.selectedDBCs = null;
    this.assessments = null;

    this.showCapabilityAssessment = false;
    this.showRequirementsAssessment = false;
    this.showSurveyDownload = false;
    this.showInitializationForm = true;
  }

  public onReturnToStartFormClick(action: boolean): void {
    this.selectedDomainList = [];
    this.selectedDBCs = null;
    this.assessments = null;
    
    this.showCapabilityAssessment = false;
    this.showRequirementsAssessment = false;
    this.showSurveyDownload = false;
    this.showInitializationForm = true;
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

  public onLoadedSurvey(capabilityAssessment: { selectedDBCs: { businessAgnostic: DigitalBusinessCapability[], customs: DigitalBusinessCapability[], health: DigitalBusinessCapability[], taxes: DigitalBusinessCapability[] }, assessments: Assessment[], selectedDomains: { id: string, value: string }[], contactInfo: any, modelDBCs: {businessAgnostic: ModelDigitalBusinessCapability[], customs: ModelDigitalBusinessCapability[], health: ModelDigitalBusinessCapability[], taxes: ModelDigitalBusinessCapability[]}}): void {
    this.selectedDBCs = capabilityAssessment.selectedDBCs;
    this.assessments = capabilityAssessment.assessments;
    this.contactInfo = capabilityAssessment.contactInfo;
    this.selectedDomainList = capabilityAssessment.selectedDomains;
    this.modelDBCs = capabilityAssessment.modelDBCs;

    this.showInitializationForm = false;
    this.showCapabilityAssessment = true;
  }

  public onsendModelDBCs(dbcs: {businessAgnostic: ModelDigitalBusinessCapability[], customs: ModelDigitalBusinessCapability[], health: ModelDigitalBusinessCapability[], taxes: ModelDigitalBusinessCapability[]}): void {
    this.modelDBCs = dbcs;
  }

  public downloadAssessmentJson(data: {filename: string, assessments: Assessment[]}): void {
    const modelABBsMap = Object.fromEntries(this.storageService.getAllAdHocRequirements());
    const modelDPSsMap = Object.fromEntries(this.storageService.getAllAdHocDPSs());
    let link: HTMLAnchorElement = document.createElement("a")
    let downloadContent = {data: data.assessments, contactInfo: this.contactInfo, selectedDomainList: this.selectedDomainList, modelDBCs: this.modelDBCs, modelABBs: this.modelABBs, modelABBsMap: modelABBsMap, modelDPSsMap: modelDPSsMap};
    link.href = URL.createObjectURL(new Blob([JSON.stringify(downloadContent, null, 2)], {
      type: "application/json"
    }));

    let filename: string = data.filename != null ? data.filename : this.defaultFilename;
    link.setAttribute("download", filename);
    link.click();
    link.remove();
  }

  private reset() {
    this.selectedDomainList = [];
    this.selectedDBCs = null;
    this.assessments = null;
    this.contactInfo = null;
    this.modelDBCs = {businessAgnostic: [], customs: [], health: [], taxes: []};
    this.modelABBs = new Map();
  }
}

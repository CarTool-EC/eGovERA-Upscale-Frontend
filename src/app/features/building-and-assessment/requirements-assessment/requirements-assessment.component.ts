import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ArchitectureBuildingBlock } from '@shared/classes/ArchitectureBuildingBlock.class';
import { Assessment } from '@shared/classes/Assessment.class';
import { DigitalBusinessCapability } from '@shared/classes/DigitalBusinessCapability.class';
import { DigitalPublicService } from '@shared/classes/DigitalPublicService.class';
import { StorageService } from '@shared/services/storage.service';
import { EuiCardComponent } from '@eui/components/eui-card';


@Component({
  selector: 'app-requirements-assessment',
  templateUrl: './requirements-assessment.component.html',
  styleUrl: './requirements-assessment.component.scss'
})
export class RequirementsAssessmentComponent implements OnInit {
  @ViewChild('testingCard') testingCard: EuiCardComponent;
  @Input() assessments: Assessment[];
  @Input() selectedDBCs: { businessAgnostic: DigitalBusinessCapability[], customs: DigitalBusinessCapability[], health: DigitalBusinessCapability[], taxes: DigitalBusinessCapability[] };
  @Input() selectedDomains: { id: string, value: string }[];

  @Output() finalizedAssessments: EventEmitter<Assessment[]> = new EventEmitter();
  @Output() pauseAssesment: EventEmitter<Assessment[]> = new EventEmitter();
  @Output() return: EventEmitter<Assessment[]> = new EventEmitter();

  public viewList: { id: string, value: string }[] = [
    { id: 'Legal', value: 'Legal' },
    { id: 'Organisational', value: 'Organisational' },
    { id: 'Semantic', value: 'Semantic' },
    { id: 'TechnicalApplication', value: 'Technical - Application' },
    { id: 'TechnicalInfrastructure', value: 'Technical - Infrastructure' }
  ];
  public supportAbilityOptions: { id: any, value: any }[] = [
    { id: 1, value: 1 },
    { id: 2, value: 2 },
    { id: 3, value: 3 },
    { id: 4, value: 4 },
    { id: 5, value: 5 },
    { id: -1, value: "Not applicable" }
  ];
  public expectedPublicValueOptions: number[] = [1, 2, 3, 4, 5];
  public ABBs: ArchitectureBuildingBlock[];
  public DPSs: DigitalPublicService[]

  public DBCList: DigitalBusinessCapability[];
  public relatedABBList: ArchitectureBuildingBlock[];
  public ABBsByViews: {
    Legal: ArchitectureBuildingBlock[],
    Organisational: ArchitectureBuildingBlock[],
    Semantic: ArchitectureBuildingBlock[],
    TechnicalApplication: ArchitectureBuildingBlock[],
    TechnicalInfrastructure: ArchitectureBuildingBlock[]
  } = { Legal: [], Organisational: [], Semantic: [], TechnicalApplication: [], TechnicalInfrastructure: [] };
  public relatedDPSList: any[];
  public ABBRelatedDPSList: DigitalPublicService[];

  public currentDBC: DigitalBusinessCapability;
  public currentAssessment: Assessment;
  public currentDomain: { id: string, value: string };
  public selectedABB: ArchitectureBuildingBlock = null;
  public selectedView: string = null;

  public supportAbilityForm: FormGroup = null;

  constructor(
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    this.selectedCurrentDBC();
    this.loadResources();
    this.generateForm();
    console.log(this.supportAbilityForm.value);
  }

  public domainsHasSelectedDbcs(domain: string) {
    return this.selectedDBCs[domain].length != 0;
  }

  public onNextDbcClick(dbc: DigitalBusinessCapability): void {
    this.testingCard.euiCollapsed = true;
    this.selectedABB = null;
    this.selectedView = null;

    this.selectedCurrentDBC(dbc);
    this.parseRelatedResources();
  }

  public calculateSupportAbility(dbc: DigitalBusinessCapability): number {
    let index: number = this.DBCList.indexOf(dbc);

    let supportAbilitySum: number = 0;
    let count: number = 0;
    let evaluatedDPSs = [];
    this.relatedDPSList[index].forEach((dps: DigitalPublicService) => {
      let dpsSupportAbility: number = this.supportAbilityForm.value[dbc.Puri + '-' + dps.Puri + '-supportAbility'];
      if (dpsSupportAbility != null && dpsSupportAbility != -1 && !evaluatedDPSs.includes(dps.Puri)) {
        count = count + 1;
        evaluatedDPSs.push(dps.Puri);
        supportAbilitySum = supportAbilitySum + dpsSupportAbility;
      }
    });

    if (count != 0) {
      return Math.round(supportAbilitySum / count);
    } else {
      return 1;
    }
  }

  public calculateTargetSupportAbility(dbc: DigitalBusinessCapability, viewId: string): number {
    let viewTargetSupportAbility: number = this.supportAbilityForm.value[dbc.Puri + '-' + viewId + '-targetSupportAbility'];

    if (viewTargetSupportAbility != null) {
      return Math.round(viewTargetSupportAbility);
    } else {
      return 1;
    }
  }

  public calculateGap(dbc: DigitalBusinessCapability, viewId: string): number {
    let supportAbility: number = this.calculateSupportAbility(dbc);
    let targetSupportAbility: number = this.calculateTargetSupportAbility(dbc, viewId);

    return Math.round(supportAbility - targetSupportAbility);
  }

  public calculateOverallSupportAbility(): number {
    let index: number = this.DBCList.indexOf(this.currentDBC);

    let supportAbilitySum: number = 0;
    let count: number = 0;
    let evaluatedDPSs = [];
    this.relatedDPSList[index].forEach((dps: DigitalPublicService) => {
      let dpsSupportAbility: number = this.supportAbilityForm.value[this.currentDBC.Puri + '-' + dps.Puri + '-supportAbility'];
      if (dpsSupportAbility != null && dpsSupportAbility != -1 && !evaluatedDPSs.includes(dps.Puri)) {
        count = count + 1;
        evaluatedDPSs.push(dps.Puri);
        supportAbilitySum = supportAbilitySum + dpsSupportAbility;
      }
    });

    if (count != 0) {
      return Math.round(supportAbilitySum / count);
    } else {
      return 1;
    }
  }

  public calculateOverallTargetSupportAbility(): number {
    let targetAbilitySum: number = 0;
    let count: number = 0;

    let evaluatedViews = [];
    this.viewList.forEach((view: { id: string, value: string }) => {
      let viewTargetSupportAbility: number = this.supportAbilityForm.value[this.currentDBC.Puri + '-' + view.id + '-targetSupportAbility'];
      if (viewTargetSupportAbility != null && !evaluatedViews.includes(view.id)) {
        count = count + 1;
        evaluatedViews.push(view.id);
        targetAbilitySum = targetAbilitySum + viewTargetSupportAbility;
      }

    });

    if (count != 0) {
      return Math.round(targetAbilitySum / count);
    } else {
      return 1;
    }
  }

  public calculateOverallGap(): number {
    let overallSupportAbility: number = this.calculateOverallSupportAbility();
    let overallTargetSupportAbility: number = this.calculateOverallTargetSupportAbility();

    return Math.round(overallSupportAbility - overallTargetSupportAbility);
  }


  public isItemActive(dbc: DigitalBusinessCapability): boolean {
    return dbc.Puri == this.currentDBC.Puri;
  }

  public isViewCardCollapsible(view: string): boolean {
    return this.ABBsByViews[view].length != 0;
  }

  public isViewCardCollapsed(view: string): boolean {
    return this.selectedView === null || this.selectedView != view;
  }

  public isAbbCardCollapsible(abb: ArchitectureBuildingBlock): boolean {
    return abb.RelatedDPSs.length != 0;
  }

  public isAbbCardCollapsed(abb: ArchitectureBuildingBlock): boolean {
    return this.selectedABB === null || this.selectedABB.Puri != abb.Puri;
  }

  public onViewClick(view: string): void {
    if (this.isViewCardCollapsible(view)) {
      this.selectedView = view;
    }
  }

  public onABBClick(pABB: ArchitectureBuildingBlock): void {
    if (this.isAbbCardCollapsible(pABB)) {
      this.selectedABB = pABB;
      this.ABBRelatedDPSList = this.DPSs.filter((dps: DigitalPublicService) => pABB.RelatedDPSs.includes(dps.Puri));
    }
  }

  public onSupportAbilityClick(pDPS: DigitalPublicService) {
    let lDPSAssessment = { Name: pDPS.Name, SupportAbility: this.supportAbilityForm.value[this.currentDBC.Puri + "-" + pDPS.Puri + "-supportAbility"] };
    this.currentAssessment.addDPSValue(pDPS.Puri, lDPSAssessment);

    let lABBSupportAbility = { Name: this.selectedABB.Name, SupportAbility: this.calculateAverageABBSupportAbility() };
    this.currentAssessment.addABBValue(this.selectedABB.Puri, lABBSupportAbility);

    let lViewAssessment = { SupportAbility: this.calculateSupportAbility(this.currentDBC), TargetSupportAbility: this.calculateTargetSupportAbility(this.currentDBC, this.selectedView) };
    this.currentAssessment.addViewValue(this.selectedView, lViewAssessment);

    console.log(this.currentAssessment);
  }

  public onTargetSupportAbilityClick(pViewId: string) {
    let lViewAssessment = { SupportAbility: this.calculateSupportAbility(this.currentDBC), TargetSupportAbility: this.calculateTargetSupportAbility(this.currentDBC, pViewId) };
    this.currentAssessment.addViewValue(pViewId, lViewAssessment);
    console.log(this.currentAssessment);
  }

  private calculateAverageABBSupportAbility(): number {
    let lABBSupportAbilitySum = 0;
    let count = 0;
    this.ABBRelatedDPSList.forEach((pDPS: DigitalPublicService) => {
      let lDPSSupportAbility = this.supportAbilityForm.value[this.currentDBC.Puri + "-" + pDPS.Puri + "-supportAbility"];
      if (lDPSSupportAbility != null && lDPSSupportAbility != -1) {
        count = count + 1;
        lABBSupportAbilitySum = lABBSupportAbilitySum + lDPSSupportAbility;
      }
    });

    let lABBSupportAbbility = 1;
    if (count > 0) {
      lABBSupportAbbility = lABBSupportAbilitySum / count;
    }

    return lABBSupportAbbility;
  }

  private selectedCurrentDBC(dbc?: DigitalBusinessCapability): void {
    if (!dbc) {
      this.currentDBC = this.selectedDBCs.businessAgnostic.length != 0 ? this.selectedDBCs.businessAgnostic[0] :
        this.selectedDBCs.customs.length != 0 ? this.selectedDBCs.customs[0] :
          this.selectedDBCs.health.length != 0 ? this.selectedDBCs.health[0] : this.selectedDBCs.taxes[0];
    } else {
      this.currentDBC = dbc;
    }

    this.currentAssessment = this.assessments.filter((assessment: Assessment) => assessment.Puri === this.currentDBC.Puri)[0];
    this.currentDomain = this.selectedDomains.filter((domain: { id: string, value: string }) => this.currentDBC.Policy === domain.value)[0];
  }

  private loadResources(): void {
    this.ABBs = this.storageService.getABBs();
    this.DPSs = this.storageService.getDPSs();
    this.parseRelatedResources();
  }

  private parseRelatedResources(): void {
    this.relatedABBList = this.ABBs.filter((abb: ArchitectureBuildingBlock) => abb.RelatedDBCs.includes(this.currentDBC.Puri));
    this.viewList.forEach((view: { id: string, value: string }) => {
      this.ABBsByViews[view.id] = this.relatedABBList.filter((abb: ArchitectureBuildingBlock) => abb.View === view.value);
    });
  }

  public isFirstDBC(): boolean {
    let index: number = this.DBCList.indexOf(this.currentDBC);

    return index == 0;
  }

  public isLastDBC(): boolean {
    let index: number = this.DBCList.indexOf(this.currentDBC);

    return index == this.DBCList.length - 1;
  }

  public changeDBC(type: string): void {
    let index: number = this.DBCList.indexOf(this.currentDBC);
    switch (type) {
      case 'prev': {
        if (index > 0) {
          let nextDBC: DigitalBusinessCapability = this.DBCList[index - 1];
          this.onNextDbcClick(nextDBC);
        }
        break;
      }
      case 'next': {
        if (index < this.DBCList.length) {
          let nextDBC: DigitalBusinessCapability = this.DBCList[index + 1];
          this.onNextDbcClick(nextDBC);
        }
        break;
      } default: {
        this.selectedCurrentDBC();
        break;
      }
    }
  }

  public finalizeAssessment(): void {
    this.parseAssessmentResults();
    this.finalizedAssessments.emit(this.assessments);
  }

  public onSaveSurveyClick(): void {
    this.parseAssessmentResults();
    this.pauseAssesment.emit(this.assessments);
  }

  public returnToCapabilityAssessment(): void {
    this.parseAssessmentResults();
    this.return.emit(this.assessments);
  }

  private generateForm(): void {
    this.relatedDPSList = [];
    this.DBCList = [];
    this.supportAbilityForm = new FormGroup({});
    this.selectedDomains.forEach((domain: { id: string, value: string }) => {
      this.selectedDBCs[domain.id].forEach((dbc: DigitalBusinessCapability) => {
        this.DBCList.push(dbc);
        if (this.currentAssessment.ExpectedPublicValue > 0) {
          this.supportAbilityForm.addControl(dbc.Puri + '-expectedPublicValue', new FormControl(this.currentAssessment.ExpectedPublicValue));
        } else {
          this.supportAbilityForm.addControl(dbc.Puri + '-expectedPublicValue', new FormControl(null));
        }
        if (this.currentAssessment.EstimatedBudget > 0) {
          this.supportAbilityForm.addControl(dbc.Puri + '-estimatedBudget', new FormControl(this.currentAssessment.EstimatedBudget));
        } else {
          this.supportAbilityForm.addControl(dbc.Puri + '-estimatedBudget', new FormControl(null));
        }
        this.viewList.forEach((view: { id: string, value: string }) => {
          if (this.currentAssessment.View[view.id] != undefined && this.currentAssessment.View[view.id].TargetSupportAbility > 0) {
            this.supportAbilityForm.addControl(dbc.Puri + '-' + view.id + '-targetSupportAbility', new FormControl(this.currentAssessment.View[view.id].TargetSupportAbility));
          } else {
            this.supportAbilityForm.addControl(dbc.Puri + '-' + view.id + '-targetSupportAbility', new FormControl(null));
          }
        });

        let DBCRelatedDPSList = [];
        let relatedABBs = this.ABBs.filter((abb: ArchitectureBuildingBlock) => abb.RelatedDBCs.includes(dbc.Puri));
        relatedABBs.forEach((abb: ArchitectureBuildingBlock) => {
          let relatedDPSs = this.DPSs.filter((dps: DigitalPublicService) => abb.RelatedDPSs.includes(dps.Puri));
          relatedDPSs.forEach((dps: DigitalPublicService) => {
            DBCRelatedDPSList.push(dps);
            if (this.currentAssessment.DigitalPublicService[dps.Puri] != undefined && this.currentAssessment.DigitalPublicService[dps.Puri].SupportAbility > 0) {
              this.supportAbilityForm.addControl(dbc.Puri + '-' + dps.Puri + '-supportAbility', new FormControl(this.currentAssessment.DigitalPublicService[dps.Puri].SupportAbility));
            } else {
              this.supportAbilityForm.addControl(dbc.Puri + '-' + dps.Puri + '-supportAbility', new FormControl(null));
            }
          });
        });
        this.relatedDPSList.push(DBCRelatedDPSList);
      });
    });
  }

  private parseAssessmentResults(): void {
    this.DBCList.forEach((dbc: DigitalBusinessCapability, index: number) => {
      let assessment: Assessment = this.assessments.filter((element: Assessment) => element.Puri === dbc.Puri)[0];
      assessment.setExpectedPublicValue(this.supportAbilityForm.value[dbc.Puri + '-expectedPublicValue']);
      assessment.setEstimatedBudget(this.supportAbilityForm.value[dbc.Puri + '-estimatedBudget']);

      let supportAbilitySum: number = 0;
      let count: number = 0;
      console.log("DPS Keys: ", Object.keys(assessment.DigitalPublicService));
      Object.keys(assessment.DigitalPublicService).forEach((lKey: string) => {
        count = count + 1;
        supportAbilitySum = supportAbilitySum + assessment.DigitalPublicService[lKey].SupportAbility;
      });

      if (count != 0) {
        assessment.setSupportAbility(supportAbilitySum / count);
      } else {
        assessment.setSupportAbility(1);
      }

      let viewCount: number = 0;
      let targetAbilitySum: number = 0;
      Object.keys(assessment.View).forEach((lKey: string) => {
        count = count + 1;
        targetAbilitySum = targetAbilitySum + assessment.View[lKey].TargetAbility
      });

      if (viewCount != 0) {
        assessment.setTargetAbility(targetAbilitySum / viewCount);
      } else {
        assessment.setTargetAbility(1);
      }
    });
  }
}

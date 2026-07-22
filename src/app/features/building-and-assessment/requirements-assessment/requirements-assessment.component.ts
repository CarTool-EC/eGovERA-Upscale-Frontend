import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ArchitectureBuildingBlock } from '@shared/classes/ArchitectureBuildingBlock.class';
import { Assessment } from '@shared/classes/Assessment.class';
import { DigitalBusinessCapability } from '@shared/classes/DigitalBusinessCapability.class';
import { DigitalPublicService } from '@shared/classes/DigitalPublicService.class';
import { StorageService } from '@shared/services/storage.service';
import { EuiCardComponent } from '@eui/components/eui-card';
import { EuiDialogComponent } from '@eui/components/eui-dialog';

@Component({
  selector: 'app-requirements-assessment',
  templateUrl: './requirements-assessment.component.html',
  styleUrl: './requirements-assessment.component.scss',
  standalone: false,
})
export class RequirementsAssessmentComponent implements OnInit, AfterViewInit {
  @ViewChild('testingCard') testingCard: EuiCardComponent;
  @ViewChild('showInstructionsDialog') showInstructionsDialog: EuiDialogComponent;
  @ViewChild('nameFileDialog') nameFileDialog: EuiDialogComponent;
  @ViewChild('saveSurveyDialog') saveSurveyDialog: EuiDialogComponent;

  @Input() assessments: Assessment[];
  @Input() selectedDBCs: { businessAgnostic: DigitalBusinessCapability[], customs: DigitalBusinessCapability[], health: DigitalBusinessCapability[], taxes: DigitalBusinessCapability[] };
  @Input() selectedDomains: { id: string, value: string }[];

  @Output() finalizedAssessments: EventEmitter<Assessment[]> = new EventEmitter();  
  @Output() pauseAssessment: EventEmitter<void> = new EventEmitter();
  @Output() downloadAssessment: EventEmitter<{filename: string, assessments: Assessment[]}> = new EventEmitter();
  @Output() return: EventEmitter<Assessment[]> = new EventEmitter();

  public viewList: { id: string, value: string }[] = [
    { id: 'Legal', value: 'Legal' },
    { id: 'Organisational', value: 'Organisational' },
    { id: 'Semantic', value: 'Semantic' },
    { id: 'TechnicalApplication', value: 'Technical - Application' },
    { id: 'TechnicalInfrastructure', value: 'Technical - Infrastructure' },
    { id: 'Other', value: 'Other' }
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
  public DPSs: DigitalPublicService[];
  public DBCs: DigitalBusinessCapability[];

  public adHocDBCs: DigitalBusinessCapability[] = [];
  public adHocRequeriments: ArchitectureBuildingBlock[] = [];
  public adHocDPSs: DigitalPublicService[] = [];

  public DBCList: DigitalBusinessCapability[];
  public relatedABBList: ArchitectureBuildingBlock[];
  public ABBsByViews: {
    Legal: ArchitectureBuildingBlock[],
    Organisational: ArchitectureBuildingBlock[],
    Semantic: ArchitectureBuildingBlock[],
    TechnicalApplication: ArchitectureBuildingBlock[],
    TechnicalInfrastructure: ArchitectureBuildingBlock[],
    Other: ArchitectureBuildingBlock[]
  } = { Legal: [], Organisational: [], Semantic: [], TechnicalApplication: [], TechnicalInfrastructure: [], Other: [] };
  public relatedDPSList: any[];
  public ABBRelatedDPSList: DigitalPublicService[];
  public DBCRelatedDPSList: DigitalPublicService[];

  public currentDBC: DigitalBusinessCapability;
  public currentAssessment: Assessment;
  public currentDomain: { id: string, value: string };
  public selectedABB: ArchitectureBuildingBlock = null;
  public selectedView: string = null;

  public supportAbilityForm: FormGroup = null;

  private oldPolicies: Record<string, string> = {};

  private supportAbilityIndex: Record<string, Record<string, string[]>> = {};

  private adHocDBCsMap: Map<String, DigitalBusinessCapability[]> = new Map();

  public loading: boolean = true;
  public progress:number = 0;
  public processedDBCName: string = "";
  public filename: FormGroup;
  
  constructor(
    private storageService: StorageService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.filename = this.fb.group({
      filename: new FormControl({value: null, disabled: false}, [Validators.required])
    });
    this.selectedCurrentDBC();
    this.loadResources();
    this.selectRelatedDPSs();
  }

  ngAfterViewInit(): void {
    this.generateForm();
  }

  private async delay(ms: number) {
    await new Promise(f => setTimeout(f, 1000));
  }

  public domainsHasSelectedDbcs(domain: string) {
    return this.selectedDBCs[domain].length != 0;
  }

  public onNextDbcClick(dbc: DigitalBusinessCapability): void {
    // this.testingCard.euiCollapsed = true;
    this.selectedABB = null;
    this.selectedView = null;

    this.selectedCurrentDBC(dbc);
    this.selectRelatedDPSs();
    this.parseRelatedResources();
  }

  public calculateSupportAbility(dbc: DigitalBusinessCapability): number {
    let sum = 0;
    let count = 0;

    const ABBs: ArchitectureBuildingBlock[] = this.ABBsByViews[this.selectedView];
    ABBs?.forEach((ABB: ArchitectureBuildingBlock) => {
      this.DBCRelatedDPSList?.forEach((DPS: DigitalPublicService) => {
        const value = this.supportAbilityForm.value[this.currentDBC.Puri + "-" + ABB.Puri + "-" + DPS.Puri + "-supportAbility"];
        if (value != null && value !== -1) {
          sum += value;
          count++;
        }
      });
    });

    return count > 0 ? Math.round(sum / count) : 0;
  }

  public calculateTargetSupportAbility(dbc: DigitalBusinessCapability, viewId: string): number {
    let viewTargetSupportAbility: number = this.supportAbilityForm.value[dbc.Puri + '-' + viewId + '-targetSupportAbility'];

    if (viewTargetSupportAbility != null) {
      return Math.round(viewTargetSupportAbility);
    } else {
      return 0;
    }
  }

  public calculateGap(dbc: DigitalBusinessCapability, viewId: string): number {
    let supportAbility: number = this.calculateSupportAbility(dbc);
    let targetSupportAbility: number = this.calculateTargetSupportAbility(dbc, viewId);

    return Math.round(supportAbility - targetSupportAbility);
  }

  public calculateOverallSupportAbility(): number {
    let sum = 0;
    let count = 0;

    for (const key in this.currentAssessment.ArchitectureBuildingBlock) {
      const value = this.currentAssessment.ArchitectureBuildingBlock[key].SupportAbility;
      if (value != null && value !== -1) {
        sum += value;
        count++;
      }
    }

    return count > 0 ? Math.round(sum / count) : 0;
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
      return 0;
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
    return true;
  }

  public isAbbCardCollapsed(abb: ArchitectureBuildingBlock): boolean {
    return this.selectedABB === null || this.selectedABB.Puri != abb.Puri;
  }

  public onViewClick(view: string): void {
    if (this.isViewCardCollapsible(view)) {
      this.selectedView = view;
    }
  }

  public onViewCollapse(isViewCardCollapsed: boolean, view: string): void {
    if (!isViewCardCollapsed) {
      this.selectedView = view;
    }
  }

  private selectRelatedDPSs(): void {
    const sourceDPSs = this.isAdhoc(this.currentDBC) ? this.adHocDPSs : this.DPSs;
    this.DBCRelatedDPSList = sourceDPSs.filter((DPS: DigitalPublicService) => DPS.RelatedDBCs?.includes(this.currentDBC.Puri));
  }

  private uniqByPuri<T extends { Puri: string }>(arr: T[]): T[] {
    return [...new Map(arr.map(x => [x.Puri, x])).values()];
  }

  public onABBClick(pABB: ArchitectureBuildingBlock): void {
    this.selectedABB = pABB;

    const sourceDPSs = this.adHocRequeriments.includes(pABB) ? this.adHocDPSs : this.DPSs;

    const dpsCandidates = sourceDPSs.filter((dps) =>
      this.currentDBC.RelatedDPSs.includes(dps.Puri)
    );

    this.ABBRelatedDPSList = this.uniqByPuri(dpsCandidates);

    this.ABBRelatedDPSList.forEach(dps => {
      const key = `${this.currentDBC.Puri}-${pABB.Puri}-${dps.Puri}-supportAbility`;
      if (!this.supportAbilityForm.get(key)) {
        const assessmentDPS = this.currentAssessment.DigitalPublicService[key];
        const existing = assessmentDPS ? assessmentDPS.SupportAbility : null;
        this.supportAbilityForm.addControl(key, new FormControl(existing));
      }
    });
  }

  public onABBCollapse(isABBCardCollapsed: boolean, pABB: ArchitectureBuildingBlock): void {
    if (!isABBCardCollapsed) {
      this.selectedABB = pABB;

      const sourceDPSs = this.adHocRequeriments.includes(this.selectedABB) ? this.adHocDPSs : this.DPSs;

      const dpsCandidates = sourceDPSs.filter((dps) =>
        this.currentDBC.RelatedDPSs.includes(dps.Puri)
      );

      this.ABBRelatedDPSList = this.uniqByPuri(dpsCandidates);

      this.ABBRelatedDPSList.forEach(dps => {
        const key = `${this.currentDBC.Puri}-${pABB.Puri}-${dps.Puri}-supportAbility`;
        if (!this.supportAbilityForm.get(key)) {
          const assessmentDPS = this.currentAssessment.DigitalPublicService[key];
          const existing = assessmentDPS ? assessmentDPS.SupportAbility : null;
          this.supportAbilityForm.addControl(key, new FormControl(existing));
        }
      });
    }
  }

  public supportKey(dbc: DigitalBusinessCapability, abb: ArchitectureBuildingBlock, dps: DigitalPublicService): string {
    return `${dbc.Puri}-${abb.Puri}-${dps.Puri}-supportAbility`;
  }

  public onSupportAbilityClick(pDPS: DigitalPublicService) {
    const key = `${this.currentDBC.Puri}-${this.selectedABB.Puri}-${pDPS.Puri}-supportAbility`;
    let lDPSAssessment = { 
        Name: pDPS.Name, 
        SupportAbility: this.supportAbilityForm.value[key] 
    };
    this.currentAssessment.addDPSValue(key, lDPSAssessment);

    let lABBSupportAbility = { 
        Name: this.selectedABB.Name, 
        SupportAbility: this.calculateAverageABBSupportAbility() 
    };
    this.currentAssessment.addABBValue(this.selectedABB.Puri, lABBSupportAbility);

    let lViewAssessment = { 
        SupportAbility: this.calculateSupportAbility(this.currentDBC), 
        TargetSupportAbility: this.calculateTargetSupportAbility(this.currentDBC, this.selectedView) 
    };
    this.currentAssessment.addViewValue(this.selectedView, lViewAssessment);
  }

  public onTargetSupportAbilityClick(pViewId: string) {
    let lViewAssessment = { SupportAbility: this.calculateSupportAbility(this.currentDBC), TargetSupportAbility: this.calculateTargetSupportAbility(this.currentDBC, pViewId) };
    this.currentAssessment.addViewValue(pViewId, lViewAssessment);
  }

  private calculateAverageABBSupportAbility(): number {
    let sum = 0;
    let count = 0;

    if (!this.selectedABB) return 0;
    for (const dps of this.DBCRelatedDPSList) {
      const value = this.supportAbilityForm.value[this.currentDBC.Puri + "-" + this.selectedABB.Puri + "-" + dps.Puri + "-supportAbility"];
      if (value != null && value !== -1) {
        sum += value;
        count++;
      }
    }
    return count > 0 ? sum / count : 0;
  }

  private isAdhoc(dbc: DigitalBusinessCapability): boolean {
    if (!dbc) return undefined;
    const adhocDBCs = this.storageService.getAllAdHocDBCs();
    const values = Array.from(adhocDBCs.values()).flat();

    return values.some(adhocdbc => adhocdbc.Puri === dbc.Puri);
  }

  private findAdhocDBC(dbc: DigitalBusinessCapability): DigitalBusinessCapability | undefined {
    if (!dbc) return undefined;

    const adhocDBCs = this.storageService.getAllAdHocDBCs();
    const values = Array.from(adhocDBCs.values()).flat();

    return values.find(adhocdbc => adhocdbc.Puri === dbc.Puri);
  }


  private selectedCurrentDBC(dbc?: DigitalBusinessCapability): void {
    const adhocDBCs = this.storageService.getAllAdHocDBCs();
    const adhoc = Array.from(adhocDBCs.values()).flat();

    if (!dbc) {
      if (this.selectedDBCs.businessAgnostic.length > 0 && !this.isAdhoc(this.selectedDBCs.businessAgnostic[0])) {
        this.currentDBC = this.selectedDBCs.businessAgnostic[0];
      } else if (this.selectedDBCs.customs.length > 0 && !this.isAdhoc(this.selectedDBCs.customs[0])) {
        this.currentDBC = this.selectedDBCs.customs[0];
      } else if (this.selectedDBCs.health.length > 0 && !this.isAdhoc(this.selectedDBCs.health[0])) {
        this.currentDBC = this.selectedDBCs.health[0];
      } else if (this.selectedDBCs.taxes.length > 0 && !this.isAdhoc(this.selectedDBCs.taxes[0])) {
        this.currentDBC = this.selectedDBCs.taxes[0];
      } else if (adhoc.length > 0) {
        for (const domain of this.selectedDomains) {
          if (this.selectedDBCs[domain.id]?.length > 0) {
            const found = this.findAdhocDBC(this.selectedDBCs[domain.id][0]);
            if (found) {
              this.currentDBC = found;
              break;
            }
          }
        }
      } else {
        this.currentDBC = null;
      }
    } else {
      this.currentDBC = dbc;
    }

    if (this.currentDBC) {
      this.currentAssessment = this.assessments.find(
        (assessment: Assessment) => assessment.Puri === this.currentDBC.Puri
      );
      this.currentDomain = this.selectedDomains.find(
        (domain: { id: string; value: string }) => this.currentDBC.Policy === domain.value
      );
    }
  }

  private loadResources(): void {
    this.ABBs = this.storageService.getABBs();
    this.DPSs = this.storageService.getDPSs();
    this.DBCs = this.storageService.getDBCs();
    const requeriments = this.storageService.getAllAdHocRequirements();
    this.adHocDBCsMap = requeriments;
    this.adHocDBCsMap.keys()
    this.adHocRequeriments = Array.from(requeriments.values()).flat();
    const dpss = this.storageService.getAllAdHocDPSs()
    this.adHocDPSs = this.uniqByPuri(Array.from(dpss.values()).flat());
    this.parseRelatedResources();
  }

  public findAdHocDBCModelName(): string | undefined {
  const map = this.storageService.getAllAdHocDBCs();

  if (!this.currentDBC) return undefined;

  for (const [modelName, dbcs] of map.entries()) {
    if (dbcs.some(dbc => dbc.Puri === this.currentDBC.Puri)) {
      return modelName;
    }
  }

  return undefined;
}

  private parseRelatedResources(): void {
    if (this.currentDBC.Policy === "Ad-Hoc") {
      const dbcModelName = this.findAdHocDBCModelName();
      this.relatedABBList = this.storageService.getAdHocRequirements(dbcModelName);
    } else {
      this.relatedABBList = this.ABBs.filter(
        (abb: ArchitectureBuildingBlock) => abb.RelatedDBCs.includes(this.currentDBC.Puri) && abb.Policy == this.currentDomain.value
      );
    }

    this.viewList.forEach((view) => {
      this.ABBsByViews[view.id] = this.relatedABBList
        .filter((abb) => abb.View === view.value);
    });
  }

  public isAdhocDBCsFilled(): boolean {
    return Array.from(this.storageService.getAllAdHocDBCs().values())
      .some(list => list.length > 0);
  }

  public getAdHocDBCsKeys(): string[] {
    return Array.from(this.storageService.getAllAdHocDBCs().keys());
  }

  public keyHasSelectedDbcs(modelName: string): boolean {
    return this.getSelectedAdhocByModel(modelName).length > 0;
  }

  public getSelectedAdhocByModel(modelName: string): DigitalBusinessCapability[] {
    const adhocDbcs = this.storageService.getAdHocDBCs(modelName);
    if (!adhocDbcs || !this.DBCList) return [];

    return this.DBCList.filter(dbc =>
      adhocDbcs.some(adhoc => adhoc.Puri === dbc.Puri)
    );
  }


  public isFirstDBC(): boolean {
    let index: number = this.DBCList.indexOf(this.currentDBC);

    return index == 0;
  }

  public isLastDBC(): boolean {
    const dbc = this.DBCList.filter(lDbc => lDbc.Puri === this.currentDBC.Puri)[0];
    let index: number = this.DBCList.indexOf(dbc);

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
    this.nameFileDialog.openDialog();
  }

  public downloadSurvey(): void {
    let lDownloadAssessment: {filename: string, assessments: Assessment[]} = {filename: this.filename.value.filename, assessments: this.assessments };
    this.downloadAssessment.emit(lDownloadAssessment);
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

  public onShowInstructionsClick(): void {
    this.showInstructionsDialog.openDialog();
  }

  public onDialogCancel(): void {
    this.showInstructionsDialog.closeDialog();
  }

  public returnToCapabilityAssessment(): void {
    this.parseAssessmentResults();
    this.return.emit(this.assessments);
  }

  private async generateForm(): Promise<void> {
    this.loading = true;
    this.relatedDPSList = [];
    this.DBCList = [];
    this.supportAbilityForm = new FormGroup({});
    this.supportAbilityIndex = {};
    this.adHocDBCs = this.adHocDBCs ?? [];

    const normal: DigitalBusinessCapability[] = [];
    const adhoc: DigitalBusinessCapability[] = [];

    const exists = (puri: string) => this.DBCs?.some(d => d.Puri === puri) ?? false;

    let totalLength = this.selectedDBCs.businessAgnostic.length + this.selectedDBCs.customs.length + this.selectedDBCs.health.length + this.selectedDBCs.taxes.length;
    
    for (const domain of this.selectedDomains) {
      const list = this.selectedDBCs[domain.id] ?? [];
      const processed = new Set<string>();

      for (const dbc of list) {
        this.processedDBCName = dbc.Name;
        await this.delay(100);
        if (!exists(dbc.Puri)) {
          if (!adhoc.some(a => a.Puri === dbc.Puri)) adhoc.push(dbc);
          if (!this.adHocDBCs.some(a => a.Puri === dbc.Puri)) this.adHocDBCs.push(dbc);
          processed.add(dbc.Puri);
        } else {
          if (!normal.some(n => n.Puri === dbc.Puri)) normal.push(dbc);
        }

        this.generateFormByDbc(dbc);
        this.progress = this.progress + 100/totalLength;
      }

      this.selectedDBCs[domain.id] = (this.selectedDBCs[domain.id] ?? []).filter(
        d => !processed.has(d.Puri)
      );
    }

    adhoc.forEach((adhoc: DigitalBusinessCapability) => {
      this.oldPolicies[adhoc.Puri] = adhoc.Policy;
      adhoc.Policy = "Ad-Hoc"
    })

    this.DBCList = [...normal, ...adhoc];
    this.loading = false;
  }

  private generateFormByDbc(mDBC: DigitalBusinessCapability): void {
    let dbc: DigitalBusinessCapability = mDBC;
    if (this.isAdhoc(dbc)) {
      dbc = this.findAdhocDBC(dbc);
    }
    const dbcPuri = dbc.Puri;
    
    const assessment = this.assessments.find(a => a.Puri === dbcPuri);
    if (!assessment) return;
    
    const assessmentDPS = assessment.DigitalPublicService;

    if (assessment.ExpectedPublicValue > 0) {
      this.supportAbilityForm.addControl(
        dbcPuri + '-expectedPublicValue',
        new FormControl(assessment.ExpectedPublicValue)
      );
    } else {
      this.supportAbilityForm.addControl(dbcPuri + '-expectedPublicValue', new FormControl(null));
    }

    if (assessment.EstimatedBudget > 0) {
      this.supportAbilityForm.addControl(
        dbcPuri + '-estimatedBudget',
        new FormControl(assessment.EstimatedBudget)
      );
    } else {
      this.supportAbilityForm.addControl(dbcPuri + '-estimatedBudget', new FormControl(null));
    }

    this.viewList.forEach((view: { id: string; value: string }) => {
      if (
        assessment.View[view.id] !== undefined &&
        assessment.View[view.id].TargetSupportAbility > 0
      ) {
        this.supportAbilityForm.addControl(
          dbcPuri + '-' + view.id + '-targetSupportAbility',
          new FormControl(assessment.View[view.id].TargetSupportAbility)
        );
      } else {
        this.supportAbilityForm.addControl(
          dbcPuri + '-' + view.id + '-targetSupportAbility',
          new FormControl(null)
        );
      }
    });

    if (!this.supportAbilityIndex[dbcPuri]) {
      this.supportAbilityIndex[dbcPuri] = {};
    }

    let sourceABBs = dbc.Policy === 'Ad-Hoc' ? this.adHocRequeriments : this.ABBs;
    let sourceDPSs = dbc.Policy === 'Ad-Hoc' ? this.adHocDPSs : this.DPSs;

    const DBCRelatedDPSList: DigitalPublicService[] = [];

    for (let i = 0; i < sourceABBs.length; i++) {
      const abb = sourceABBs[i];
      const relatedDPSSet = new Set(dbc.RelatedDPSs);

      for (let j = 0; j < sourceDPSs.length; j++) {
        const dps = sourceDPSs[j];
        if (!relatedDPSSet.has(dps.Puri)) continue;

        DBCRelatedDPSList.push(dps);

        const key = `${dbcPuri}-${abb.Puri}-${dps.Puri}-supportAbility`;
        const dpsAssessment = assessmentDPS[key];

        if (!this.supportAbilityIndex[dbcPuri][dps.Puri]) {
          this.supportAbilityIndex[dbcPuri][dps.Puri] = [];
        }
        this.supportAbilityIndex[dbcPuri][dps.Puri].push(key);

        if (!this.supportAbilityForm.get(key)) {
          this.supportAbilityForm.addControl(
            key,
            new FormControl(
              dpsAssessment && dpsAssessment.SupportAbility !== undefined
                ? dpsAssessment.SupportAbility
                : null
            )
          );
        }
      }
    }
    const withoutDuplicatedDBCRelatedDPSList = [...new Map(DBCRelatedDPSList.map(dps => [dps.Puri, dps])).values()];
    this.relatedDPSList.push(withoutDuplicatedDBCRelatedDPSList);
  }

  private parseAssessmentResults(): void {
    this.DBCList.forEach((dbc: DigitalBusinessCapability) => {
      if (dbc.Policy === "Ad-Hoc" && this.oldPolicies[dbc.Puri]) {
        const originalDomain = this.oldPolicies[dbc.Puri];

        let normalizedDomain: string = "";

        if (originalDomain == "Business Agnostic") 
          normalizedDomain = 'businessAgnostic';
        else
          normalizedDomain = originalDomain.charAt(0).toLowerCase() + originalDomain.slice(1);

        if (!this.selectedDBCs[normalizedDomain]) {
          this.selectedDBCs[normalizedDomain] = [];
        }

        if (!this.selectedDBCs[normalizedDomain].some(d => d.Puri === dbc.Puri)) {
          this.selectedDBCs[normalizedDomain].push(dbc);
        }

        dbc.Policy = originalDomain;
      }

      const assessment = this.assessments.find(a => a.Puri === dbc.Puri);
      if (!assessment) return;

      assessment.setExpectedPublicValue(this.supportAbilityForm.value[`${dbc.Puri}-expectedPublicValue`]);
      assessment.setEstimatedBudget(this.supportAbilityForm.value[`${dbc.Puri}-estimatedBudget`]);

      let supportAbilitySum = 0;
      let count = 0;

      for (let key in assessment.DigitalPublicService) {
        const value = assessment.DigitalPublicService[key].SupportAbility;
        if (value != null && value !== -1) {
          supportAbilitySum += value;
          count++
        }
      }

      assessment.setSupportAbility(count > 0 ? supportAbilitySum / count : 0);

      let viewCount = 0;
      let targetAbilitySum = 0;

      this.viewList.forEach(view => {
        const value = this.supportAbilityForm.value[`${dbc.Puri}-${view.id}-targetSupportAbility`];
        if (value != null && value > 0) {
          assessment.addViewValue(view.id, {
            SupportAbility: this.calculateSupportAbility(dbc),
            TargetSupportAbility: value
          });
          targetAbilitySum += value;
          viewCount++;
        }
      });

      assessment.setTargetAbility(viewCount > 0 ? targetAbilitySum / viewCount : 0);
    });

    this.adHocDBCs = [];
  }

}

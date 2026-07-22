import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DigitalBusinessCapability } from '@shared/classes/DigitalBusinessCapability.class';
import { Assessment } from '@shared/classes/Assessment.class';
import { StorageService } from '@shared/services/storage.service';
import { EuiDialogComponent, EuiDialogConfig, EuiDialogModule, EuiDialogService } from "@eui/components/eui-dialog";
import { ResourcesService } from '@shared/services/resources.service';
import { EuiGrowlService } from '@eui/core';
import { ModelDigitalBusinessCapability } from '@shared/classes/ModelDigitalBusinessCapability.class';
import { ArchitectureBuildingBlock } from '@shared/classes/ArchitectureBuildingBlock.class';
import { DigitalPublicService } from '@shared/classes/DigitalPublicService.class';

@Component({
  selector: 'app-initialization-form',
  templateUrl: './initialization-form.component.html',
  styleUrl: './initialization-form.component.scss',
  standalone: false
})
export class InitializationFormComponent implements OnInit {
  @Output() startAssessment: EventEmitter<{ contactInfo: any, domainList: { id: string, value: string }[] }> = new EventEmitter();
  @Output() loadedSurvey: EventEmitter<{ selectedDBCs: { businessAgnostic: DigitalBusinessCapability[], customs: DigitalBusinessCapability[], health: DigitalBusinessCapability[], taxes: DigitalBusinessCapability[] }, assessments: Assessment[], selectedDomains: { id: string, value: string }[], contactInfo: any, modelDBCs: {businessAgnostic: ModelDigitalBusinessCapability[], customs: ModelDigitalBusinessCapability[], health: ModelDigitalBusinessCapability[], taxes: ModelDigitalBusinessCapability[]} }> = new EventEmitter();
  @Output() sendModelDBCs: EventEmitter<{businessAgnostic: ModelDigitalBusinessCapability[], customs: ModelDigitalBusinessCapability[], health: ModelDigitalBusinessCapability[], taxes: ModelDigitalBusinessCapability[]}> = new EventEmitter();
  @ViewChild('loadingDialog') loadingDialog: EuiDialogComponent;
  
  public modelDBCs: {businessAgnostic: ModelDigitalBusinessCapability[], customs: ModelDigitalBusinessCapability[], health: ModelDigitalBusinessCapability[], taxes: ModelDigitalBusinessCapability[]} = {businessAgnostic: [], customs: [], health: [], taxes: []};
  public completeDomainList: { id: string, value: string }[] = [
    { id: 'businessAgnostic', value: 'Business Agnostic' },
    { id: 'customs', value: 'Customs' },
    { id: 'health', value: 'Health' },
    { id: 'taxes', value: 'Taxes' },
  ];
  public modelDomainCounter: {customs: number, health: number, taxes: number} = {customs: 0, health: 0, taxes: 0}
  public contactInformationForm: FormGroup;
  public businessDomainForm: FormGroup;
  public modelsArray: File[] = [];
  public loading: boolean = true;

  public isUploadingModel: boolean = false;
  public isDeletingModel: boolean = false;
  public isUploadModelAvailable: boolean = false;

  public lDBCByDomain = {businessAgnostic: [], customs: [], health: [], taxes: []};

  constructor(
    private fb: FormBuilder,
    private storageService: StorageService,
    private resourcesService: ResourcesService,
    private growlService: EuiGrowlService
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
      taxes: new FormControl({ value: false, disabled: false }),
    });
    this.handleDomainChanges();
    this.businessDomainForm.valueChanges.subscribe(() => {
      this.syncDomainState();
    });
    
    this.storageService.getReady().subscribe(ready => {
      if (ready) {
        this.loading = false;
        this.lDBCByDomain = this.storageService.getFilteredDBCs();
      }
    });
  }

  public removeModelFromList(file: File): void {
    this.isDeletingModel = true;
    this.resourcesService.postModel(file).subscribe((data) => {
      const dbcsToRemove = data.DBCs;

      const removedCount = this.removeDbcsFromModel(dbcsToRemove);
      this.removeFileFromModelArray(file);
      this.syncDomainState();
      this.updateBusinessDomainFormState();

      if (this.modelsArray.length === 0) {
        this.resetModelDBCs();
        this.storageService.clearAdHocDBCs();
        this.storageService.clearAdHocDPSs();
        this.storageService.clearAdHocRequirements();
      }
      this.isDeletingModel = false;
    });
  }


  public onClose(): void {
    this.isUploadingModel = false;
    this.loadingDialog.closeDialog();
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

  showGrowl(type: string, title: string, inputMessage?: string) {
      if (!type) {
          type = 'info';
      }
      this.growlService.growl({
          severity: type,
          summary: title || "title",
          detail: inputMessage || 'details' },
      );
    }

  public onModelUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (!file) {
      console.error("No file selected.");
      return;
    }

    this.isUploadingModel = true;
    this.loadModelFile(file);
  }

  public checkAlreadyUploaded(file: File): boolean {
    return this.modelsArray.some(
      f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
    );
  }

  public checkCorrectFileFormat(file: File): boolean {
    const allowedExtensions = ['.archimate', '.xml'];
    const fileName = file.name.toLowerCase();
    return allowedExtensions.some(ext => fileName.endsWith(ext));
  }

  private loadModelFile(file: File): void {
    this.loadingDialog.openDialog();

    if (this.checkAlreadyUploaded(file)) {
      console.error("This file has already been uploaded.");
      this.showGrowl("danger", "Error uploading", "This file has already been uploaded.")
      this.finishUpload();
      return;
    }

    if (!this.checkCorrectFileFormat(file)) {
      console.error("Invalid file format. Only .archimate and .xml are allowed.");
      this.showGrowl("danger", "Invalid file format", "Only .archimate and .xml are allowed.")
      this.finishUpload();
      return;
    }

    this.resourcesService.postModel(file).subscribe((data) => {
      if (!data.isVersionValid) {
        this.showGrowl("danger", "Invalid model version", "The version of the model must be the same as eGovERA.")
        this.finishUpload();
        return;
      }
      this.modelsArray.push(file);
      const domain = this.filterModelPolicy(data)

      const domainKey: string = this.getModelDomain(domain);

      const lABBs: ArchitectureBuildingBlock[] = [];
      const lBaseABBs: ArchitectureBuildingBlock[] = this.storageService.getABBs();
      data.ABBs.forEach(lABB => lABBs.push(ArchitectureBuildingBlock.fromJson(lABB)));
      const filteredAbbs: ArchitectureBuildingBlock[] = lABBs.filter(
        abb => !lBaseABBs.some(baseAbb => baseAbb.Puri === abb.Puri)
      );
      this.storageService.addAdHocRequirements(data.Name, filteredAbbs)
      const lDPSs: DigitalPublicService[] = [];
      data.DPSs.forEach(lDPS => lDPSs.push(DigitalPublicService.fromJson(lDPS)));
      this.storageService.addAdHocDPSs(data.Name, lDPSs);

      let DataDBCs: DigitalBusinessCapability[] = []
      data.DBCs.forEach((dbc: any) => DataDBCs.push(DigitalBusinessCapability.fromJson(dbc)));
      this.pushDBCsToDomain(data.Name, DataDBCs, domainKey);
      this.syncDomainState();
      this.finishUpload();
    })
  }

  private replacePolicy(policy: string, data) {
    data.DPSs.forEach(dps => dps.Policy = policy);
    data.ABBs.forEach(abb => abb.Policy = policy);
    data.DBCs.forEach(dbc => dbc.Policy = policy);
  }

  private filterModelPolicy(data) {
    const sources = [
      { items: this.storageService.getABBs(), models: data.ABBs },
      { items: this.storageService.getDBCs(), models: data.DBCs },
      { items: this.storageService.getDPSs(), models: data.DPSs },
    ];

    for (const { items, models } of sources) {
      for (const modelItem of models) {
        const match = items.find(
          (item) => item.Puri === modelItem.Puri && item.Policy !== "Business Agnostic"
        );

        if (match) {
          this.replacePolicy(match.Policy, data);
          return match.Policy;
        }
      }
    }
    this.replacePolicy('Business Agnostic', data);
    return 'Business Agnostic'
  }

  private pushDBCsToDomain(modelName: string, DBCs: DigitalBusinessCapability[], domainKey: string): void {
    const lBaseDBCs: DigitalBusinessCapability[] = this.storageService.getDBCs();
    const lValidDBCs: DigitalBusinessCapability[] = [];
    DBCs.forEach((lDBC: DigitalBusinessCapability) => {
      if (lBaseDBCs.filter((mDBC: DigitalBusinessCapability) => mDBC.Puri == lDBC.Puri).length == 0 && lDBC.Name != "Digital Business Capability") {
        lValidDBCs.push(lDBC);
      }
    });
    const model = new ModelDigitalBusinessCapability(modelName, lValidDBCs);
    this.modelDBCs[domainKey].push(model);
    this.storageService.addAdHocDBCs(modelName, lValidDBCs)
    this.sendModelDBCs.emit(this.modelDBCs);
  }

  private getModelDomain(domain: string): string {
    const match = this.completeDomainList.find(item => item.value === domain);
    if (!match) {
      console.warn(`Domain "${domain}" not found in completeDomainList.`);
      return;
    }

    const domainKey = match.id;
    this.modelDomainCounter[domainKey] += 1;

    if (this.businessDomainForm.contains(domainKey)) {
      this.businessDomainForm.get(domainKey)?.setValue(true);
      this.businessDomainForm.get(domainKey)?.disable();
    }
    return domainKey;
  }

  private finishUpload(): void {
    this.isUploadingModel = false;
    this.loadingDialog.closeDialog();
  }

  private loadFile(file: File): void {
    const fileReader = new FileReader();

    fileReader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== 'string') return;

      const parsed = JSON.parse(result);

      const loadedData = {
        data: parsed.data,
        contactInfo: parsed.contactInfo,
        selectedDomainList: parsed.selectedDomainList,
        modelDBCs: parsed.modelDBCs,
        modelABBsMap: new Map<string, ArchitectureBuildingBlock[]>(Object.entries(parsed.modelABBsMap)),
        modelDPSsMap: new Map<string, DigitalPublicService[]>(Object.entries(parsed.modelDPSsMap))
      };

      this.storageService.setAdHocRequirementsMap(loadedData.modelABBsMap)
      this.storageService.setAdHocDPSsMap(loadedData.modelDPSsMap)

      const surveyAssessments: Assessment[] = loadedData.data.map(data =>
        Assessment.parseAssessmentSurvey(data)
      );

      const DBCs = this.storageService.getFilteredDBCs();

      const surveyDBCs = {
        businessAgnostic: [] as DigitalBusinessCapability[],
        customs: [] as DigitalBusinessCapability[],
        health: [] as DigitalBusinessCapability[],
        taxes: [] as DigitalBusinessCapability[]
      };

      const surveyDomains: { id: string, value: string }[] = [];

      surveyAssessments.forEach((assessment: Assessment) => {
        const assessedDomain = this.completeDomainList.find(
          element => element.value === assessment.Policy
        );
        if (!assessedDomain) return;

        const domainId = assessedDomain.id;

        const normalDBC = DBCs[domainId].find(
          (dbc: DigitalBusinessCapability) => dbc.Puri === assessment.Puri
        );

        if (normalDBC) {
          surveyDBCs[domainId].push(normalDBC);
        } else {
          const models = loadedData.modelDBCs[domainId] || [];
          for (const model of models) {
            const modelDBC = model.DBCs.find(dbc => dbc.Puri === assessment.Puri);
            if (modelDBC) {
              surveyDBCs[domainId].push(modelDBC);
              break;
            }
          }
        }

        if (!surveyDomains.some(domain => domain.id === domainId)) {
          surveyDomains.push(assessedDomain);
        }

        const models = loadedData.modelDBCs[domainId] || [];

        for (const model of models) {
          this.storageService.addAdHocDBCs(model.modelName, model.DBCs)
        }
        
      });

      const selectedDomains = loadedData.selectedDomainList?.length
        ? loadedData.selectedDomainList
        : surveyDomains;

      const uploadedSurvey = {
        selectedDBCs: surveyDBCs,
        assessments: surveyAssessments,
        selectedDomains: selectedDomains,
        contactInfo: loadedData.contactInfo,
        modelDBCs: loadedData.modelDBCs,
      };

      this.loadedSurvey.emit(uploadedSurvey);
    };

    fileReader.readAsText(file);
  }

  public isFormValid(): boolean {
    return this.contactInformationForm.valid;
  }

  private removeDbcsFromModel(dbcsToRemove: DigitalBusinessCapability[]): number {
    const maxToRemove = dbcsToRemove.length;
    let removedCount = 0;

    for (const category of Object.keys(this.modelDBCs)) {
      const models = this.modelDBCs[category];

      this.modelDBCs[category] = models.map(model => {
        const filteredDBCs: DigitalBusinessCapability[] = [];

        for (const dbc of model.DBCs) {
          const shouldRemove = dbcsToRemove.some(toRemove => toRemove.Puri === dbc.Puri);
          if (shouldRemove && removedCount < maxToRemove) {
            removedCount++;
            continue;
          }
          filteredDBCs.push(dbc);
        }

        return new ModelDigitalBusinessCapability(model.modelName, filteredDBCs);
      });
    }

    return removedCount;
  }


  private removeFileFromModelArray(file: File): void {
    const index = this.modelsArray.indexOf(file);
    if (index !== -1) {
      this.modelsArray.splice(index, 1);
    }
  }

  private handleDomainChanges(): void {
    this.businessDomainForm.valueChanges.subscribe(() => {
      this.updateBusinessDomainFormState();
    });
  }

  private syncDomainState(): void {
    const businessAgnostic = this.businessDomainForm.get("businessAgnostic");
    if (businessAgnostic) {
      businessAgnostic.setValue(true, { emitEvent: false });
      businessAgnostic.disable({ emitEvent: false });
    }

    const allDomains = Object.keys(this.businessDomainForm.controls);

    const domainsWithModels = allDomains.filter(
      domainKey => domainKey !== 'businessAgnostic' && this.modelDBCs[domainKey]?.length > 0
    );

    if (domainsWithModels.length > 0) {
      allDomains.forEach(domainKey => {
        const control = this.businessDomainForm.get(domainKey);
        if (!control || domainKey === 'businessAgnostic') return;

        if (domainsWithModels.includes(domainKey)) {
          control.setValue(true, { emitEvent: false });
        } else {
          control.setValue(false, { emitEvent: false });
        }
        control.disable({ emitEvent: false });
      });
    } else {
      this.updateBusinessDomainFormState();
    }
  }


  private updateBusinessDomainFormState(): void {
    const businessAgnosticControl = this.businessDomainForm.get("businessAgnostic");
    if (businessAgnosticControl) {
      businessAgnosticControl.setValue(true, { emitEvent: false });
      businessAgnosticControl.disable({ emitEvent: false });
    }

    const domains = Object.keys(this.businessDomainForm.controls).filter(
      d => d !== "businessAgnostic"
    );

    const selectedDomain = domains.find(
      d => this.businessDomainForm.get(d)?.value === true
    );

    domains.forEach(domain => {
      const control = this.businessDomainForm.get(domain);
      if (!control) return;

      if (selectedDomain) {
        if (domain === selectedDomain) {
          control.enable({ emitEvent: false });
        } else {
          control.setValue(false, { emitEvent: false });
          control.disable({ emitEvent: false });
        }
      } else {
        control.enable({ emitEvent: false });
      }
    });
  }

  private resetModelDBCs(): void {
    this.modelDBCs = {
      businessAgnostic: [],
      customs: [],
      health: [],
      taxes: []
    };
  }
}

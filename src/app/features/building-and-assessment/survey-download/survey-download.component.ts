import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ArchitectureBuildingBlock } from '@shared/classes/ArchitectureBuildingBlock.class';
import { Assessment } from '@shared/classes/Assessment.class';
import { ModelDigitalBusinessCapability } from '@shared/classes/ModelDigitalBusinessCapability.class';
import { StorageService } from '@shared/services/storage.service';

@Component({
  selector: 'app-survey-download',
  templateUrl: './survey-download.component.html',
  styleUrl: './survey-download.component.scss',
  standalone: false
})
export class SurveyDownloadComponent implements OnInit {
  @Input() assessments: Assessment[];
  @Input() contactInfo: any;
  @Input() modelDBCs: {businessAgnostic: ModelDigitalBusinessCapability[], customs: ModelDigitalBusinessCapability[], health: ModelDigitalBusinessCapability[], taxes: ModelDigitalBusinessCapability[]};
  @Input() selectedDomains: {id: string, value: string}[];

  public filename: FormGroup;
  public defaultFilename: string = "survey_result.json";

  constructor(
    private storageService: StorageService,
    private fb: FormBuilder
  ) {
    
  }

  ngOnInit(): void {
    this.filename = this.fb.group({
      filename: new FormControl({value: null, disabled: false}, [Validators.required])
    });
  }

  public downloadAssessmentJson(): void {
    const modelABBsMap = Object.fromEntries(this.storageService.getAllAdHocRequirements());
    const modelDPSsMap = Object.fromEntries(this.storageService.getAllAdHocDPSs());
    let link = document.createElement("a")
    let downloadContent = {data: this.assessments, contactInfo: this.contactInfo, selectedDomainList: this.selectedDomains, modelDBCs: this.modelDBCs, modelABBsMap: modelABBsMap, modelDPSsMap: modelDPSsMap};
    link.href = URL.createObjectURL(new Blob([JSON.stringify(downloadContent, null, 2)], {
      type: "application/json"
    }));

    let lFilename: string = this.filename.value.filename != null ? this.filename.value.filename : this.defaultFilename;
    link.setAttribute("download", lFilename);
    link.click();
    link.remove();
  }
}

import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { Assessment } from '@shared/classes/Assessment.class';

@Component({
  selector: 'app-survey-download',
  templateUrl: './survey-download.component.html',
  styleUrl: './survey-download.component.scss'
})
export class SurveyDownloadComponent implements OnInit, AfterViewInit {
  @Input() assessments: Assessment[];
  @Input() contactInfo: any;

  ngOnInit(): void {
    console.log(this.assessments);
  }

  ngAfterViewInit(): void {
    this.downloadAssessmentJson();
  }

  public downloadAssessmentJson(): void {
    let link = document.createElement("a")
    let downloadContent = {data: this.assessments, contactInfo: this.contactInfo};
    link.href = URL.createObjectURL(new Blob([JSON.stringify(downloadContent, null, 2)], {
      type: "application/json"
    }));

    link.setAttribute("download", "survey_result.json");
    link.click();
  }
}

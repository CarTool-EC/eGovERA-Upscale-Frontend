import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { StorageService } from '@shared/services/storage.service';
import { Assessment } from '@shared/classes/Assessment.class';
import { ArchitectureBuildingBlock } from '@shared/classes/ArchitectureBuildingBlock.class';
import { DigitalPublicService } from '@shared/classes/DigitalPublicService.class';
import { DigitalBusinessCapability } from '@shared/classes/DigitalBusinessCapability.class';

@Component({
  selector: 'app-portfolio-management',
  templateUrl: './portfolio-management.component.html',
  styleUrl: './portfolio-management.component.scss'
})
export class PortfolioManagementComponent implements OnInit, OnChanges {
  @Input() survey: Assessment[];
  @Input() contactInfo: any;
  @Input() requestPDFData: any;
  @Output('selectedDBC') selectedDBC: EventEmitter<any> = new EventEmitter()
  @Output('pdfData') pdfData: EventEmitter<any> = new EventEmitter();

  public ABBs: ArchitectureBuildingBlock[] = [];
  public DPSs: DigitalPublicService[] = [];
  public DBCs: DigitalBusinessCapability[] = [];

  public completeDomainList: { id: string, value: string }[] = [
    { id: 'businessAgnostic', value: 'Business Agnostic' },
    { id: 'customs', value: 'Customs' },
    { id: 'health', value: 'Health' },
    { id: 'taxes', value: 'Taxes' }
  ];
  public selectableValues = [1, 2, 3, 4, 5];
  public displayedColumns: string[] = ['name', 'domain', 'strategicFit', 'supportAbility', 'targetAbility', 'expectedPublicValue', 'estimatedBudget'];
  public dataSource: Assessment[] = [];
  public filteredData: Assessment[] = [];
  public maxBudget: number = 0;
  public totalBudget: number = 0;

  public backgroundColors: any = {};
  public borderColors: any = {};

  public isLoading: boolean = true;
  public selectedBubble: any = null;

  public decisionSupportForm: FormGroup;
  public filterForm: FormGroup;

  public domainOptions: string[] = [];
  public xAxisOptions: { id: string, value: string }[] = [{ id: "StrategicFit", value: "Strategic fit" }, { id: "ExpectedPublicValue", value: "Expected public value" }];

  public bubbleChartData = null;
  public radarChartData = null;

  public bubbleChartOptions = null;
  public radarChartOptions = null;

  public idBCdom = 1;
  public idLdom = 2;
  public idOdom = 3;
  public idSdom = 4;
  public idTAdom = 5;
  public idTIdom = 6;
  public idLinf = 7;
  public idOinf = 8;
  public idSinf = 9;
  public idTAinf = 10;
  public idTIinf = 11;

  public PDFName: string = "decision-support.pdf";

  constructor(
    private fb: FormBuilder,
    private storageService: StorageService
  ) { }

  public ngOnInit(): void {
    this.loadResources();
    this.extractActiveDomains();

    this.decisionSupportForm = new FormGroup({});

    this.survey.forEach((lSurvey: Assessment) => {
      this.decisionSupportForm.addControl(lSurvey.Puri + "-StrategicFit", new FormControl(lSurvey.StrategicFit));
      this.decisionSupportForm.addControl(lSurvey.Puri + "-SupportAbility", new FormControl(lSurvey.SupportAbility));
      this.decisionSupportForm.addControl(lSurvey.Puri + "-TargetAbility", new FormControl(lSurvey.TargetAbility));
      this.decisionSupportForm.addControl(lSurvey.Puri + "-ExpectedPublicValue", new FormControl(lSurvey.ExpectedPublicValue));
      this.decisionSupportForm.addControl(lSurvey.Puri + "-EstimatedBudget", new FormControl(lSurvey.EstimatedBudget));
    });

    this.maxBudget = this.survey.reduce(function (prev, current) {
      return (prev && prev.EstimatedBudget > current.EstimatedBudget) ? prev : current;
    }).EstimatedBudget;
    this.survey.map((lAssessment: Assessment) => { this.totalBudget = this.totalBudget + lAssessment.EstimatedBudget });

    this.filterForm = this.fb.group({
      StrategicFitStart: new FormControl(1),
      StrategicFitEnd: new FormControl(5),
      ExpectedPublicValueStart: new FormControl(1),
      ExpectedPublicValueEnd: new FormControl(5),
      SupportAbilityStart: new FormControl(1),
      SupportAbilityEnd: new FormControl(5),
      EstimatedBudgetStart: new FormControl(1),
      EstimatedBudgetEnd: new FormControl(this.maxBudget),
      domainFilter: new FormControl(null),
      xAxisFilter: new FormControl(null)
    });

    this.dataSource = [...this.survey]
    this.filteredData = [...this.dataSource];
    this.generateChartColors();
    this.isLoading = false;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.requestPDFData != undefined && changes.requestPDFData.currentValue) {
      this.exportPDF();
    }
  }

  private generateCharts(input: Assessment[]) {
    this.generateBubbleChartData(input);
    this.generateRadarChartData(input);
  }

  private applyFilters() {
    this.filteredData = this.dataSource.filter((entry: Assessment) => {
      return entry.StrategicFit >= this.filterForm.value['StrategicFitStart'] &&
        entry.StrategicFit <= this.filterForm.value['StrategicFitEnd'] &&
        entry.ExpectedPublicValue >= this.filterForm.value['ExpectedPublicValueStart'] &&
        entry.ExpectedPublicValue <= this.filterForm.value['ExpectedPublicValueEnd'] &&
        entry.SupportAbility >= this.filterForm.value['SupportAbilityStart'] &&
        entry.SupportAbility <= this.filterForm.value['SupportAbilityEnd'] &&
        entry.EstimatedBudget >= this.filterForm.value['EstimatedBudgetStart'] &&
        entry.EstimatedBudget <= this.filterForm.value['EstimatedBudgetEnd'];
    });

    if (this.filterForm.value.domainFilter != null) {
      this.filteredData = this.filteredData.filter((entry: Assessment) => entry.Policy === this.filterForm.value.domainFilter);
    }
  }

  public editTable(lElementPuri: string, lModifiedField: string) {
    this.dataSource.map((lAssessment: Assessment) => {
      if (lAssessment.Puri === lElementPuri) {
        lAssessment[lModifiedField] = this.decisionSupportForm.value[lElementPuri + "-" + lModifiedField];
      };
    });

    if (lModifiedField === 'EstimatedBudget') {
      this.totalBudget = 0;
      this.dataSource.map((lAssessment: Assessment) => {
        this.totalBudget = this.totalBudget + lAssessment.EstimatedBudget;
      });

      let currentMax = this.maxBudget;
      let newMax = this.dataSource.reduce(function (prev, current) {
        return (prev && prev.EstimatedBudget > current.EstimatedBudget) ? prev : current;
      }).EstimatedBudget;

      if (newMax != currentMax) {
        this.maxBudget = newMax;
        this.filterForm.value['EstimatedBudgetEnd'] = newMax;
      }
    }

    this.applyFilters();
    this.generateCharts(this.filteredData);
  }

  onDomainFilterChange() {
    this.applyFilters();
    this.generateCharts(this.filteredData);
  }

  onxAxisFilterChange() {
    this.generateCharts(this.filteredData);
  }

  onSliderFilterChange() {
    this.filteredData = this.dataSource.filter((entry: Assessment) => {
      return entry.StrategicFit >= this.filterForm.value['StrategicFitStart'] &&
        entry.StrategicFit <= this.filterForm.value['StrategicFitEnd'] &&
        entry.ExpectedPublicValue >= this.filterForm.value['ExpectedPublicValueStart'] &&
        entry.ExpectedPublicValue <= this.filterForm.value['ExpectedPublicValueEnd'] &&
        entry.SupportAbility >= this.filterForm.value['SupportAbilityStart'] &&
        entry.SupportAbility <= this.filterForm.value['SupportAbilityEnd'] &&
        entry.EstimatedBudget >= this.filterForm.value['EstimatedBudgetStart'] &&
        entry.EstimatedBudget <= this.filterForm.value['EstimatedBudgetEnd'];
    });

    if (this.filterForm.value.domainFilter != null) {
      this.filteredData = this.filteredData.filter((entry: any) => entry.value.Policy === this.filterForm.value.domainFilter);
    }

    this.generateBubbleChartData(this.filteredData);
    this.generateRadarChartData(this.filteredData);
  }

  public onBubbleClick(e) {
    if (e.active.length > 0) {
      const clickedBubble = e.event.chart.data.datasets[e.active[0].datasetIndex];
      this.selectedBubble = this.survey.filter((element: Assessment) => element.Puri === clickedBubble.ID)[0];

      this.selectedBubble.RelatedDPSs = [];
      this.DBCs.filter((dbc: DigitalBusinessCapability) => dbc.Puri === this.selectedBubble.Puri).forEach((dbc: DigitalBusinessCapability) => {
        dbc.RelatedDPSs.forEach((dpsPuri: string) => {
          let relatedDPSs: DigitalPublicService = this.DPSs.filter((dps: DigitalPublicService) => dps.Puri === dpsPuri)[0];

          this.selectedBubble.RelatedDPSs.push(relatedDPSs);
        });
      });

      let relatedABBs = this.ABBs.filter((abb: ArchitectureBuildingBlock) => abb.RelatedDBCs.includes(this.selectedBubble.Puri));
      this.selectedBubble.Views = [];
      let view = this.createView('Legal', this.idLdom, this.selectedBubble.Policy, this.selectedBubble.SupportAbility, []);
      view.Abbs = relatedABBs.filter((abb: ArchitectureBuildingBlock) => abb.View == view.Name);
      this.selectedBubble.Views.push(view);

      view = this.createView('Organisational', this.idOdom, this.selectedBubble.Policy, this.selectedBubble.SupportAbility, []);
      view.Abbs = relatedABBs.filter((abb: ArchitectureBuildingBlock) => abb.View == view.Name);
      this.selectedBubble.Views.push(view);

      view = this.createView('Semantic', this.idSdom, this.selectedBubble.Policy, this.selectedBubble.SupportAbility, []);
      view.Abbs = relatedABBs.filter((abb: ArchitectureBuildingBlock) => abb.View == view.Name);
      this.selectedBubble.Views.push(view);

      view = this.createView('Technical Application', this.idTAdom, this.selectedBubble.Policy, this.selectedBubble.SupportAbility, []);
      view.Abbs = relatedABBs.filter((abb: ArchitectureBuildingBlock) => abb.View == view.Name);
      this.selectedBubble.Views.push(view);

      view = this.createView('Technical Infrastructure', this.idTIdom, this.selectedBubble.Policy, this.selectedBubble.SupportAbility, []);
      view.Abbs = relatedABBs.filter((abb: ArchitectureBuildingBlock) => abb.View == view.Name);
      this.selectedBubble.Views.push(view);

      this.selectedDBC.emit(this.selectedBubble);
    }
  }

  private loadResources() {
    this.ABBs = this.storageService.getABBs();
    this.DPSs = this.storageService.getDPSs();
    this.DBCs = this.storageService.getDBCs();
    if (this.ABBs.length > 0 && this.DPSs.length > 0 && this.DBCs.length > 0) {
      console.log('Loaded');
    } else {
      this.loadResources();
    }
  }

  private extractActiveDomains() {
    this.survey.forEach((lAssessment: Assessment) => {
      if (!this.domainOptions.includes(lAssessment.Policy)) {
        this.domainOptions.push(lAssessment.Policy);
      }
    });
  }

  private generateBubbleChartData(values: Assessment[]) {
    let xAxis = this.filterForm.value.xAxisFilter != null ? this.filterForm.value.xAxisFilter : "StrategicFit";
    let xAxisText;
    if (this.filterForm.value.xAxisFilter === null || this.filterForm.value.xAxisFilter === "StrategicFit") {
      xAxisText = "Strategic Fit";
    } else {
      xAxisText = "Expected Public Value"
    }
    let data = values.map((entry: Assessment) => {
      return {
        ID: entry.Puri,
        label: entry.Name,
        borderColor: this.borderColors[entry.Puri],
        backgroundColor: this.backgroundColors[entry.Puri],
        data: [{
          x: entry[xAxis] || 0,
          y: entry.SupportAbility.toFixed(2) || 0,
          budget: entry.EstimatedBudget || 0
        }],
        hoverRadius: 8.0,
        radius: context => {
          return context.dataset.data[context.dataIndex].budget + 6.0
        }
      }
    });

    this.bubbleChartData = {
      datasets: data
    };

    this.bubbleChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 1,
      layout: {
        padding: {
          top: 5,
          right: 35
        }
      },
      scales: {
        x: {
          grid: {
            color: function (context) {
              if (context.tick.value == 2.5) {
                return "#000000";
              } else {
                return "#FFFFFF";
              }
            },
            lineWidth: function (context) {
              if (context.tick.value != 2.5) {
                return 0
              } else {
                return 1;
              }
            }
          },
          min: 0,
          max: 5,
          ticks: {
            callback: function (value, index, values) {
              if (value == 0) {
                return 'Low';
              } else if (value == 2.5) {
                return 'Medium';
              } else if (value == 5) {
                return 'High';
              }
              return '';
            }
          },
          title: {
            display: true,
            text: xAxisText,
            font: {
              size: 20
            }
          }
        },
        y: {
          grid: {
            color: function (context) {
              if (context.tick.value == 2.5) {
                return "#000000";
              } else {
                return "#FFFFFF";
              }
            },
            lineWidth: function (context) {
              if (context.tick.value != 2.5) {
                return 0
              } else {
                return 1;
              }
            }
          },
          min: 0,
          max: 5,
          ticks: {
            callback: function (value, index, values) {
              if (value == 0) {
                return 'Low';
              } else if (value == 2.5) {
                return 'Medium';
              } else if (value == 5) {
                return 'High';
              }
              return '';
            }
          },
          title: {
            display: true,
            text: 'Support Ability',
            font: {
              size: 20
            }
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              let labelText = [
                " " + tooltipItem.dataset.label,
                xAxisText + ": " + tooltipItem.raw.x,
                "Support Ability: " + tooltipItem.raw.y,
                "Budget: " + tooltipItem.raw.budget
              ];
              return labelText;
            }
          }
        }
      }
    }
  }

  private generateRadarChartData(values: Assessment[]) {
    let data = values.map((entry: Assessment) => {
      return {
        ID: entry.Puri,
        label: entry.Name,
        backgroundColor: "rgba(172,194,132,0.2)",
        borderColor: this.backgroundColors[entry.Puri],
        pointBackgroundColor: "#fff",
        pointBorderColor: "#9DB86D",
        data: [
          entry.StrategicFit || 0,
          entry.SupportAbility || 0,
          entry.TargetAbility || 0,
          entry.ExpectedPublicValue || 0,
          entry.EstimatedBudget || 0
        ]
      }
    });

    this.radarChartData = {
      labels: [
        'Strategic Fit',
        'Support Ability',
        'Target Support Ability',
        'Expected Public Value',
        'Estimated Budget (mill €)'
      ],
      datasets: data
    };

    this.radarChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 1,
      elements: {
        line: {
          borderWidth: 3
        }
      }
    };
  }

  private createView(name: string, id: number, policy: string, supportability: number, abbs: any) {
    let view = {
      Name: name,
      Id: id,
      Policy: policy,
      SupportAbility: supportability,
      Abbs: abbs
    };

    return view;
  }

  private generateChartColors(): void {
    this.survey.forEach((lAssessment: Assessment) => {
      this.backgroundColors[lAssessment.Puri] = "#" + Math.floor(Math.random() * 16777215).toString(16);
      this.borderColors[lAssessment.Puri] = "#" + Math.floor(Math.random() * 16777215).toString(16);
    });

    this.generateCharts(this.filteredData);
  }

  private exportPDF(): void {
    const lPDF = new jsPDF();

    this.addIntroductionPage(lPDF);

    lPDF.addPage();
    this.addPageTemplate(lPDF, 2);

    let lY: number = this.addExplanatoryText(lPDF, 15, 35, 1);

    let lBubbleChart = document.getElementById("bubbleChartId");
    let lRadarChart = document.getElementById("radarChartId");
    html2canvas(lBubbleChart).then((canvas) => {
      if (!(canvas.height === 0) && !(canvas.width === 0)) {
        let img = canvas.toDataURL("image/url");
        lPDF.addImage(img, "png", 50, lY, 100, 100);
        html2canvas(lRadarChart).then((canvas) => {
          if (!(canvas.height === 0) && !(canvas.width === 0)) {
            let img = canvas.toDataURL("image/url");
            lPDF.addImage(img, "png", 25, lY + 100, 150, 100);

            lPDF.addPage();
            this.addPageTemplate(lPDF, 2);
            lY = this.addExplanatoryText(lPDF, 15, 35, 2);

            const headers = [["Name", "Domain", "Strategic Fit", "Support Ability", "Target Ability", "Expected Public Value", "Estimated Budget (mill €)"]];
            const rows = [];
            this.survey.forEach((lAssessment: Assessment) => {
              let row = [lAssessment.Name, lAssessment.Policy, lAssessment.StrategicFit, lAssessment.SupportAbility, lAssessment.TargetAbility, lAssessment.ExpectedPublicValue, lAssessment.EstimatedBudget];
              rows.push(row);
            });

            autoTable(lPDF, {
              head: headers,
              body: rows,
              theme: 'grid',
              startY: lY
            });

            this.pdfData.emit(lPDF);
          } else {
            lPDF.save(this.PDFName);
          }
        });
      } else {
        lPDF.save(this.PDFName);
      }
    });
  }

  private addIntroductionPage(pPDF: any): void {
    this.addPageTemplate(pPDF, 1);

    // Add sentence1
    const lSentence1 = "DG DIGIT";
    const lSentence1Coords = [90, 60];
    pPDF.setFontSize(20);
    pPDF.setTextColor(0, 0, 0); // black
    pPDF.setFontType("bold");
    pPDF.text(lSentence1, ...lSentence1Coords);

    // Add sentence2
    const lSentence2 = "Unit.D2";
    const lSentence2Coords = [93, 70];
    pPDF.text(lSentence2, ...lSentence2Coords);

    // Add sentence3
    const lSentence3 = "eGovERA © portal";
    const lSentence3Coords = [52, 100];
    pPDF.setFontSize(35);
    pPDF.setTextColor(51, 153, 255); // blue
    pPDF.text(lSentence3, ...lSentence3Coords);

    // Add sentence4
    const lSentence4 = "Decision support section";
    const lSentence4Coords = [49, 130];
    pPDF.setTextColor(0, 153, 0); // light green
    pPDF.setFontSize(27);
    pPDF.text(lSentence4, ...lSentence4Coords);

    // Add sentence5
    const lSentence5 = "PDF export results";
    const lSentence5Coords = [65, 145];
    pPDF.text(lSentence5, ...lSentence5Coords);

    // Add user's information
    pPDF.setTextColor(0, 0, 0); // black
    pPDF.setFontSize(12);
    pPDF.setFontType("bold");
    pPDF.text("User name and surname:", 10, 250);
    pPDF.text("Organisation:", 10, 258);
    pPDF.text("Country:", 10, 266);
    pPDF.text("Contact E-mail:", 10, 274);
    pPDF.setFontType("normal");


    pPDF.text(this.contactInfo.fullName, 62, 250);
    pPDF.text(this.contactInfo.organisation, 39, 258);
    pPDF.text(this.contactInfo.country, 29, 266);
    pPDF.text(this.contactInfo.organisationEmail, 43, 274);
  }

  private addPageTemplate(pPDF: any, pTitleNum: number): void {
    const lTitleInfo = {
      1: { title: "Introduction", coordinates: [88, 20] },
      2: { title: "Portfolio Management Decision Support", coordinates: [45, 20] },
      3: { title: "Digital Transformation Roadmap Decision Support", coordinates: [30, 20] },
      4: { title: "eGovERA© Building Blocks", coordinates: [65, 20] }
    };

    const lRightIcon = new Image();
    lRightIcon.src = "/assets/img/ec2.png";
    const lRightIconCoords = [180, 1, 25, 18]; // x, y, width, heigth
    pPDF.addImage(lRightIcon, "png", ...lRightIconCoords);

    const lLeftIcon = new Image();
    lLeftIcon.src = "/assets/img/egovera-icon2.png";
    const lLeftIconCoords = [4, 2, 12, 11]; // x, y, width, heigth
    pPDF.addImage(lLeftIcon, "png", ...lLeftIconCoords);

    const lTopSentence = "eGovERA ©";
    const lTopSentenceCoords = [15, 10]; // x, y
    pPDF.setTextColor(0, 0, 0);
    pPDF.setFontType("normal");
    pPDF.setFontSize(15);
    pPDF.text(lTopSentence, ...lTopSentenceCoords);


    const lLeftSentence = "Copyright © European Commission 2022";
    const lLeftSentenceCoords = [10, 292]; // x, y
    pPDF.setTextColor(192, 192, 192);
    pPDF.setFontType("italic");
    pPDF.setFontSize(10);
    pPDF.text(lLeftSentence, ...lLeftSentenceCoords);

    const lRightSentence = "ISA product license v1.4";
    const lRightSentenceCoords = [160, 292]; // x, y
    pPDF.setFontSize(10);
    pPDF.setTextColor(102, 178, 255); // light blue
    pPDF.text(lRightSentence, ...lRightSentenceCoords);
    pPDF.setLineWidth(0.1);
    pPDF.setDrawColor(102, 178, 255); // light blue
    pPDF.line(160, 293, 198, 293); // startX, startY, endX, endY

    // Add title
    const lTitleSentence = lTitleInfo[pTitleNum].title;
    const lTitleCoords = lTitleInfo[pTitleNum].coordinates;
    pPDF.setFontSize(17);
    pPDF.setTextColor(0, 153, 0); // green
    pPDF.setFontType("bold");
    pPDF.text(lTitleSentence, ...lTitleCoords);
  }

  private addExplanatoryText(pPDF: any, pStartX: number, pStartY: number, pSentenceNum: number): number {
    const lExplanatorySencentes = {
      1: [
        "The quadrant represents the scores assigned to the evaluated digital business capability/ies,",
        " according to the following parameters:",
        "   • National Strategy Fit",
        "   • Ability to support the DBC",
        "   • Target Perspective Ability to Support DBC",
        "   • Expected Public Value",
        "   • Estimated budget (in millions EUR)"
      ],
      2: [
        "In addition to the information visible from the quadrant, in the following table you can find a summary of the Capability ",
        "Assessment Results. In particular, the below table shows the current MS's ability to support the evaluated digital ",
        "business capability/ies and the target ability to support the evaluated Digital Business Capabilities. As a result, the ",
        "estimated budget aims to fulfil the GAP between the 'AS IS ability' and the target prospective ability. Moreover, the ",
        "scores are reported per area/view (legal, organisation, semantic, technical-application and technical infrastructure).",
        "Finally, you find a summary of the assigned parameters (National Digital fit, Expected Public Value and Estimated ",
        "Budget) to evaluated Digital Business Capability/ies."
      ],
      3: [
        "The following table sumarises the selected Digital Business Capabilities"
      ],
      4: [
        "Below, you have a summary table and a graphical representation of all the Digital Public Services in",
        "scope, meaning the ones supporting the selected Digital Business Capability"
      ],
      5: [
        "The following graph represents the MS's Digital Transformation Roadmap, by which the user can",
        "select the different orientation for the implementation of the selected digital bysiness capability"
      ],
      6: [
        "The following table summarises the selected Digital Business Capabilities"
      ],
      7: [
        "Below you can see the graphical representation of the functionalities (i.e. Skills, expertise, experience",
        "etc.) supporting the selected Digital Business Capability, based on the MS's orientation (legal,",
        "organizational, semantic and technical) priority chosen. The content of the nodes (expressed by the",
        "blue color) is variable because it reflects the relation between the ABBs and the ability to support",
        "the selected Digital Business Capability"
      ],
      8: [
        "The following is a table containing the list of the functionalities (i.e. Skills, expertise, experience, etc.)",
        "needed to implement the selected Digital Business Capability"
      ]
    };

    let lLineGap;

    if (pSentenceNum === 2) {
      pPDF.setFontSize(10);
      lLineGap = 5;
    } else {
      pPDF.setFontSize(12);
      lLineGap = 7
    }

    pPDF.setFontType("italic");
    pPDF.setTextColor(0, 0, 0);

    let lY: number = pStartY;
    lExplanatorySencentes[pSentenceNum].forEach((lSentence: string) => {
      pPDF.text(lSentence, pStartX, lY);
      lY = lY + lLineGap;
    });

    return lY;
  }
}

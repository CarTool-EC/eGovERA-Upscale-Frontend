import { Component, OnInit, Output, AfterViewInit, EventEmitter, OnChanges, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Network, DataSet } from 'vis';
import { DigitalPublicService } from '@shared/classes/DigitalPublicService.class';
import { ArchitectureBuildingBlock } from '@shared/classes/ArchitectureBuildingBlock.class';
import { Assessment } from '@shared/classes/Assessment.class';
import { StorageService } from '@shared/services/storage.service';

@Component({
  selector: 'app-digital-transformation-roadmap',
  templateUrl: './digital-transformation-roadmap.component.html',
  styleUrl: './digital-transformation-roadmap.component.scss'
})
export class DigitalTransformationRoadmapComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() assessment: Assessment;
  @Input() DBC: any;
  @Input() downloadPDF: any;

  @ViewChild('dpsNetwork') dpsNetwork: ElementRef;
  @ViewChild('viewNetwork') viewNetwork: ElementRef;
  @ViewChild('abbNetwork') abbNetwork: ElementRef;

  @Output('componentLoaded') componentLoaded: EventEmitter<boolean> = new EventEmitter();
  public dpsNetworkInstance: Network;
  public viewNetworkInstance: Network;
  public abbNetworkInstance: Network;

  public viewList: { name: string, id: number }[] = [];
  public relatedDPSForm: FormGroup = null;
  public orientationForm: FormGroup = null;
  public selectedDPSList: DigitalPublicService[] = [];
  public selectedView = { Policy: "", Name: "" };
  public ABBs: ArchitectureBuildingBlock[] = [];
  public abbList: ArchitectureBuildingBlock[] = [];
  public selectedABB: ArchitectureBuildingBlock = null;

  public showAbbNetwork = false;
  public toogleInfra: boolean = true;
  public busOrientation: number = 1;
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

  public policyColors = {
    Health: "#e74a3b",
    Taxes: "#4e73df",
    "Business Agnostic": "#1cc88a",
    "Technical Infrastructure": "#1cc88a",
  };

  public policyColorsWithOpacity = {
    Health: "#e74a3b80",
    Taxes: "#4e73df80",
    "Business Agnostic": "#1cc88a80",
    "Technical Infrastructure": "#1cc88a80",
  };

  public policyImages = {
    hHalth: "../img/health.png",
    Taxes: "../img/tax.png",
    "Business Agnostic": "../img/tech.png",
  };

  constructor(
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    this.loadReasources();
    this.viewList = [{ name: "Legal", id: 2 }, { name: "Organisational", id: 3 }, { name: "Semantic", id: 4 }, { name: "Technical - Application", id: 5 }, { name: "Techincal - Infrastructure", id: 6 }];
    this.orientationForm = new FormGroup({
      orientation: new FormControl({ value: 1, disabled: false })
    });
    this.relatedDPSForm = this.buildForm(this.DBC.RelatedDPSs);
  }

  ngAfterViewInit(): void {
    this.drawDPSNetwork(this.DBC.RelatedDPSs);
    this.drawViewNetwork(this.DBC);
    this.networkEvent();
    this.componentLoaded.emit(true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.DBC != undefined && !changes.DBC.firstChange) {
      this.abbList = [];
      this.toogleInfra = true;
      this.relatedDPSForm = null;
      this.selectedDPSList = [];

      this.relatedDPSForm = this.buildForm(changes.DBC.currentValue.RelatedDPSs);
      this.loadReasources();
      this.drawDPSNetwork(changes.DBC.currentValue.RelatedDPSs);
      this.drawViewNetwork(changes.DBC.currentValue);
      this.networkEvent();
    }

    if (changes.downloadPDF != undefined && !changes.downloadPDF.firstChange) {
      this.generatePDF(changes.downloadPDF.currentValue);
    }
  }

  private generatePDF(lPDF: any) {
    lPDF.addPage();
    this.addPageTemplate(lPDF, 3);
    this.addExplanatoryText(lPDF, 15, 35, 3);
    this.addExplanatoryText(lPDF, 15, 93, 4);

    let titles1 = [[{ content: "Selected Digital Business Capability", colSpan: 2 }]];
    let titles2 = [[{ content: "Table of Digital Public Services in scope", colSpan: 3 }]];
    let data1 = [["ID", this.DBC.Puri], ["Name", this.DBC.Name], ["Policy", this.DBC.Policy], ["Estimated Budget (mill €)", this.DBC.EstimatedBudget]];
    let data2 = [];

    let num = 0;
    for (let i = 0; i < Math.floor(this.DBC.RelatedDPSs.length / 3) + 1; i++) {
      let currentRow = [];
      for (let j = 0; j < 3; j++) {
        if (num < this.DBC.RelatedDPSs.length) {
          currentRow.push(this.DBC.RelatedDPSs[num].Name);
        }
        num += 1;
      }
      if (currentRow.length > 0) {
        data2.push(currentRow);
      }
    }

    autoTable(lPDF, {
      head: titles1,
      body: data1,
      theme: "grid",
      startY: 42
    });

    autoTable(lPDF, {
      head: titles2,
      body: data2,
      theme: "grid",
      startY: 105
    });


    let lDPSNetwork = document.getElementById("myNetwork");
    html2canvas(lDPSNetwork).then((canvas) => {
      if (!(canvas.height === 0) && !(canvas.width === 0)) {
        let decreasedSpace = 0;
        switch (data2.length) {
          case 1:
            decreasedSpace = 45;
            break;
          case 2:
            decreasedSpace = 35;
            break;
          case 3:
            decreasedSpace = 24;
            break;
          case 4:
            decreasedSpace = 11;
            break;
          case 5:
            decreasedSpace = 0;
            break;
        }

        const graphTitle1 = "Graphical representation of the Digital Public Services in scope";
        autoTable(lPDF, {
          startY: 174 - decreasedSpace,
          head: [
            [
              {
                content: graphTitle1,
                styles: { halign: "center", fillColor: [8, 161, 88] },
              },
            ],
          ],
          margin: { right: 10 },
        });

        let img = canvas.toDataURL("image/url");
        let imgProps = lPDF.getImageProperties(img);
        let pdfWidth = lPDF.internal.pageSize.getWidth();
        let pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        lPDF.addImage(
          img,
          "png",
          14,
          180 - decreasedSpace,
          pdfWidth - 24,
          pdfHeight
        );

        // Add the Information for the second section of the Digital Transformation Roadmap
        lPDF.addPage();
        this.addPageTemplate(lPDF, 3);
        this.addExplanatoryText(lPDF, 15, 35, 5);

        let lViewNetwork = document.getElementById("otherNetwork");

        html2canvas(lViewNetwork).then((canvas) => {
          if (!(canvas.height === 0) && !(canvas.width === 0)) {
            // Add the title
            let graphTitle2 = "Steps of the Digital Transformation Roadmap";
            autoTable(lPDF, {
              startY: 45,
              head: [
                [
                  {
                    content: graphTitle2,
                    styles: {
                      halign: "center",
                      fillColor: [8, 161, 88],
                    },
                  },
                ],
              ],
              margin: { right: 10 },
            });

            let img = canvas.toDataURL("image/url");
            let imgProps = lPDF.getImageProperties(img);
            let pdfWidth = lPDF.internal.pageSize.getWidth();
            let pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            lPDF.addImage(
              img,
              "png",
              14,
              51,
              pdfWidth - 24,
              pdfHeight
            );
            let data = [
              [
                "Legal Orientation: a member state has a legal orientation when its first priority, in the digital public service design, is to address and implement legal requirements",
              ],
              [
                "Organizational/Governance Orientation: a member state has a governance orientation when its first priority, in the digital public service design, is to address the possible channels for the public service delivery, and the definition of Governance model",
              ],
              [
                "Semantic/Intergration Orientation: a member state has a semantic/intergration orientation when its first priority, in the digital public service design, is to address the possible source of data (e.g. base registry), how data will be exchanged and to define guidelines and agreements for the sharing data",
              ],
              [
                "Technical Orientation: a member state has a legal orientation when its first priority, in the digital public service design, is to reuse/share software components (e.g. registry services), to address exchanging capabilities of data (e.g. interfaces) and to define technical interoperability agreements",
              ],
            ];

            autoTable(lPDF, {
              startY: pdfHeight + 51,
              head: [
                [
                  {
                    content: "Implementation orientation for the digital transformation",
                    styles: {
                      halign: "center",
                      fillColor: [8, 161, 88],
                    }
                  },
                ],
              ],
              body: data,
              theme: "grid",
            });

            if (this.showAbbNetwork) {
              lPDF.addPage();
              this.addPageTemplate(lPDF, 3);
              this.addExplanatoryText(lPDF, 15, 35, 6);
              this.addExplanatoryText(lPDF, 15, 90, 7);

              let titles1 = [[{ content: "Digital Business Capability", colSpan: 2 }]];
              let data1 = [["ID", this.DBC.Puri], ["Name", this.DBC.Name], ["Policy", this.DBC.Policy], ["Estimated Budget (mill €)", this.DBC.EstimatedBudget]];
              autoTable(lPDF, {
                startY: 40,
                head: titles1,
                body: data1,
                theme: "grid"
              });

              let lABBNetwork = document.getElementById("testNetwork");

              html2canvas(lABBNetwork).then((canvas) => {
                if (!(canvas.height === 0) && !(canvas.width === 0)) {
                  let graphTitle3 = "Functionalities supporting the Digital Business Capability";
                  lPDF.autoTable({
                    startY: 125,
                    head: [
                      [
                        {
                          content: graphTitle3,
                          styles: {
                            halign: "center",
                            fillColor: [8, 161, 88],
                          },
                        },
                      ],
                    ],
                    margin: { right: 10 },
                  });

                  let img = canvas.toDataURL("image/url");
                  let imgProps = lPDF.getImageProperties(img);
                  let pdfWidth = lPDF.internal.pageSize.getWidth();
                  let pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                  lPDF.addImage(
                    img,
                    "png",
                    14,
                    132,
                    pdfWidth - 24,
                    pdfHeight
                  );

                  if (this.abbList.length > 0) {
                    lPDF.addPage();
                    this.addPageTemplate(lPDF, 4);
                    this.addExplanatoryText(lPDF, 15, 35, 8);
                    let titles = [["Name", "View", "Description", "Related DBC", "Related DPS", "Successors"]]
                    let data = [];
                    this.abbList.forEach((lABB: ArchitectureBuildingBlock) => {
                      let lRow = [lABB.Name, lABB.View, lABB.Description];
                      let lRelatedDBCs = "";
                      lABB.RelatedDBCs.forEach((lDBC: string) => {
                        lRelatedDBCs = lRelatedDBCs + this.prettyfyUri(lDBC) + "\n";
                      });
                      lRow.push(lRelatedDBCs);

                      let lRelatedDPSs = "";
                      lABB.RelatedDPSs.forEach((lDPS: string) => {
                        lRelatedDPSs = lRelatedDPSs + this.prettyfyUri(lDPS) + "\n";
                      });
                      lRow.push(lRelatedDPSs);

                      let lSuccessors = "";
                      lABB.Successors.forEach((lSucc: string) => {
                        lSuccessors = lSuccessors + this.prettyfyUri(lSucc) + "\n";
                      });
                      lRow.push(lSuccessors);

                      data.push(lRow);
                    });

                    autoTable(lPDF, {
                      startY: 50,
                      head: titles,
                      body: data,
                      theme: "grid",
                      bodyStyles: {
                        fontSize: 5
                      }
                    });
                    lPDF.save(this.PDFName);
                  } else {
                    lPDF.save(this.PDFName);
                  }
                } else {
                  lPDF.save(this.PDFName);
                }
              });
            } else {
              lPDF.save(this.PDFName);
            }
          } else {
            lPDF.save(this.PDFName);
          }
        });
      } else {
        lPDF.save(this.PDFName);
      }
    });
  }

  // public onOrientationClick() {
  //   this.busOrientation = this.orientationForm.value.orientation;

  //   this.drawViewNetwork(this.DBC);
  //   this.networkEvent();
  // }

  public onCheckboxClick(DPS: DigitalPublicService) {
    let checkboxValue: boolean = this.relatedDPSForm.value["dpsForm-" + DPS.Puri];
    if (checkboxValue) {
      this.selectedDPSList.push(DPS);
    } else {
      this.selectedDPSList.splice(this.selectedDPSList.indexOf(DPS), 1);
    }

    if (this.selectedDPSList.length > 0) {
      this.drawDPSNetwork(this.selectedDPSList);
      this.drawViewNetwork(this.DBC);
    } else {
      this.drawDPSNetwork(this.DBC.RelatedDPSs);
      this.drawViewNetwork(this.DBC);
    }
    this.networkEvent();
  }

  public onSlideToggleChange(event: boolean) {
    this.toogleInfra = event;
    this.drawViewNetwork(this.DBC);
    this.networkEvent();
  }

  public isFirst(lView: { name: string, id: number }): boolean {
    return this.viewList.indexOf(lView) === 0;
  }

  public isLast(lView: { name: string, id: number }): boolean {
    return this.viewList.indexOf(lView) === this.viewList.length - 1;
  }

  public onOrientationClick(lView: { name: string, id: number }, isPositionIncreased: boolean): void {
    let lIndex: number = this.viewList.indexOf(lView);
    this.viewList.splice(lIndex, 1);

    if (isPositionIncreased) {
      this.viewList.splice(lIndex - 1, 0, lView);
    } else {
      this.viewList.splice(lIndex + 1, 0, lView);
    }

    this.drawViewNetwork(this.DBC);
  }

  private buildForm(pInput: any[]) {
    let lForm: FormGroup = new FormGroup({});
    pInput.forEach((value: any) => {
      lForm.addControl('dpsForm-' + value.Puri, new FormControl({ value: false, disabled: false }));
    });

    return lForm;
  }

  private drawDPSNetwork(input: any) {
    if (this.dpsNetworkInstance != null) {
      this.dpsNetworkInstance.destroy();
      this.dpsNetworkInstance = null;
    }
    let nodes = input.map((dps: DigitalPublicService) => {
      let dpsSupportAbility = this.assessment.DigitalPublicService[dps.Puri] != undefined ? this.assessment.DigitalPublicService[dps.Puri].SupportAbility : "1";
      let text = `<div>
      ${this.dpsDetailChild("Puri: ", dps.Puri).outerHTML}
      ${this.dpsDetailChild("Name: ", dps.Name).outerHTML}
      ${this.dpsDetailChild("Policy: ", dps.Policy).outerHTML}
      ${this.dpsDetailChild("Support ability: ", parseFloat(dpsSupportAbility).toFixed(2)).outerHTML}
      </div>`

      return this.createDigitalTransformNode(dps.Puri, "circularImage", "tech.png", dps.Name, text, { background: "#1CC88A" }, 100, 10);
    });

    nodes = new DataSet<any>(nodes);

    const data = { nodes };

    const options = {
      interaction: {
        hover: true,
        navigationButtons: true,
        keyboard: true
      },
      height: "100%",
      width: "100%",
      nodes: {
        borderWidth: 1,
        size: 30,
        shape: "circularImage",
        shadow: true,
        font: { color: "#000", size: 17 }
      },
      physics: {
        forceAtlas2Based: {
          springLength: -10
        },
        minVelocity: 0.75,
        solver: "forceAtlas2Based",
        timestep: 0.53
      }
    }

    const container = this.dpsNetwork.nativeElement;
    this.dpsNetworkInstance = new Network(container, data, options);
  }

  private dpsDetailChild(key, value) {
    const div = document.createElement("div");
    const spanLeft = document.createElement("span");
    const spanRight = document.createElement("span");
    div.appendChild(spanLeft);
    div.appendChild(spanRight);

    spanLeft.innerText = key;
    spanRight.innerText = value;

    return div;
  }

  private drawViewNetwork(dbc: any) {
    if (this.viewNetworkInstance != null) {
      this.viewNetworkInstance.destroy();
      this.viewNetworkInstance = null;
    }

    this.toogleInfra = false;
    let showNonInfra = true;

    let nodes = [];
    let color = { background: "#fff" };

    let bcTitle = `<div>
    <div>Puri: ${dbc.Puri}</div>
    <div>Name: ${dbc.Name}</div>
    <div>Strategic Fit: ${dbc.StrategicFit}</div>
    <div>Support Ability: ${parseFloat(dbc.SupportAbility).toFixed(2)} out of 5</div>
    </div>`;
    let bcNode = this.createDigitalTransformNode(this.idBCdom, "circularImage", "bc.png", dbc.Name, bcTitle, color, 100, 10);
    nodes.push(bcNode);

    let startNode = this.createDigitalTransformNode(100, "circularImage", "start.png", "Start", "Start", color, -10, 0);
    nodes.push(startNode);

    let views = dbc.Views;
    let count = 0;
    if (showNonInfra) {
      views.forEach((view: any) => {
        count = count + 1;
        let id = null;
        let color = { background: this.getColorPerPolicy(view.Policy, true) };
        let image = null;
        let labelInit = null;
        let label = null;
        switch (view.Name) {
          case "Legal": {
            image = "legal.png";
            id = this.idLdom;
            labelInit = "L";
            break;
          }
          case "Organisational": {
            image = "org.png";
            id = this.idOdom;
            labelInit = "O";
            break;
          }
          case "Semantic": {
            image = "data.png";
            id = this.idSdom;
            labelInit = "S";
            break;
          }
          case "Technical Application": {
            image = "TA.png";
            id = this.idTAdom;
            labelInit = "TA";
            break;
          }
          case "Technical Infrastructure": {
            image = "tech.png";
            id = this.idTIdom;
            labelInit = "TI";
            break;
          }
          default: {
            image = "tech.png";
            labelInit = "E";
            break;
          }
        }

        let title;
        if (view.Abbs.length == 0) {
          // title = labelInit + "- Business Agnostic";
          title = view.Name;
          label = `<div>
          <div>${view.Name}</div>
          </div>`;
        } else {
          let viewSupportAbility = this.assessment.View[view.Name] ? this.assessment.View[view.Name].SupportAbility : "1";

          // title = labelInit + " - " + dbc.Policy + " - " + parseFloat(viewSupportAbility).toFixed(2) + " out of 5";
          title = view.Name + " - " + Math.round(viewSupportAbility) + " out of 5";
          label = `<div>
          <div>${view.Name}</div>
          <div>Support Ability: ${Math.round(viewSupportAbility)} out of 5</div>
          </div>`;
        }

        let viewNode = this.createDigitalTransformNode(id, "circularImage", image, title, label, color, 10 * count, 0);
        nodes.push(viewNode);
      });
    }

    if (this.toogleInfra) {
      views.forEach((view: any) => {
        let id = null;
        let color = { background: this.getColorPerPolicy("Business Agnostic", true) };
        let image = null;
        let labelInit = null;
        let label = null;
        switch (view.Name) {
          case "Legal": {
            image = "legal.png";
            id = this.idLinf;
            labelInit = "L";
            break;
          }
          case "Organisational": {
            image = "org.png";
            id = this.idOinf;
            labelInit = "O";
            break;
          }
          case "Semantic": {
            image = "data.png";
            id = this.idSinf;
            labelInit = "S";
            break;
          }
          case "Technical Application": {
            image = "TA.png";
            id = this.idTAinf;
            labelInit = "TA";
            break;
          }
          case "Technical Infrastructure": {
            image = "tech.png";
            id = this.idTIinf;
            labelInit = "TI";
            break;
          }
          default: {
            image = "tech.png";
            labelInit = "E";
            break;
          }
        }

        label = labelInit + " - Business Agnostic";

        let viewNode = this.createDigitalTransformNode(id, "circularImage", image, label, label, color, 10 * count, -10);
        nodes.push(viewNode);
      });
    }

    const edges: DataSet<any> = this.resolveNetworkEdges(bcNode, startNode, showNonInfra);

    const data = { nodes: new DataSet<any>(nodes), edges: edges };

    const options = {
      interaction: {
        hover: true,
        navigationButtons: true,
        keyboard: true
      },
      height: "100%",
      width: "100%",
      nodes: {
        borderWidth: 1,
        size: 30,
        shadow: true,
        color: {
          border: "#222222",
          background: "#BBE1FA"
        },
        font: { color: "#000", size: 17 }
      },
      edges: {
        smooth: {
          enabled: true,
          type: "dynamic",
          forceDirection: "horizontal",
          roundness: 0.4
        },
        color: "gray",
        arrows: 'to',
        shadow: true
      },
      physics: {
        forceAtlas2Based: {
          springLength: -10
        },
        minVelocity: 0.75,
        solver: "forceAtlas2Based",
        timestep: 0.53
      }
    }

    let container = this.viewNetwork.nativeElement;
    this.viewNetworkInstance = new Network(container, data, options);
  }

  private networkEvent() {
    this.viewNetworkInstance.on("select", (params) => {
      params.event = "[original event]";
      let selectedNodeId = Number(this.viewNetworkInstance.getNodeAt(params.pointer.DOM));

      let lSelectedView = this.DBC.Views.filter((view: any) => view.Id === selectedNodeId || view.Id + 5 === selectedNodeId)[0];
      if (lSelectedView != undefined) {
        this.selectedView = lSelectedView;
        if (this.selectedDPSList.length === 0) return;
        let lABBs = this.filterABBSBaseDPS(lSelectedView.Abbs);
        let lNewView = { ...lSelectedView };
        lNewView.Abbs = lABBs;
        this.showAbbNetwork = true;
        this.drawABBNetwork(lSelectedView);
        this.createABBTableFromView(lSelectedView);
      }
    });
  }

  private createABBTableFromView(pSelectedView: any) {
    this.abbList = pSelectedView.Abbs.filter((lABB: ArchitectureBuildingBlock) => this.selectedDPSList.some((lDPS: DigitalPublicService) => lABB.RelatedDPSs.includes(lDPS.Puri)));
  }

  public drawABBNetwork(pSelectedView) {
    if (this.abbNetworkInstance != null) {
      this.abbNetworkInstance.destroy();
      this.abbNetworkInstance = null;
    }

    if (pSelectedView.Abbs.length === 0) {
      console.log("There are no ABBs available for this filter combination");
      return;
    }

    let lNodes = [];
    let lEdges = [];
    pSelectedView.Abbs.forEach((lABB: ArchitectureBuildingBlock) => {
      let abbSupportAbility = this.assessment.ArchitectureBuildingBlock[lABB.Puri] != undefined ? this.assessment.ArchitectureBuildingBlock[lABB.Puri].SupportAbility : "N/A";
      let image;
      if (abbSupportAbility < 0.5 || abbSupportAbility === "N/A") {
        image = "rank/old-0.png";;
      } else if (abbSupportAbility < 1.5) {
        image = "rank/old-1.png";
      } else if (abbSupportAbility < 2.5) {
        image = "rank/old-2.png";
      } else if (abbSupportAbility < 3.5) {
        image = "rank/old-3.png";
      } else if (abbSupportAbility < 4.5) {
        image = "rank/old-4.png";
      } else if (abbSupportAbility < 5 || abbSupportAbility === 5) {
        image = "rank/old-5.png";
      } else {
        image = "rank/old-0.png";
      }

      let label = lABB.Name;
      let title = `<div>
      <div>Puri: ${lABB.Puri}</div>
      <div>Name: ${lABB.Name}</div>
      <div>Policy Domain: ${lABB.Policy}</div>
      <div>DPSs: ${lABB.RelatedDPSs.join(", ")}</div>
      <div>Support Ability: ${parseFloat(abbSupportAbility).toFixed(2)}</div>
      </div>`;
      let color = { background: "#fff" };
      let lABBNode = this.createDigitalTransformNode(lABB.Puri, "circularImage", image, label, title, color);

      lNodes.push(lABBNode);

      lABB.Successors.forEach((lSuccessor: string) => {
        lEdges.push({ from: lABB.Puri, to: lSuccessor });
      });
    });

    const lData = { nodes: new DataSet<any>(lNodes), edges: new DataSet<any>(lEdges) };

    const lOptions = {
      interaction: {
        hover: true,
        navigationButtons: true,
        keyboard: true
      },
      height: "100%",
      width: "100%",
      nodes: {
        borderWidth: 1,
        size: 30,
        shadow: true,
        color: {
          border: "#222222",
          background: "#BBE1FA"
        },
        font: { color: "#000", size: 10 }
      },
      edges: {
        smooth: {
          enabled: true,
          type: "dynamic",
          forceDirection: "horizontal",
          roundness: 0.4
        },
        color: "gray",
        arrows: 'to',
        shadow: true
      },
      physics: {
        forceAtlas2Based: {
          springLength: -5
        },
        minVelocity: 0.75,
        solver: "forceAtlas2Based",
        timestep: 0.53
      }
    }

    let lContainer = this.abbNetwork.nativeElement;
    this.abbNetworkInstance = new Network(lContainer, lData, lOptions);
    this.abbNetworkInstance.on("select", (params) => {
      params.event = "[original event]";
      let selectedNodeId = this.abbNetworkInstance.getNodeAt(params.pointer.DOM);
      this.selectedABB = this.ABBs.filter((lABB: ArchitectureBuildingBlock) => lABB.Puri === selectedNodeId)[0];
    })

  }

  private createDigitalTransformNode(id, shape, image, label, title, color, x?, y?, font?, DIR?) {
    if (!x && x !== 0) {
      x = null;
    }
    if (!y && y !== 0) {
      y = null;
    }
    font = font || "14px arial";
    DIR = DIR || "/assets/img/";

    let node = {
      id: id,
      shape: shape,
      image: DIR + image,
      font: font,
      label: label,
      title: title,
      color: color,
      x: x,
      y: y
    };

    return node;
  }

  private getColorPerPolicy(policy: string, opacity: boolean) {
    let selection = opacity ? this.policyColorsWithOpacity : this.policyColors;

    return selection[policy] || "#858796";
  }

  private resolveNetworkEdges(bcNode: any, startNode: any, showNonInfra: boolean) {
    let edges = new DataSet<any>([]);
    this.viewList.forEach((currentValue: { name: string, id: number }, index: number) => {
      if (index === 0) {
        edges.add({ from: startNode.id, to: currentValue.id, dashes: false });
      } else {
        edges.add({ from: this.viewList[index - 1].id, to: currentValue.id, dashes: false });
      }

      if (index === this.viewList.length - 1) {
        edges.add({ from: currentValue.id, to: bcNode.id, dashes: false });
      }
    });

    return edges;
  }

  public filterABBSBaseDPS(pABBs: any): ArchitectureBuildingBlock[] {
    let filteredABBs: ArchitectureBuildingBlock[] = pABBs.filter((lABB: ArchitectureBuildingBlock) => {
      let filterIn: boolean = false;
      this.selectedDPSList.forEach((lDPS: DigitalPublicService) => {
        filterIn = lABB.RelatedDPSs.includes(lDPS.Puri);
      });

      return filterIn;
    });

    return filteredABBs;
  }

  private loadReasources() {
    this.ABBs = this.storageService.getABBs().filter((lABB: ArchitectureBuildingBlock) => lABB.RelatedDBCs.includes(this.DBC.Puri));
    this.abbList = this.ABBs;
  }

  public prettyfyUri(uri) {
    if (uri.includes("egovera")) {
      return uri.replace("http://data.europa.eu/dr8/egovera/", "");
    } else {
      return uri.replace("http://data.europa.eu/dr8/", "");
    }
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
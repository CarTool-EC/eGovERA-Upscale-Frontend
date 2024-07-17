import { Component, OnChanges, Input, SimpleChanges } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Assessment } from '@shared/classes/Assessment.class';

@Component({
  selector: 'app-export-pdf',
  templateUrl: './export-pdf.component.html',
  styleUrl: './export-pdf.component.scss'
})
export class ExportPdfComponent implements OnChanges {
  @Input('survey') survey: Assessment[];
  @Input('downloadPDF') downloadPDF: boolean;
  @Input('contactInfo') contactInfo: any;
  @Input('portfolioManagementData') portfolioManagementData: any

  public PDFName: string = "decision-support.pdf";

  constructor() { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.downloadPDF != undefined && changes.downloadPDF.currentValue) {
      console.log("Export PDF Changes: ", changes);
      // this.createPDF();
    }
  }

  private createPDF(): void {
    const lPDF = new jsPDF();
    this.addIntroductionPage(lPDF);
    
    html2canvas(this.portfolioManagementData).then((canvas) => {
      if (canvas.height != 0 && canvas.width != 0) {
        lPDF.addPage();
        this.addPageTemplate(lPDF,2)
        this.addExplanatoryText(lPDF, 15, 55, 1);
        let lImg = canvas.toDataURL("image/url");
        lPDF.addImage(lImg, "png", 15, 111, 175, 120);

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
      4: { title: "Digital Transformation Roadmap Decision Support", coordinates: [30, 20] },
      5: { title: "eGovERA© Building Blocks", coordinates: [65, 20] }
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

  private addExplanatoryText(pPDF: any, pStartX: number, pStartY: number, pSentenceNum: number): void {
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
  }
}

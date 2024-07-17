import { Component } from '@angular/core';

@Component({
  selector: 'app-overview-and-guidelines',
  templateUrl: './overview-and-guidelines.component.html',
  styleUrl: './overview-and-guidelines.component.scss'
})
export class OverviewAndGuidelinesComponent {

  public DBCExternalLink: string = "https://joinup.ec.europa.eu/taxonomy/term/10223";
  public DBCTooltip: string = "Digital Business Capabilities are the key skills and capabilities a company or a Government requires to transform itself into a sustainable and successful business by considering digital technology as the enabling component.";
  public DPSTooltip: string = "A Digital Public Service is an interoperable service digitally provisioned by or on behalf of a public administration in fulfilment of public policy goals servicing to users either citizens, businesses or other public administrations. An European public service comprises any public service exposed to a cross-border dimension and supplied by public administrations, either to one another or to businesses and citizens in the Union. One or more Digital Public Service can realize one Digital Business Capability."
  public ABBTooltip: string = "An Architecture Building Block is a constituent component of the overall architecture that describes a single aspect of a specific Digital Public Service.";

  public StrategicFitTooltip: string = "It reports the strategic priority assigned to the Digital Business Capability by the national digital agenda of the country.";
  public SupportAbilityTooltip: string = "It measures the current ability to support the Digital Business Capability";
  public TargetSupportAbilityTooltip: string = "It measures the perspective ability to support a Digital Business Capability";
  public ExpectedPublicValueTooltip: string = "It refers to the expected beneficial impact (cost discounted) provided by the target prospective ability (*) to support the Digital Business Capability. (*) default is the highest possible prospective ability.";
  public EstimatedBudgetTooltip: string = "It refers to the estimated amount (in millions of EUR) required to reach the target prospective ability of the Architectural Building Block to support the Digital Business Capability (to fulfill the GAP)";
}

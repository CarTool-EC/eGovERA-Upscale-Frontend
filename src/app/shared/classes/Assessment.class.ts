export class Assessment {
    constructor(
        public Puri: string,
        public Name: string,
        public Policy: string,
        public StrategicFit: number,
        public SupportAbility: number,
        public TargetAbility: number,
        public ExpectedPublicValue: number,
        public EstimatedBudget: number,
        public View: any,
        public DigitalPublicService: any,
        public ArchitectureBuildingBlock: any
    ) { }

    public setStrategicFit(pStrategicFit: number) {
        this.StrategicFit = Math.round(pStrategicFit);
    }

    public setSupportAbility(pSupportAbility: number) {
        this.SupportAbility = Math.round(pSupportAbility);
    }

    public setTargetAbility(pTargetAbility: number) {
        this.TargetAbility = Math.round(pTargetAbility);
    }

    public setExpectedPublicValue(pExpectedPublicValue: number) {
        this.ExpectedPublicValue = Math.round(pExpectedPublicValue);
    }

    public setEstimatedBudget(pEstimatedBudget: number) {
        this.EstimatedBudget = pEstimatedBudget;
    }

    public addViewValue(pView: string, pValue: { SupportAbility: number, TargetSupportAbility: number }): void {
        this.View[pView] = pValue;
    }

    public addDPSValue(pDPSPuri: string, pValue: { Name: string, SupportAbility: number }): void {
        this.DigitalPublicService[pDPSPuri] = { Name: pValue.Name, SupportAbility: Math.round(pValue.SupportAbility) };
    }

    public addABBValue(pABBPuri: string, pValue: { Name: string, SupportAbility: number }): void {
        this.ArchitectureBuildingBlock[pABBPuri] = { Name: pValue.Name, SupportAbility: Math.round(pValue.SupportAbility) };
    }

    public static initializeNewAssessment(pPuri: string, pName: string, pPolicy: string, pStrategicFit: number): Assessment {
        return new Assessment(
            pPuri,
            pName,
            pPolicy,
            pStrategicFit,
            null,
            null,
            null,
            null,
            {},
            {},
            {}
        );
    }

    public static parseAssessmentSurvey(pJson: any): Assessment {
        return new Assessment(
            pJson.Puri,
            pJson.Name,
            pJson.Policy,
            Math.round(pJson.StrategicFit),
            Math.round(pJson.SupportAbility),
            Math.round(pJson.TargetAbility),
            Math.round(pJson.ExpectedPublicValue),
            pJson.EstimatedBudget,
            pJson.View,
            pJson.DigitalPublicService,
            pJson.ArchitectureBuildingBlock
        );
    }
}
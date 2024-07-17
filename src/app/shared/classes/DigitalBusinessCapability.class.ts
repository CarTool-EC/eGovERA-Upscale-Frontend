export class DigitalBusinessCapability {
    constructor(
        public Puri: string,
        public Name: string,
        public Description: string,
        public Policy: string,
        public View: string,
        public RelatedDPSs: string[]
    ) {};

    public static fromJson(pJson: any): DigitalBusinessCapability {
        return new DigitalBusinessCapability(
            pJson.Puri,
            pJson.Name,
            pJson.Description,
            pJson.Policy,
            pJson.View,
            pJson.RelatedDPSs
        );
    }

    public static fromTestJson(pJson: any): DigitalBusinessCapability {
        let lDPSList = [];
        pJson.Digital_Public_Services.forEach((lDPS: { Name: string, ID: string}) => {
            lDPSList.push(lDPS.ID);
        });
        return new DigitalBusinessCapability(
            pJson.ID,
            pJson.Name,
            pJson.Description,
            pJson.Policy,
            "N/A",
            lDPSList
        );
    }
}
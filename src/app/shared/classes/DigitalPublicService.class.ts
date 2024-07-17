export class DigitalPublicService {
    constructor(
        public Puri: string,
        public Name: string,
        public Description: string,
        public Policy: string,
        public View: string,
        public RelatedDBCs: string[]
    ) {};

    public static fromJson(pJson: any): DigitalPublicService {
        return new DigitalPublicService(
            pJson.Puri,
            pJson.Name,
            pJson.Description,
            pJson.Policy,
            pJson.View,
            pJson.RelatedDBCs,
        );
    }

    public static fromTestJson(pJson: any): DigitalPublicService {
        return new DigitalPublicService(
            pJson.ID,
            pJson.Name,
            pJson.Description,
            pJson.Policy,
            "N/A",
            pJson.Digital_Business_Capability
        );
    }
}
export class ArchitectureBuildingBlock {
    constructor(
        public Puri: string,
        public Name: string,
        public Description: string,
        public Policy: string,
        public View: string,
        public RelatedDBCs: string[],
        public RelatedDPSs: string[],
        public Successors: string[],
    ) {};

    public static fromJson(pJson: any): ArchitectureBuildingBlock {
        return new ArchitectureBuildingBlock(
            pJson.Puri,
            pJson.Name,
            pJson.Description,
            pJson.Policy,
            pJson.View,
            pJson.RelatedDBCs,
            pJson.RelatedDPSs,
            pJson.Successors
        );
    }

    public static fromTestJson(pJson: any): ArchitectureBuildingBlock {
        return new ArchitectureBuildingBlock(
            pJson.ID,
            pJson.Architecture_Building_Block,
            pJson.Description,
            pJson.Policy,
            pJson.View,
            pJson.DBCs,
            pJson.Digital_Public_Service,
            pJson.successors
        );
    }
}
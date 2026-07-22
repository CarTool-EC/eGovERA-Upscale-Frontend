import { DigitalBusinessCapability } from "./DigitalBusinessCapability.class";

export class ModelDigitalBusinessCapability {
    constructor(
        public modelName: string,
        public DBCs: DigitalBusinessCapability[]
    ) {}

    public static fromJson(pJson: any): ModelDigitalBusinessCapability {
        const dbcs = (pJson.DBCs || []).map((dbcJson: any) =>
            DigitalBusinessCapability.fromJson(dbcJson)
        );
        return new ModelDigitalBusinessCapability(pJson.modelName, dbcs);
    }

    public static fromTestJson(pJson: any): ModelDigitalBusinessCapability {
        const dbcs = (pJson.DigitalBusinessCapabilities || []).map((dbcJson: any) =>
            DigitalBusinessCapability.fromJson(dbcJson)
        );
        return new ModelDigitalBusinessCapability(pJson.ID, dbcs);
    }
}

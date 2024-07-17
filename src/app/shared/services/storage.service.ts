import { Injectable } from '@angular/core';
import { ArchitectureBuildingBlock } from '@shared/classes/ArchitectureBuildingBlock.class';
import { DigitalBusinessCapability } from '@shared/classes/DigitalBusinessCapability.class';
import { DigitalPublicService } from '@shared/classes/DigitalPublicService.class';


@Injectable({
    providedIn: 'root'
})
export class StorageService {

    private ABBs: ArchitectureBuildingBlock[];

    private DBCs: DigitalBusinessCapability[];

    private filteredDBCs: {
        businessAgnostic: DigitalBusinessCapability[], 
        customs: DigitalBusinessCapability[],
        health: DigitalBusinessCapability[],
        taxes: DigitalBusinessCapability[]
    };

    private DPSs: DigitalPublicService[];
    
    public parseABBs(abbList: ArchitectureBuildingBlock[]): void {
    this.ABBs = abbList;
    }

    public getABBs(): ArchitectureBuildingBlock[] {
        return this.ABBs;
    }
    
    public parseDBCs(dbcList: DigitalBusinessCapability[]): void {
        this.DBCs = dbcList;

        this.filteredDBCs = {businessAgnostic: [], customs: [], health: [], taxes: []};

        dbcList.forEach((dbc: DigitalBusinessCapability) => {
            switch(dbc.Policy) {
                case 'Business Agnostic': {
                    this.filteredDBCs.businessAgnostic.push(dbc);
                    break;
                }
                case 'Customs': {
                    this.filteredDBCs.customs.push(dbc);
                    break;
                }
                case 'Health': {
                    this.filteredDBCs.health.push(dbc);
                    break;
                }
                case 'Taxes': {
                    this.filteredDBCs.taxes.push(dbc);
                    break;
                }
                default: {
                    console.log('DBC without proper domain: ', dbc.Name);
                    break;
                }
            }
        });
    }

    public getDBCs(): DigitalBusinessCapability[] {
        return this.DBCs;
    }
    
    public getFilteredDBCs(): {businessAgnostic: DigitalBusinessCapability[], customs: DigitalBusinessCapability[], health: DigitalBusinessCapability[], taxes: DigitalBusinessCapability[]} {
        return this.filteredDBCs;
    }
    
    public parseDPSs(dpsList: DigitalPublicService[]): void {
    this.DPSs = dpsList;
    }

    public getDPSs(): DigitalPublicService[] {
        return this.DPSs;
    }
}
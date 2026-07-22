import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ArchitectureBuildingBlock } from '@shared/classes/ArchitectureBuildingBlock.class';
import { DigitalBusinessCapability } from '@shared/classes/DigitalBusinessCapability.class';
import { DigitalPublicService } from '@shared/classes/DigitalPublicService.class';
import { PatchService } from './patch.service';

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

    private adHocRequirements: Map<string, ArchitectureBuildingBlock[]> = new Map();
    private adHocDPSs: Map<string, DigitalPublicService[]> = new Map();
    private adHocDBCs: Map<string, DigitalBusinessCapability[]> = new Map();

    private ready$ = new BehaviorSubject<boolean>(false);

    constructor(private patch: PatchService) {}
    
    public parseABBs(abbList: ArchitectureBuildingBlock[]): void {
        abbList.forEach((lABB: ArchitectureBuildingBlock) => {
            this.patch.getABBRelations(lABB.Puri)?.forEach((lDPSPuri: string) => {
                if (!lABB.RelatedDPSs.includes(lDPSPuri)) {
                    lABB.RelatedDPSs.push(lDPSPuri);
                }
                this.patch.getDPSRelations(lDPSPuri)?.dbc.forEach((lDBCPuri: string) => {
                    if (!lABB.RelatedDBCs.includes(lDBCPuri)) {
                        lABB.RelatedDBCs.push(lDBCPuri);
                    }
                });
            });
        });
        this.ABBs = abbList;
        this.checkReady();
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
                    this.patch.getDBCRelations(dbc.Puri)?.forEach((lDPSPuri: string) => {
                        if (!dbc.RelatedDPSs.includes(lDPSPuri)) {
                            dbc.RelatedDPSs.push(lDPSPuri);
                        }
                    });
                    this.filteredDBCs.taxes.push(dbc);
                    break;
                }
                default: {
                    console.log('DBC without proper domain: ', dbc.Name);
                    break;
                }
            }
        });
        this.checkReady();
    }

    public getDBCs(): DigitalBusinessCapability[] {
        return this.DBCs;
    }
    
    public getFilteredDBCs(): {businessAgnostic: DigitalBusinessCapability[], customs: DigitalBusinessCapability[], health: DigitalBusinessCapability[], taxes: DigitalBusinessCapability[]} {
        return this.filteredDBCs;
    }
    
    public parseDPSs(dpsList: DigitalPublicService[]): void {
        dpsList.forEach((lDPS: DigitalPublicService) => {
            let lDPSRelations = this.patch.getDPSRelations(lDPS.Puri);
            lDPSRelations?.dbc.forEach((lDBCPuri: string) => {
                if (!lDPS.RelatedDBCs.includes(lDBCPuri)) {
                    lDPS.RelatedDBCs.push(lDBCPuri);
                }
            });

            lDPSRelations?.abb.forEach((lABBPuri: string) => {
                if (!lDPS.RelatedABBs.includes(lABBPuri)) {
                    lDPS.RelatedABBs.push(lABBPuri);
                }
            })
        })
        this.DPSs = dpsList;
        this.checkReady();
    }

    public getDPSs(): DigitalPublicService[] {
        return this.DPSs;
    }

    public getReady() {
        return this.ready$.asObservable();
    }

    private checkReady() {
        if (this.ABBs && this.DBCs && this.DPSs) {
            this.ready$.next(true);
        }
    }

    public addAdHocRequirements(key: string, abbs: ArchitectureBuildingBlock[]): void {
        const current = this.adHocRequirements.get(key) || [];
        abbs.forEach(abb => {
            if (!abb.View) abb.View = "Other";
            if (!current.find(a => a.Puri === abb.Puri)) {
                current.push(abb);
            }
        });
        this.adHocRequirements.set(key, current);
    }

    public getAdHocRequirements(key: string): ArchitectureBuildingBlock[] {
        return this.adHocRequirements.get(key) || [];
    }

    public getAllAdHocRequirements(): Map<string, ArchitectureBuildingBlock[]> {
        return this.adHocRequirements;
    }

    public clearAdHocRequirements(key?: string): void {
        if (key) {
            this.adHocRequirements.delete(key);
        } else {
            this.adHocRequirements.clear();
        }
    }

    public addAdHocDPSs(key: string, dpsList: DigitalPublicService[]): void {
        const current = this.adHocDPSs.get(key) || [];
        dpsList.forEach(dps => {
            if (!dps.View) dps.View = "Other";
            if (!current.find(d => d.Puri === dps.Puri)) {
                current.push(dps);
            }
        });
        this.adHocDPSs.set(key, current);
    }

    public getAdHocDPSs(key: string): DigitalPublicService[] {
        return this.adHocDPSs.get(key) || [];
    }

    public getAllAdHocDPSs(): Map<string, DigitalPublicService[]> {
        return this.adHocDPSs;
    }

    public clearAdHocDPSs(key?: string): void {
        if (key) {
            this.adHocDPSs.delete(key);
        } else {
            this.adHocDPSs.clear();
        }
    }

    public addAdHocDBCs(key: string, dbcs: DigitalBusinessCapability[]): void {
        const current = this.adHocDBCs.get(key) || [];
        dbcs.forEach(dbc => {
            const adHocDBC = { ...dbc, Policy: "Ad-Hoc" };
            if (!current.find(d => d.Puri === dbc.Puri)) {
                current.push(adHocDBC);
            }
        });
        this.adHocDBCs.set(key, current);
    }

    public setAdHocRequirementsMap(abbsMap: Map<string, ArchitectureBuildingBlock[]>): void {
        this.adHocRequirements = abbsMap;
    }

    public setAdHocDPSsMap(abbsMap: Map<string, DigitalPublicService[]>): void {
        this.adHocDPSs = abbsMap;
    }

    public getAdHocDBCs(key: string): DigitalBusinessCapability[] {
        return this.adHocDBCs.get(key) || [];
    }

    public getAllAdHocDBCs(): Map<string, DigitalBusinessCapability[]> {
        return this.adHocDBCs;
    }

    public clearAdHocDBCs(key?: string): void {
        if (key) {
            this.adHocDBCs.delete(key);
        } else {
            this.adHocDBCs.clear();
        }
    }
}
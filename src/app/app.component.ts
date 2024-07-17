import { Component, OnInit } from '@angular/core';
import { ArchitectureBuildingBlock } from '@shared/classes/ArchitectureBuildingBlock.class';
import { DigitalBusinessCapability } from '@shared/classes/DigitalBusinessCapability.class';
import { DigitalPublicService } from '@shared/classes/DigitalPublicService.class';
import { ResourcesService } from '@shared/services/resources.service';
import { StorageService } from '@shared/services/storage.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {

    sidebarItems = [
        { label: 'Overview and Guidelines', url: 'overview-and-guidelines', iconSvgName: 'eui-home' },
        { label: 'Building and Assessment', url: 'building-and-assessment', iconSvgName: 'eui-ecl-edit' },
        { label: 'Decision Support', url: 'decision-support', iconSvgName: 'eui-chart-bar' }
    ];

    constructor(
        private resourcesService: ResourcesService,
        private storageService: StorageService,
    ) { }

    ngOnInit(): void {
        // this.initializeResources();
        this.initializeTestResources();
    }

    private initializeResources(): void {
        this.resourcesService.getABB().subscribe((data: any[]) => {
            let abbList: ArchitectureBuildingBlock[] = [];
            data.forEach((abb: ArchitectureBuildingBlock) => {
                abbList.push(ArchitectureBuildingBlock.fromJson(abb));
            });

            this.storageService.parseABBs(abbList);
            console.log('Initialized ABBs');
            // console.log(abbList);
        });

        this.resourcesService.getDBC().subscribe((data: any[]) => {
            let dbcList: DigitalBusinessCapability[] = [];
            data.forEach((dbc: DigitalBusinessCapability) => {
                dbcList.push(DigitalBusinessCapability.fromJson(dbc));
            });

            this.storageService.parseDBCs(dbcList);
            console.log('Initialized DBCs');
            // console.log(dbcList);
        });

        this.resourcesService.getDPS().subscribe((data: any[]) => {
            let dpsList: DigitalPublicService[] = [];
            data.forEach((dps: DigitalPublicService) => {
                dpsList.push(DigitalPublicService.fromJson(dps));
            });

            this.storageService.parseDPSs(dpsList);
            console.log('Initialized DPSs');
            // console.log(dpsList);
        });
    }

    private initializeTestResources(): void {
        this.resourcesService.getTestABB().subscribe((lData: any[]) => {
            let lABBList: ArchitectureBuildingBlock[] = [];
            lData.forEach((lABB: any) => {
                lABBList.push(ArchitectureBuildingBlock.fromTestJson(lABB));
            });

            this.storageService.parseABBs(lABBList);
            // console.log(lABBList);
            console.log('Initialized ABBs');
        });

        this.resourcesService.getTestDBC().subscribe((lData: any[]) => {
            let lDBCList: DigitalBusinessCapability[] = [];
            lData.forEach((lDBC: any) => {
                lDBCList.push(DigitalBusinessCapability.fromTestJson(lDBC));
            });

            this.storageService.parseDBCs(lDBCList);
            // console.log(lDBCList);
            console.log('Initialized DBCs');
        });

        this.resourcesService.getTestDPS().subscribe((lData: any[]) => {
            let lDPSList: DigitalPublicService[] = [];
            lData.forEach((lDPS: any) => {
                lDPSList.push(DigitalPublicService.fromTestJson(lDPS));
            });

            this.storageService.parseDPSs(lDPSList);
            // console.log(lDPSList);
            console.log('Initialized DPSs');
        });
    }
}

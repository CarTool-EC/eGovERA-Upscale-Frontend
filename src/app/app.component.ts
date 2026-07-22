import { Component, OnInit } from '@angular/core';
import { ArchitectureBuildingBlock } from '@shared/classes/ArchitectureBuildingBlock.class';
import { DigitalBusinessCapability } from '@shared/classes/DigitalBusinessCapability.class';
import { DigitalPublicService } from '@shared/classes/DigitalPublicService.class';
import { ResourcesService } from '@shared/services/resources.service';
import { StorageService } from '@shared/services/storage.service';
import { forkJoin } from 'rxjs';
import { AppModule } from './app.module';
import { SharedModule } from '@shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: true,
    imports: [SharedModule],
    providers: [provideCharts(withDefaultRegisterables())]
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
        this.initializeResources();
        // this.initializeTestResources();
    }

    private initializeResources(): void {
        forkJoin({
            abbs: this.resourcesService.getABB(),
            dbcs: this.resourcesService.getDBC(),
            dpss: this.resourcesService.getDPS()
        }).subscribe(({ abbs, dbcs, dpss }) => {
            this.storageService.parseABBs(abbs.map(a => ArchitectureBuildingBlock.fromJson(a)));
            console.log("Initialised ABBs")
            this.storageService.parseDBCs(dbcs.map(d => DigitalBusinessCapability.fromJson(d)));
            console.log("Initialised DBCs")
            this.storageService.parseDPSs(dpss.map(d => DigitalPublicService.fromJson(d)));
            console.log("Initialised DPSs")
        });
    }



    private initializeTestResources(): void {
        this.resourcesService.getTestABB().subscribe((lData: any[]) => {
            let lABBList: ArchitectureBuildingBlock[] = [];
            lData.forEach((lABB: any) => {
                lABBList.push(ArchitectureBuildingBlock.fromTestJson(lABB));
            });

            this.storageService.parseABBs(lABBList);
            console.log('Initialized ABBs');
        });

        this.resourcesService.getTestDBC().subscribe((lData: any[]) => {
            let lDBCList: DigitalBusinessCapability[] = [];
            lData.forEach((lDBC: any) => {
                lDBCList.push(DigitalBusinessCapability.fromTestJson(lDBC));
            });

            this.storageService.parseDBCs(lDBCList);
            console.log('Initialized DBCs');
        });

        this.resourcesService.getTestDPS().subscribe((lData: any[]) => {
            let lDPSList: DigitalPublicService[] = [];
            lData.forEach((lDPS: any) => {
                lDPSList.push(DigitalPublicService.fromTestJson(lDPS));
            });

            this.storageService.parseDPSs(lDPSList);
            console.log('Initialized DPSs');
        });
    }
}

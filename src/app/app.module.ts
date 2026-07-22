import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { SharedModule } from '@shared/shared.module';

@NgModule({
    declarations: [
    ],
    imports: [
        AppRoutingModule,
        SharedModule
    ],
    providers: [
        provideCharts(withDefaultRegisterables())
    ],
    bootstrap: [
    ],
})
export class AppModule {}

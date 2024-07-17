import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio'
import { MatSliderModule } from '@angular/material/slider';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';

const MaterialComponents = [
    MatRadioModule,
    MatSliderModule,
    MatTableModule,
    MatInputModule
];

@NgModule({
    declarations: [],
    imports: [CommonModule, MaterialComponents],
    exports: [MaterialComponents]
})
export class MaterialModule { }
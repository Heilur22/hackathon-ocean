import { Component } from '@angular/core';
import { CarteComponent } from './carte/carte';

@Component({
  selector: 'app-root',
  imports: [CarteComponent],
  template: `
    <app-carte></app-carte>
  `
})
export class App {
  title = 'carte-app';
}

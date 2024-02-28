import { Component } from '@angular/core';
import { AppService } from '../../app.service';
import { DexieService } from '../../shared/services/dexie.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
    storeID = `${this.constructor.name}-layout`;
    isOpen = true;
    dexie = new DexieService();
    constructor(private appService: AppService) {
        this.dexie.get(this.storeID).then((result) => {
            if (!result) {
                this.dexie
                    .addSimple(this.storeID, { sidenav: true })
                    .then(() => (this.isOpen = true));
            } else {
                this.isOpen = result.sidenav;
                this.appService.broadcastNavbarState(result.sidenav);
            }
        });
    }

}

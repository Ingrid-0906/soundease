import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
} from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    map,
    startWith,
    switchMap,
} from 'rxjs/operators';
import { GeneralHelper } from '../../../utils/general-helper';

@Component({
    selector: 'app-edit-in-place-autocomplete',
    templateUrl: './edit-in-place-autocomplete.component.html',
    styleUrls: ['./edit-in-place-autocomplete.component.scss'],
})
export class EditInPlaceAutocompleteComponent implements OnChanges {
    @Input() fieldName;
    @Input() model;
    @Input() displayFn = (obj: any) => {
        return obj && obj[this.fieldName] ? obj[this.fieldName] : '';
    };
    @Input() placeholder = '';
    @Input() observable;
    @Input() inputStyle;
    @Output() afterSelected = new EventEmitter<any>();
    @Input() inEdit = false;

    control = new FormControl();
    selectedValue;

    showEditButton = false;

    form = this.fb.group({
        field: [''],
    });
    filtered: Observable<any>;
    options;

    constructor(private fb: FormBuilder) {}

    ngOnChanges() {
        if (this.model) {
            this.control.setValue(this.model);
        }
        this.filtered = this.control.valueChanges.pipe(
            startWith(''),
            debounceTime(300),
            distinctUntilChanged(),
            map((value: any) => {
                if (!value) return '';
                return typeof value === 'string'
                    ? value
                    : value[this.fieldName];
            }),
            switchMap((term) => {
                if (term.trim().length < 3) {
                    return of([]);
                }
                return this.observable(
                    EditInPlaceAutocompleteComponent._normalizeValue(term)
                );
            })
        );

        this.options = GeneralHelper.asyncOptions(
            this.form.get('field'),
            this.observable
        );
    }

    private static _normalizeValue(value: string): string {
        return value.toLowerCase().replace(/\s/g, '');
    }

    submit() {
        console.log('submit');
    }

    selected() {
        if (this.control.value) {
            this.model = { ...this.control.value };
            this.selectedValue = this.control.value;
            this.afterSelected.emit(this.control.value);
        }
        this.toggleEdit();
    }

    toggleEdit() {
        this.inEdit = !this.inEdit;
    }

    setEditButton(value) {
        this.showEditButton = value;
    }
}

import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { formatCpfCnpj, formatPhone } from '../../utils/general-helper';

@Component({
    selector: 'app-edit-in-place',
    templateUrl: './edit-in-place.component.html',
    styleUrls: ['./edit-in-place.component.scss'],
})
export class EditInPlaceComponent implements OnInit, AfterViewInit, OnChanges {
    @Input() type:
        | 'phone'
        | 'list'
        | 'number'
        | 'text'
        | 'select'
        | 'textLink'
        | 'textList'
        | 'date'
        | 'currency'
        | 'chips'
        | 'addNewItem'
        | 'textarea'
        | 'checkbox';
    @Input() showValue: string;
    @Input() itemArray: { index: number; items: string[] } = undefined;
    @Input() dataType = 'string';
    @Input() field: any;
    @Input() sepLine: boolean;
    @Input() fieldName: string;
    @Input() listSeparator = ',';
    @Input() posFix = '';
    @Input() options: any[];
    @Input() width: number;
    @Input() index: number = undefined;
    @Input() allowDeleteEmail = false;
    @Input() formatterField: 'cpf' | 'cnpj';
    @Input() inEdit = false;

    formatPhone = formatPhone;
    formatCpfCnpj = formatCpfCnpj;

    arrayField: string[] | number[];
    backup;
    inEditArray: number;
    maskText: string = null;

    form = this.fb.group({
        field: [''],
    });

    @Output() afterEdit = new EventEmitter();
    @Output() cancelEdit = new EventEmitter();
    formIsOpen: boolean;

    constructor(private fb: FormBuilder) {}

    ngOnInit(): void {
        if (this.formatterField === 'cpf') {
            this.maskText = '000.000.000-00';
        }
        if (this.formatterField === 'cnpj') {
            this.maskText = '00.000.000/0000-00';
        }

        if (this.type === 'checkbox') {
            this.form.get('field').setValue(this.field);
        }

        if (this.type === 'list') {
            if (this.dataType === 'array') {
                this.arrayField = this.field;
            } else {
                this.arrayField = (this.field ?? [])
                    .split(this.listSeparator)
                    .map((str) => str.trim());
            }

            this.backup = this.arrayField;
        } else {
            this.backup = this.field;
        }
    }

    ngAfterViewInit() {
        if (this.inEdit && this.field && this.type === 'textarea') {
            this.form.get('field').setValue(this.field);
        }

        if (this.type === 'select') {
            this.form.get('field').setValue(this.field);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.type === 'select' && changes.field) {
            this.form.get('field').setValue(changes.field.currentValue);
        }
    }

    submitArray() {
        const value = '' + this.form.get('field').value;
        this.arrayField.push(value as never);
        this.afterEdit.emit({
            [this.fieldName]: this.arrayField.join(this.listSeparator),
        });
        this.formIsOpen = false;
        this.inEditArray = null;
    }

    editArray(i) {
        this.inEditArray = i;
        this.form.get('field').setValue(this.arrayField[i]);
    }

    cancelArray() {
        this.inEditArray = null;
    }

    edit() {
        this.inEdit = true;
        this.backup = this.field;
        this.form.get('field').setValue(this.field);
    }

    cancel() {
        this.inEdit = false;
        this.field = this.backup;
        this.cancelEdit.emit(false);
    }

    submit() {
        const value = this.form.get('field').value;

        let objToSend;

        if (this.itemArray) {
            if (this.itemArray.index !== undefined)
                this.itemArray.items[this.itemArray.index] = value;
            else {
                if (!this.itemArray.items?.length) this.itemArray.items = [];
                this.itemArray.items.push(value);
            }
            objToSend = { [this.fieldName]: this.itemArray.items };
        } else {
            objToSend = { [this.fieldName]: value };
        }

        if (this.index !== undefined) {
            objToSend.index = this.index;
        }

        this.inEdit = false;
        this.afterEdit.emit(objToSend);
    }

    submitChip(value) {
        const objToSend = { [this.fieldName]: value };
        this.afterEdit.emit(objToSend);
        this.field = value;
    }

    submitDate() {
        if (!this.form.get('field').value) return;
        const objToSend = {
            [this.fieldName]: new Date(
                this.form.get('field').value
            ).toISOString(),
        };
        this.afterEdit.emit(objToSend);
        this.inEdit = false;
    }

    openForm() {
        this.formIsOpen = !this.formIsOpen;
    }

    copy() {
        navigator.clipboard
            .writeText(this.field)
            .then(() => console.log('copied'))
            .catch((e) => console.log('error on copy', e));
    }

    patchEmail(action: 'add' | 'delete' | 'update') {
        this.inEdit = false;
        const obj = {
            action: action,
            index: this.index,
            value: this.form.get('field').value,
        };

        this.afterEdit.emit(obj);
    }
}

import { Directive, Input, HostListener, ViewChild, ElementRef } from '@angular/core';
import { NG_VALIDATORS, Validator, FormControl } from '@angular/forms';

@Directive({
    selector: '[app-validator][ngModel]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: ValidatorDirective, multi: true }
    ]
})
export class ValidatorDirective implements Validator {
    @Input() element: ValidatorElement<any>;
    @Input() name: string;

    constructor() { }

    validate(c: FormControl) {
        this.element.onChange(this.name);
        if (this.element.isValid(this.name)) {
        return null;
        } else {
        return { name: { valid: false } };
        }
    }

    @HostListener ('keypress', ['$event']) keypress = (event) => {
        this.element.onEvent('keypress', event, this.name);
    }

    @HostListener ('paste', ['$event']) paste = (event) => {
        this.element.onEvent('paste', event, this.name);
    }

    @HostListener ('blur', ['$event']) blur = (event) => {
        this.element.onEvent('blur', event, this.name);
    }

    // @HostListener ('focusout', ['$event']) focusout = (event) => {
    //     this.element.onEvent('focusout', event, this.name);
    // }
}

export class ValidatorElement<T> {
    public value: T;
    public callbackIsValid: ((e: ValidatorElement<any>, name: string) => boolean);
    public callbackOnChange: ((e: ValidatorElement<any>, name: string) => void);
    public callbackOnEvent: ((e: ValidatorElement<any>, name: string, typ: string, event: any) => void);

    constructor (value: T, callbackOnChange?: ((e: ValidatorElement<any>, name: string) => void),
                            callbackIsValid?: ((e: ValidatorElement<any>, name: string) => boolean),
                            callbackOnEvent?: ((e: ValidatorElement<any>, name: string, typ: string, event: any) => void)) {
        this.value = value;
        this.callbackOnChange = callbackOnChange;
        this.callbackIsValid = callbackIsValid;
        this.callbackOnEvent = callbackOnEvent;
    }

    isValid (name?: string): boolean {
        if (this.callbackIsValid) {
            return this.callbackIsValid(this, name);
        } else {
            return true;
        }
    }

    onChange (name?: string): void {
        if (this.callbackOnChange) {
            this.callbackOnChange(this, name);
        }
    }

    onEvent (eventTyp: string, event: any, name?: string): void {
        // console.log('Event ' + eventTyp);
        // console.log(event);
        if (this.callbackOnEvent) {
            this.callbackOnEvent(this, name, eventTyp, event);
            // use event.preventDefault() to suppress event
        }
    }

}

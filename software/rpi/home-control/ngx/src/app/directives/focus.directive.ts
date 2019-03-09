import { Directive, Input, ElementRef, EventEmitter } from '@angular/core';

@Directive({
    selector: '[ngFocus]'
})
export class FocusDirective {

    private focusEmitterSubscription: any;

    @Input('ngFocus')
    set focus(focusEmitter: EventEmitter<boolean>) {
        const self = this;
        if (this.focusEmitterSubscription) {
            this.focusEmitterSubscription.unsubscribe();
        }
        this.focusEmitterSubscription = focusEmitter.subscribe((focus: boolean) => {
            self.setFocus(focus);
        });
  }

    constructor (private element: ElementRef) {
    }

    private setFocus(focus: boolean) {
        // console.log('focus');
        if (focus) {
            this.element.nativeElement.focus();
        } else {
            this.element.nativeElement.blur();
        }
    }
}

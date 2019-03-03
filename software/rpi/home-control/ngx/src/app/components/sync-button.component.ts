// https://fontawesome.com/how-to-use/on-the-web/using-with/angular
// https://ng-bootstrap.github.io/#/components/modal/examples

import { Component, OnInit, Input, ViewChild, ApplicationRef } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { HttpErrorResponse } from '@angular/common/http';

export interface ISyncButtonConfig {
    text?: string;
    icon?: string;
    classes: {
        default: string;
        onBusy?: string;
        onSuccess?: string;
        onError?: string;
    };
    hideSyncIcon?: boolean;
    onSuccessTimeoutMillis?: number;
    onErrorTimeoutMillis?: number;
    handler: {
        onClick?: (config: ISyncButtonConfig) => Promise<void>;
        onCancel?: (config: ISyncButtonConfig) => void;
    };
}

@Component({
    selector: 'app-sync-button',
    template: `
        <button [ngClass]="classes" (click)="onClick()" placement="top" #tooltip="ngbTooltip" ngbTooltip triggers="manual">
            <span *ngIf="!config.hideSyncIcon" style="margin-right:10px">
                <fa-icon [icon]="'sync'" [pulse]="isBusy">{{config.text}}></fa-icon>
            </span>
            <span *ngIf="config.text">{{config.text}}</span>
            <span *ngIf="config.icon">
                <fa-icon [icon]="config.icon"></fa-icon>
            </span>
        </button>`,
})
export class SyncButtonComponent implements OnInit {

    @Input() config: ISyncButtonConfig;
    @ViewChild('tooltip') public tooltip: NgbTooltip;

    public isBusy = false;
    public classes: string;

    private _pending: Promise<void>;
    private _lastError: any;

    constructor (private _applicationRef: ApplicationRef) {

    }

    public ngOnInit () {
        this.classes = this.config.classes.default;
        // console.log(this.tooltip);
    }

    public async onClick () {
        if (!this.isBusy) {
            if (this.config.classes.onBusy) {
                this.classes = this.config.classes.onBusy;
            } else {
                this.classes = this.config.classes.default;
            }
            this.isBusy = true;
            if (this.config.handler.onClick) {
                try {
                    const p = this.config.handler.onClick(this.config);
                    this._pending = p;
                    await p;
                    if (this._pending !== p) {
                        // job already done
                        return;
                    }
                    this._lastError = null;
                    if (this.config.classes.onSuccess) {
                        this.classes = this.config.classes.onSuccess;
                        if (this.config.onSuccessTimeoutMillis > 0) {
                            setTimeout( () => {
                                this.classes = this.config.classes.default;
                            }, this.config.onSuccessTimeoutMillis);
                        }
                    } else {
                        this.classes = this.config.classes.default;
                    }
                } catch (err) {
                    console.log(err);
                    if (err instanceof Error && err.message) {
                        this.tooltip.ngbTooltip = err.message;
                        this.tooltip.open();
                        setTimeout( () => { this.tooltip.close(); }, 2000);
                    } else if (err instanceof HttpErrorResponse) {
                        this.tooltip.ngbTooltip = err.statusText;
                        this.tooltip.open();
                        setTimeout( () => { this.tooltip.close(); }, 2000);
                    }
                    this._lastError = err;
                    if (this.config.classes.onError) {
                        this.classes = this.config.classes.onError;
                        if (this.config.onErrorTimeoutMillis > 0) {
                            setTimeout( () => {
                                this.classes = this.config.classes.default;
                            }, this.config.onErrorTimeoutMillis);
                        }

                    } else {
                        this.classes = this.config.classes.default;
                    }
                } finally {
                    this.isBusy = false;
                    this._pending = null;
                }
            }
        } else {
            if (this.config.handler.onCancel) {
                this.config.handler.onCancel(this.config);
            } else {
                this._lastError = new Error('cancelled');
                if (this.config.classes.onError) {
                    this.classes = this.config.classes.onError;
                } else {
                    this.classes = this.config.classes.default;
                }
                this.isBusy = false;
                this._pending = null;
            }
        }

    }
}

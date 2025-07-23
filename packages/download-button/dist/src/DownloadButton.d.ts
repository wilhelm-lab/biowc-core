import { LitElement } from 'lit';
import { HTMLTemplateResult } from 'lit/development';
import { ExportSvgComponent } from './ExportSvgComponent';
export declare class DownloadButton extends LitElement {
    static styles: import("lit").CSSResult;
    svgComponent: ExportSvgComponent | undefined;
    render(): HTMLTemplateResult;
    private _download;
}

import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { ExportButton } from '../src/ExportButton.js';
import '../src/export-button.js';

describe('ExportButton', () => {
  it('passes the a11y audit', async () => {
    const el = await fixture<ExportButton>(html`<export-button></export-button>`);

    await expect(el).shadowDom.to.be.accessible();
  });
});

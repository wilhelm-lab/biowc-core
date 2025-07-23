import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import '../src/download-button.js';
describe('DownloadButton', () => {
    it('passes the a11y audit', async () => {
        const el = await fixture(html `<download-button></download-button>`);
        await expect(el).shadowDom.to.be.accessible();
    });
});
//# sourceMappingURL=download-button.test.js.map
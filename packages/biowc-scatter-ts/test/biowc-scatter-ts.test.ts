// import { html } from 'lit';
// import { fixture, expect } from '@open-wc/testing';
// import { BiowcScatterTs } from '../src/BiowcScatterTs.js';
// import '../src/biowc-scatter-ts.js';
//
// describe('BiowcScatterTs', () => {
//   it('has a default title "Hey there" and counter 5', async () => {
//     const el = await fixture<BiowcScatterTs>(
//       html`<biowc-scatter-ts></biowc-scatter-ts>`
//     );
//
//     expect(el.title).to.equal('Hey there');
//     expect(el.counter).to.equal(5);
//   });
//
//   it('increases the counter on button click', async () => {
//     const el = await fixture<BiowcScatterTs>(
//       html`<biowc-scatter-ts></biowc-scatter-ts>`
//     );
//     el.shadowRoot!.querySelector('button')!.click();
//
//     expect(el.counter).to.equal(6);
//   });
//
//   it('can override the title via attribute', async () => {
//     const el = await fixture<BiowcScatterTs>(
//       html`<biowc-scatter-ts title="attribute title"></biowc-scatter-ts>`
//     );
//
//     expect(el.title).to.equal('attribute title');
//   });
//
//   it('passes the a11y audit', async () => {
//     const el = await fixture<BiowcScatterTs>(
//       html`<biowc-scatter-ts></biowc-scatter-ts>`
//     );
//
//     await expect(el).shadowDom.to.be.accessible();
//   });
// });

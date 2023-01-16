import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { BiowcHistogram } from '../src/BiowcHistogram.js';
import '../src/biowc-histogram.js';

describe('BiowcHistogram', () => {
  it('has a default title "Hey there" and counter 5', async () => {
    const el = await fixture<BiowcHistogram>(
      html`<biowc-histogram></biowc-histogram>`
    );

    expect(el.myTitle).to.equal('Hey there');
    expect(el.counter).to.equal(5);
  });

  it('increases the counter on button click', async () => {
    const el = await fixture<BiowcHistogram>(
      html`<biowc-histogram></biowc-histogram>`
    );
    el.shadowRoot!.querySelector('button')!.click();

    expect(el.counter).to.equal(6);
  });

  it('can override the title via attribute', async () => {
    const el = await fixture<BiowcHistogram>(
      html`<biowc-histogram myTitle="attribute title"></biowc-histogram>`
    );

    expect(el.myTitle).to.equal('attribute title');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<BiowcHistogram>(
      html`<biowc-histogram></biowc-histogram>`
    );

    await expect(el).shadowDom.to.be.accessible();
  });
});

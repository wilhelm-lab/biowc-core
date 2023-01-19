import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { BiowcVennplot } from '../src/BiowcVennplot.js';
import '../src/biowc-vennplot.js';

describe('BiowcVennplot', () => {
  it('has a default myTitle "Hey there" and counter 5', async () => {
    const el = await fixture<BiowcVennplot>(
      html`<biowc-vennplot></biowc-vennplot>`
    );

    expect(el.myTitle).to.equal('Hey there');
    expect(el.counter).to.equal(5);
  });

  it('increases the counter on button click', async () => {
    const el = await fixture<BiowcVennplot>(
      html`<biowc-vennplot></biowc-vennplot>`
    );
    el.shadowRoot!.querySelector('button')!.click();

    expect(el.counter).to.equal(6);
  });

  it('can override the myTitle via attribute', async () => {
    const el = await fixture<BiowcVennplot>(
      html`<biowc-vennplot myTitle="attribute myTitle"></biowc-vennplot>`
    );

    expect(el.myTitle).to.equal('attribute myTitle');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<BiowcVennplot>(
      html`<biowc-vennplot></biowc-vennplot>`
    );

    await expect(el).shadowDom.to.be.accessible();
  });
});

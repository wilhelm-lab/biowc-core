import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { BiowcViolinplot } from '../src/BiowcViolinplot.js';
import '../src/biowc-violinplot.js';

describe('BiowcViolinplot', () => {
  it('has a default myTitle "Hey there" and counter 5', async () => {
    const el = await fixture<BiowcViolinplot>(
      html`<biowc-violinplot></biowc-violinplot>`
    );

    expect(el.myTitle).to.equal('Hey there');
    expect(el.counter).to.equal(5);
  });

  it('increases the counter on button click', async () => {
    const el = await fixture<BiowcViolinplot>(
      html`<biowc-violinplot></biowc-violinplot>`
    );
    el.shadowRoot!.querySelector('button')!.click();

    expect(el.counter).to.equal(6);
  });

  it('can override the myTitle via attribute', async () => {
    const el = await fixture<BiowcViolinplot>(
      html`<biowc-violinplot myTitle="attribute myTitle"></biowc-violinplot>`
    );

    expect(el.myTitle).to.equal('attribute myTitle');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<BiowcViolinplot>(
      html`<biowc-violinplot></biowc-violinplot>`
    );

    await expect(el).shadowDom.to.be.accessible();
  });
});

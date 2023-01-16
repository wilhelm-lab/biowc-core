import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { BiowcLineplot } from '../src/BiowcLineplot.js';
import '../src/biowc-lineplot.js';

describe('BiowcLineplot', () => {
  it('has a default mytitle "Hey there" and counter 5', async () => {
    const el = await fixture<BiowcLineplot>(
      html`<biowc-lineplot></biowc-lineplot>`
    );

    expect(el.mytitle).to.equal('Hey there');
    expect(el.counter).to.equal(5);
  });

  it('increases the counter on button click', async () => {
    const el = await fixture<BiowcLineplot>(
      html`<biowc-lineplot></biowc-lineplot>`
    );
    el.shadowRoot!.querySelector('button')!.click();

    expect(el.counter).to.equal(6);
  });

  it('can override the mytitle via attribute', async () => {
    const el = await fixture<BiowcLineplot>(
      html`<biowc-lineplot mytitle="attribute mytitle"></biowc-lineplot>`
    );

    expect(el.mytitle).to.equal('attribute mytitle');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<BiowcLineplot>(
      html`<biowc-lineplot></biowc-lineplot>`
    );

    await expect(el).shadowDom.to.be.accessible();
  });
});

import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { BiowcParallelcoordinates } from '../src/BiowcParallelcoordinates.js';
import '../src/biowc-parallelcoordinates.js';

describe('BiowcParallelcoordinates', () => {
  it('has a default title "Hey there" and counter 5', async () => {
    const el = await fixture<BiowcParallelcoordinates>(
      html`<biowc-parallelcoordinates></biowc-parallelcoordinates>`
    );

    expect(el.mytitle).to.equal('Hey there');
    expect(el.counter).to.equal(5);
  });

  it('increases the counter on button click', async () => {
    const el = await fixture<BiowcParallelcoordinates>(
      html`<biowc-parallelcoordinates></biowc-parallelcoordinates>`
    );
    el.shadowRoot!.querySelector('button')!.click();

    expect(el.counter).to.equal(6);
  });

  it('can override the mytitle via attribute', async () => {
    const el = await fixture<BiowcParallelcoordinates>(
      html`<biowc-parallelcoordinates
        mytitle="attribute title"
      ></biowc-parallelcoordinates>`
    );

    expect(el.mytitle).to.equal('attribute title');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<BiowcParallelcoordinates>(
      html`<biowc-parallelcoordinates></biowc-parallelcoordinates>`
    );

    await expect(el).shadowDom.to.be.accessible();
  });
});

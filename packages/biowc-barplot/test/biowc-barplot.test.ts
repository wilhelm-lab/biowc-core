// import { html } from 'lit';
// import { fixture, expect } from '@open-wc/testing';
import { expect } from '@open-wc/testing';

// import { BiowcBarplot } from '../src/BiowcBarplot.js';
import '../src/biowc-barplot.js';

describe('BiowcBarplot', () => {
  it('can add 1+1', () => {
    expect(1 + 1).to.equal(2);
  });
  /*
  it('has a default title "Hey there" and counter 5', async () => {
    const el = await fixture<BiowcBarplot>(
      html`<biowc-barplot></biowc-barplot>`
    );

    expect(el.title).to.equal('Hey there');
    expect(el.counter).to.equal(5);
  });

  it('increases the counter on button click', async () => {
    const el = await fixture<BiowcBarplot>(
      html`<biowc-barplot></biowc-barplot>`
    );
    el.shadowRoot!.querySelector('button')!.click();

    expect(el.counter).to.equal(6);
  });

  it('can override the title via attribute', async () => {
    const el = await fixture<BiowcBarplot>(
      html`<biowc-barplot title="attribute title"></biowc-barplot>`
    );

    expect(el.title).to.equal('attribute title');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<BiowcBarplot>(
      html`<biowc-barplot></biowc-barplot>`
    );

    await expect(el).shadowDom.to.be.accessible();
  });
  */
});

/* import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { BiowcBarScatterPlot } from '../src/BiowcBarScatterPlot.js';
import '../src/biowc-bar-scatter-plot.js';

describe('BiowcBarScatterPlot', () => {

  it('has a default title "Hey there" and counter 5', async () => {
    const el = await fixture<BiowcBarScatterPlot>(
      html`<biowc-bar-scatter-plot></biowc-bar-scatter-plot>`
    );

    expect(el.title).to.equal('Hey there');
    expect(el.counter).to.equal(5);
  });

  it('can override the title via attribute', async () => {
    const el = await fixture<BiowcBarScatterPlot>(
      html`<biowc-bar-scatter-plot
        title="Combination"
      ></biowc-bar-scatter-plot>`
    );

    expect(el.title).to.equal('Combination');
  });



  /*
  it('increases the counter on button click', async () => {
    const el = await fixture<BiowcBarScatterPlot>(html`<biowc-bar-scatter-plot></biowc-bar-scatter-plot>`);
    el.shadowRoot!.querySelector('button')!.click();

    expect(el.counter).to.equal(6);
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<BiowcBarScatterPlot>(html`<biowc-bar-scatter-plot></biowc-bar-scatter-plot>`);

    await expect(el).shadowDom.to.be.accessible();
  }); */
/* }); */

import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { BiowcViolinplot } from '../src/BiowcViolinplot.js';
import '../src/biowc-violinplot.js';
import ViolinPlotFixture from './fixtures/ViolinPlotFixture.js';

describe('BiowcViolinplot', async () => {
  const violinplot = await fixture<BiowcViolinplot>(
    html` <biowc-violinplot
      .plotLabelValueCatds="${ViolinPlotFixture.violinPlot.plotLabelValueCatds}"
      .chartData="${ViolinPlotFixture.violinPlot.chartData}"
    />`
  );

  it('has a default height 300', async () => {
    const el = await fixture<BiowcViolinplot>(
      html`<biowc-violinplot></biowc-violinplot>`
    );

    expect(el.height).to.equal(300);
  });

  it('can override the height via attribute', async () => {
    const el = await fixture<BiowcViolinplot>(
      html`<biowc-violinplot .height=${500}></biowc-violinplot>`
    );

    expect(el.height).to.equal(500);
  });

  it('contains 3 data entries', () => {
    expect(violinplot.chartData.length).to.equal(3);
  });
});

import { html } from 'lit';
import { fixture, expect, aTimeout } from '@open-wc/testing';
import { BiowcViolinplot } from '../src/BiowcViolinplot.js';
import '../src/biowc-violinplot.js';
import ViolinPlotFixture from './fixtures/ViolinPlotFixture.js';

describe('BiowcViolinplot', async () => {
  const violinplot = await fixture<BiowcViolinplot>(
    html` <biowc-violinplot
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

  // change yAxisLabel
  it('can change Y axis label via attribute', async () => {
    const el = await fixture<BiowcViolinplot>(
      html`<biowc-violinplot
        .yAxisLabel=${'some random label'}
      ></biowc-violinplot>`
    );

    expect(el.yAxisLabel).to.equal('some random label');
  });

  it('contains 3 data entries', () => {
    expect(violinplot.chartData.length).to.equal(3);
  });

  // test if selecting d3 violin triggers a function which returns value
  it('returns information about selected violin plot', async () => {
    const box = violinplot.shadowRoot!.querySelector(`#violin-bbox-0`);
    box?.addEventListener('select-violin', (e: any) =>
      expect(e.detail.sampleName).to.equal(
        ViolinPlotFixture.violinPlot.chartData[0].sampleName
      )
    );
    box!.dispatchEvent(new MouseEvent('click'));
    await aTimeout(500);
  });
});

describe('BiowcViolinplot', async () => {
  const someData = [
    {
      idKey: 99,
      sampleName: 'unknown',
      score: 100,
      data: [
        {
          proteinId: 0,
          geneName: 'unknown_gene',
          value: 5,
        },
      ],
    },
  ];

  const newViolinplot = await fixture<BiowcViolinplot>(
    html` <biowc-violinplot .chartData="${someData}" , />`
  );

  it('can run with custom data', async () => {
    expect(newViolinplot.chartData.length).to.equal(1);
  });
});

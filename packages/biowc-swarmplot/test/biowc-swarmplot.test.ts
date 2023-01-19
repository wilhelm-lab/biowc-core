import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { BiowcSwarmplot } from '../src/BiowcSwarmplot.js';
import SwarmPlotFixture from './fixtures/SwarmPlotFixture.js';

window.customElements.define('biowc-swarmplot', BiowcSwarmplot);

describe('BiowcSwarmplot', async () => {
  const swarmplot = await fixture<BiowcSwarmplot>(
    html`<biowc-swarmplot
      .swarmTitle="${SwarmPlotFixture.swarmPlot.swarmTitle}"
      .fieldName="${SwarmPlotFixture.swarmPlot.fieldName}"
      .fieldValues="${SwarmPlotFixture.swarmPlot.fieldValues}"
      .swarmTitlePrefix="${SwarmPlotFixture.swarmPlot.swarmTitlePrefix}"
      .swarmData="${SwarmPlotFixture.swarmPlot.swarmData}"
      .height="${SwarmPlotFixture.swarmPlot.height}"
      .width="${SwarmPlotFixture.swarmPlot.width}"
    />`
  );

  const emptySwarmPlot = await fixture<BiowcSwarmplot>(
    html`<biowc-swarmplot></biowc-swarmplot>`
  );

  it('has empty x labels by default', async () => {
    const el = await fixture<BiowcSwarmplot>(
      html`<biowc-swarmplot></biowc-swarmplot>`
    );

    expect(el.xLabel).to.equal('');
  });

  it('has empty data array by default', async () => {
    expect(emptySwarmPlot.swarmData.length).to.equal(0);
  });

  it('still renders axis if there is no data', () => {
    const axisPaths = emptySwarmPlot.shadowRoot!.querySelectorAll('.domain');
    // @ts-ignore
    const pathLengths = [...axisPaths].map((path: SVGPathElement) =>
      path.getTotalLength()
    );
    pathLengths.forEach((l: number) => {
      expect(l).to.be.greaterThan(0);
    });
  });

  it('can override the x label via attribute', async () => {
    const el = await fixture<BiowcSwarmplot>(
      html`<biowc-swarmplot .xLabel=${'x label'}></biowc-swarmplot>`
    );

    expect(el.xLabel).to.equal('x label');
  });

  it('can override the x values via attribute', async () => {
    const el = await fixture<BiowcSwarmplot>(
      html`<biowc-swarmplot
        .swarmData=${[{ id: 1, value: 3 }]}
      ></biowc-swarmplot>`
    );

    expect(el.swarmData.length).to.equal(1);
  });

  it('renders 13 circles ', async () => {
    const circles = swarmplot.shadowRoot!.querySelectorAll('circle');
    expect(circles.length).to.equal(12);
  });

  it('renders an invisible tooltip at first', async () => {
    const tooltip = swarmplot.shadowRoot!.querySelector(
      '.tooltip'
    ) as HTMLElement;
    expect(tooltip!.style.opacity).to.equal('0');
  });

  it('sets the opacity of the tooltip to 0.9 when user hovers over it', async () => {
    const circle = swarmplot.shadowRoot!.querySelector('circle');
    circle!.dispatchEvent(new MouseEvent('mousemove'));
    // await aTimeout(250);
    const tooltip = swarmplot.shadowRoot!.querySelector(
      '.tooltip'
    ) as HTMLElement;
    expect(tooltip!.style.opacity).to.equal('0.9');
  });

  it('can override the mytitle via attribute', async () => {
    const el = await fixture<BiowcSwarmplot>(
      html`<biowc-swarmplot mytitle="attribute mytitle"></biowc-swarmplot>`
    );

    expect(el.mytitle).to.equal('attribute mytitle');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<BiowcSwarmplot>(
      html`<biowc-swarmplot></biowc-swarmplot>`
    );

    await expect(el).shadowDom.to.be.accessible();
  });

  it('renders every line with a different color', () => {
    const _htmlDivElement = swarmplot.shadowRoot!.querySelectorAll(
      '#swarmplot'
    )[0] as HTMLDivElement;
    const svg = _htmlDivElement.querySelector('svg') as SVGSVGElement;
    console.log(svg);
    const width = parseInt(svg.getAttribute('width') as string, 10);
    const expected = SwarmPlotFixture.swarmPlot.width;
    expect(width).to.equal(expected);
  });

  const swarmplotWithNaN = await fixture<BiowcSwarmplot>(
    html`<biowc-swarmplot
      .swarmTitle="${SwarmPlotFixture.swarmPlot.swarmTitle}"
      .fieldName="${SwarmPlotFixture.swarmPlot.fieldName}"
      .fieldValues="${SwarmPlotFixture.swarmPlot.fieldValues}"
      .swarmTitlePrefix="${SwarmPlotFixture.swarmPlot.swarmTitlePrefix}"
      .swarmData=${[
        { 'Z-score': NaN, 'Sample name': 'sample1', colorID: 'grey', sizeR: 3 },
        { 'Z-score': 3.0, 'Sample name': 'sample2', colorID: 'grey', sizeR: 3 },
        { 'Z-score': 2.5, 'Sample name': NaN, colorID: 'grey', sizeR: 3 },
        { 'Z-score': 2.3, 'Sample name': 'sample4', colorID: 'grey', sizeR: 3 },
        { 'Z-score': 2.3, 'Sample name': 'sample5', colorID: 'grey', sizeR: 3 },
        { 'Z-score': 2.2, 'Sample name': 'sample6', colorID: 'grey', sizeR: 3 },
        { 'Z-score': 2.1, 'Sample name': 'sample7', colorID: NaN, sizeR: 3 },
        { 'Z-score': 1.9, 'Sample name': 'sample8', colorID: 'grey', sizeR: 3 },
        { 'Z-score': 1.8, 'Sample name': 'sample9', colorID: 'grey', sizeR: 3 },
        {
          'Z-score': 0.5,
          'Sample name': 'sample10',
          colorID: 'grey',
          sizeR: 3,
        },
        {
          'Z-score': 1.9,
          'Sample name': 'sample11',
          colorID: 'grey',
          sizeR: 3,
        },
        {
          'Z-score': NaN,
          'Sample name': 'sample12',
          colorID: 'grey',
          sizeR: 3,
        },
        {
          'Z-score': 0.5,
          'Sample name': 'sample13',
          colorID: 'grey',
          sizeR: NaN,
        },
      ]}
      .height="${SwarmPlotFixture.swarmPlot.height}"
      .width="${SwarmPlotFixture.swarmPlot.width}"
    />`
  );

  it('renders 13 - 3 circles if having NaNs ', async () => {
    const circles = swarmplotWithNaN.shadowRoot!.querySelectorAll('circle');
    expect(circles.length).to.equal(10);
  });
});

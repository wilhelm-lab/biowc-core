import { html } from 'lit';
import { fixture, expect, aTimeout } from '@open-wc/testing';
import { BiowcScatter } from '../src/BiowcScatter.js';
import ScatterPlotFixture from './fixtures/ScatterPlotFixture.js';

window.customElements.define('biowc-scatter', BiowcScatter);

describe('BiowcScatter', async () => {
  const scatterplot = await fixture<BiowcScatter>(
    html` <biowc-scatter
      .idKey="${ScatterPlotFixture.scatterPlot.idKey}"
      .valueKey="${ScatterPlotFixture.scatterPlot.valueKey}"
      .xLabel="${ScatterPlotFixture.scatterPlot.xLabel}"
      .yLabel="${ScatterPlotFixture.scatterPlot.yLabel}"
      .xValues="${ScatterPlotFixture.scatterPlot.xValues}"
      .yValues="${ScatterPlotFixture.scatterPlot.yValues}"
    />`
  );

  it('has empty x and y labels by default', async () => {
    const el = await fixture<BiowcScatter>(
      html`<biowc-scatter></biowc-scatter>`
    );

    expect(el.xLabel).to.equal('');
    expect(el.yLabel).to.equal('');
  });

  it('has empty x and y values by default', async () => {
    const el = await fixture<BiowcScatter>(
      html`<biowc-scatter></biowc-scatter>`
    );

    expect(el.xValues.length).to.equal(0);
    expect(el.yValues.length).to.equal(0);
  });

  it('can override the x and y labels via attribute', async () => {
    const el = await fixture<BiowcScatter>(
      html`<biowc-scatter
        .xLabel=${'x label'}
        .yLabel=${'y label'}
      ></biowc-scatter>`
    );

    expect(el.xLabel).to.equal('x label');
    expect(el.yLabel).to.equal('y label');
  });

  it('can override the x and y values via attribute', async () => {
    const el = await fixture<BiowcScatter>(
      html`<biowc-scatter
        .xValues=${[{ id: 1, value: 3 }]}
        .yValues=${[{ id: 1, value: 1 }]}
      ></biowc-scatter>`
    );

    expect(el.xValues.length).to.equal(1);
    expect(el.yValues.length).to.equal(1);
  });

  it('can find values in common', async () => {
    const el = await fixture<BiowcScatter>(
      html`<biowc-scatter
        .xValues=${[{ id: 1, value: 3 }]}
        .yValues=${[{ id: 1, value: 1 }]}
      ></biowc-scatter>`
    );

    expect(el.valuesInCommon.length).to.equal(1);
  });

  it('reports non-overlap if keys do not match', async () => {
    const el = await fixture<BiowcScatter>(
      html`<biowc-scatter
        .xValues=${[{ id: 1, value: 3 }]}
        .yValues=${[{ id: 2, value: 1 }]}
      ></biowc-scatter>`
    );

    expect(el.valuesInCommon.length).to.equal(0);
  });

  it('renders 4 circles and 1 line', async () => {
    const circles = scatterplot.shadowRoot!.querySelectorAll('circle');
    expect(circles.length).to.equal(4);
    const lines = scatterplot.shadowRoot!.querySelectorAll('.regression-line');
    expect(lines.length).to.equal(1);
  });

  it('renders an invisible tooltip at first', async () => {
    const tooltip = scatterplot.shadowRoot!.querySelector(
      '.tooltip'
    ) as HTMLElement;
    expect(tooltip!.style.opacity).to.equal('0');
  });

  it('sets the opacity of the tooltip to 0.9 when user hovers over it', async () => {
    const circle = scatterplot.shadowRoot!.querySelector('circle');
    circle!.dispatchEvent(new MouseEvent('mousemove'));
    await aTimeout(250);
    const tooltip = scatterplot.shadowRoot!.querySelector(
      '.tooltip'
    ) as HTMLElement;
    expect(tooltip!.style.opacity).to.equal('0.9');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture(html`<biowc-scatter></biowc-scatter>`);
    await expect(el).shadowDom.to.be.accessible();
  });
});

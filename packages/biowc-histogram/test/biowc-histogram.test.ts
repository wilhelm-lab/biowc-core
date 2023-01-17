import { html } from 'lit';
import { fixture, expect, aTimeout } from '@open-wc/testing';
import { BiowcHistogram } from '../src/BiowcHistogram.js';
import HistogramFixture from './fixtures/HistogramFixture.js';

window.customElements.define('biowc-histogram', BiowcHistogram);

describe('BiowcHistogram', async () => {
  const histogram = await fixture<BiowcHistogram>(
    html` <biowc-histogram
      .idKey="${HistogramFixture.histogram.idKey}"
      .valueKey="${HistogramFixture.histogram.valueKey}"
      .xLabel="${HistogramFixture.histogram.xLabel}"
      .yLabel="${HistogramFixture.histogram.yLabel}"
      .xValues="${HistogramFixture.histogram.xValues}"
    />`
  );

  it('has empty x and y labels by default', async () => {
    const el = await fixture<BiowcHistogram>(
      html`<biowc-histogram></biowc-histogram>`
    );

    expect(el.xLabel).to.equal('');
    expect(el.yLabel).to.equal('');
  });

  it('has empty x values by default', async () => {
    const el = await fixture<BiowcHistogram>(
      html`<biowc-histogram></biowc-histogram>`
    );

    expect(el.xValues.length).to.equal(0);
  });

  it('can override the x and y labels via attribute', async () => {
    const el = await fixture<BiowcHistogram>(
      html`<biowc-histogram
        .xLabel=${'x label'}
        .yLabel=${'y label'}
      ></biowc-histogram>`
    );

    expect(el.xLabel).to.equal('x label');
    expect(el.yLabel).to.equal('y label');
  });

  it('can override the x values via attribute', async () => {
    const el = await fixture<BiowcHistogram>(
      html`<biowc-histogram
        .xValues=${[{ id: 1, value: 3 }]}
      ></biowc-histogram>`
    );

    expect(el.xValues.length).to.equal(1);
  });

  it('has 25 bins by default', async () => {
    const el = await fixture<BiowcHistogram>(
      html`<biowc-histogram></biowc-histogram>`
    );

    expect(el.numBins).to.equal(25);
    // expect(el.bins.length).to.equal(25);
  });

  it('can override the number of bins via attribute', async () => {
    const el = await fixture<BiowcHistogram>(
      html`<biowc-histogram .numBins=${30}></biowc-histogram>`
    );

    expect(el.numBins).to.equal(30);
    // expect(el.bins.length).to.equal(30);
  });

  it('has 3 bars higher than 0', async () => {
    const bars = histogram.shadowRoot!.querySelectorAll('rect');
    const visibleBars = Array.from(bars).filter(
      rect => rect.height.baseVal.value > 0
    );
    expect(visibleBars.length).to.equal(3);
  });

  it('has max bar height double the height of the min bar height higher than 0', async () => {
    const bars = histogram.shadowRoot!.querySelectorAll('rect');
    const visibleBars = Array.from(bars).filter(
      rect => rect.height.baseVal.value > 0
    );
    const valueBars = visibleBars.map(rect => rect.height.baseVal.value);
    const maxBars = Math.max(...valueBars);
    const minBars = Math.min(...valueBars);
    const ratioBars = maxBars / minBars;
    expect(ratioBars).to.be.closeTo(2, 0.001);
  });

  it('renders an invisible tooltip at first', async () => {
    const tooltip = histogram.shadowRoot!.querySelector(
      '.tooltip'
    ) as HTMLElement;
    expect(tooltip!.style.opacity).to.equal('0');
  });

  it('sets the opacity of the tooltip to 0.9 when user hovers over it', async () => {
    const rect = histogram.shadowRoot!.querySelector('rect');
    rect!.dispatchEvent(new MouseEvent('mousemove'));
    await aTimeout(250);
    const tooltip = histogram.shadowRoot!.querySelector(
      '.tooltip'
    ) as HTMLElement;
    expect(tooltip!.style.opacity).to.equal('0.9');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture(html`<biowc-histogram></biowc-histogram>`);
    await expect(el).shadowDom.to.be.accessible();
  });
});

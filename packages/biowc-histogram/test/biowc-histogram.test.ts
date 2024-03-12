import { html } from 'lit';
import { fixture, expect, aTimeout } from '@open-wc/testing';
import { BiowcHistogram } from '../src/BiowcHistogram.js';
import HistogramFixture from './fixtures/HistogramFixture.js';
// import * as d3v6 from 'd3'; // this will be used for brush-zoom test

window.customElements.define('biowc-histogram', BiowcHistogram);

// TODO: replace with checks on actual HTML elements instead of JS variables.
describe('Default Component', () => {
  let el: BiowcHistogram;

  beforeEach(async () => {
    el = await fixture<BiowcHistogram>(
      html` <biowc-histogram></biowc-histogram> `
    );
  });

  it('has empty x and y labels', async () => {
    expect(el.xLabel).to.equal('');
    expect(el.yLabel).to.equal('');
  });

  it('has empty x values', async () => {
    expect(el.xValues.length).to.equal(0);
  });

  it('has width 460 and height 400', async () => {
    expect(el.height).to.equal(400);
    expect(el.width).to.equal(460);
  });

  it('has 25 bins by default', async () => {
    expect(el.numBins).to.equal(25);
    // expect(el.bins.length).to.equal(25);
  });

  it('passes the a11y audit', async () => {
    await expect(el).shadowDom.to.be.accessible();
  });
});

describe('Custom labels', () => {
  let el: BiowcHistogram;

  beforeEach(async () => {
    el = await fixture<BiowcHistogram>(
      html`<biowc-histogram
        .xLabel="${HistogramFixture.histogram.xLabel}"
        .yLabel="${HistogramFixture.histogram.yLabel}"
      ></biowc-histogram>`
    );
  });

  it('can override the x and y labels via attribute', async () => {
    expect(el.xLabel).to.equal('abundance Gene_X');
    expect(el.yLabel).to.equal('counts');
  });

  it('passes the a11y audit', async () => {
    await expect(el).shadowDom.to.be.accessible();
  });
});

describe('Custom labels', () => {
  let el: BiowcHistogram;

  beforeEach(async () => {
    el = await fixture<BiowcHistogram>(
      html`<biowc-histogram
        .xLabel="${HistogramFixture.histogram.xLabel}"
        .yLabel="${HistogramFixture.histogram.yLabel}"
      ></biowc-histogram>`
    );
  });

  it('can override the x and y labels via attribute', async () => {
    expect(el.xLabel).to.equal('abundance Gene_X');
    expect(el.yLabel).to.equal('counts');
  });

  it('passes the a11y audit', async () => {
    await expect(el).shadowDom.to.be.accessible();
  });
});

describe('Custom size', () => {
  let el: BiowcHistogram;

  beforeEach(async () => {
    el = await fixture<BiowcHistogram>(
      html`<biowc-histogram .height=${200} .width=${300}></biowc-histogram>`
    );
  });

  it('can override height and width via attribute', async () => {
    expect(el.height).to.equal(200);
    expect(el.width).to.equal(300);
  });

  it('passes the a11y audit', async () => {
    await expect(el).shadowDom.to.be.accessible();
  });
});

describe('Custom bar color', () => {
  let el: BiowcHistogram;

  beforeEach(async () => {
    el = await fixture<BiowcHistogram>(
      html`<biowc-histogram .barColor="${'#bd282c'}"></biowc-histogram>`
    );
  });

  it('can override bar colors', async () => {
    expect(el.barColor).to.equal('#bd282c');
  });

  it('passes the a11y audit', async () => {
    await expect(el).shadowDom.to.be.accessible();
  });
});

describe('Custom data', () => {
  let el: BiowcHistogram;

  beforeEach(async () => {
    el = await fixture<BiowcHistogram>(
      html`<biowc-histogram
        .xValues=${[{ id: 1, value: 3 }]}
      ></biowc-histogram>`
    );
  });

  it('can override the x values via attribute', async () => {
    expect(el.xValues.length).to.equal(1);
  });

  it('passes the a11y audit', async () => {
    await expect(el).shadowDom.to.be.accessible();
  });
});

describe('Custom number of bins', () => {
  let el: BiowcHistogram;

  beforeEach(async () => {
    el = await fixture<BiowcHistogram>(
      html`<biowc-histogram .numBins=${30}></biowc-histogram>`
    );
  });

  it('can override the number of bins via attribute', async () => {
    expect(el.numBins).to.equal(30);
    // expect(el.bins.length).to.equal(30);
  });

  it('passes the a11y audit', async () => {
    await expect(el).shadowDom.to.be.accessible();
  });
});

describe('Demo regular histogram', async () => {
  let el: BiowcHistogram;

  beforeEach(async () => {
    el = await fixture<BiowcHistogram>(
      html` <biowc-histogram
        .idKey="${HistogramFixture.histogram.idKey}"
        .valueKey="${HistogramFixture.histogram.valueKey}"
        .xLabel="${HistogramFixture.histogram.xLabel}"
        .yLabel="${HistogramFixture.histogram.yLabel}"
        .xValues="${HistogramFixture.histogram.xValues}"
      />`
    );
  });

  it('has 3 bars higher than 0', async () => {
    const bars =
      el.shadowRoot!.querySelectorAll<SVGRectElement>('rect.histogramBar');
    const visibleBars = Array.from(bars).filter(
      rect => rect.height.baseVal.value > 0
    );
    expect(visibleBars.length).to.equal(3);
  });

  it('has max bar height double the height of the min bar height higher than 0', async () => {
    const bars =
      el.shadowRoot!.querySelectorAll<SVGRectElement>('rect.histogramBar');
    const visibleBars = Array.from(bars).filter(
      rect => rect.height.baseVal.value > 0
    );
    const valueBars = visibleBars.map(rect => rect.height.baseVal.value);
    const maxBars = Math.max(...valueBars);
    const minBars = Math.min(...valueBars);
    const ratioBars = maxBars / minBars;
    expect(ratioBars).to.be.closeTo(2, 0.001);
  });

  it('does not show a modal warning box if NaN values are absent', async () => {
    const modalboxes = el.shadowRoot!.querySelectorAll('.modalBox');
    expect(modalboxes.length).to.equal(0);
  });

  /*

// CURRENTLY NOT WORKING!
// this test (should) simulates the zoom-in by mouse-brush by a factor of 2 and then checks if the width of a bar doubled.

  it('updates bar width on mousebrush', async () => {
    const brush = histogram.shadowRoot!.querySelector<SVGRectElement>('rect.overlay');
    const initHistogramBarWidth =
      histogram.shadowRoot!.querySelectorAll<SVGRectElement>(
        'rect.histogramBar')[1].width.baseVal.value
    brush!.dispatchEvent(new MouseEvent('mousedown', { screenX: histogram.margin.left, screenY: 100 }));
    brush!.dispatchEvent(new MouseEvent('mousemove', { screenX: 185, screenY: 100 }));
    brush!.dispatchEvent(new MouseEvent('mouseup', { screenX: 185, screenY: 100 }));

    await aTimeout(1250);
    expect(histogram.shadowRoot!.querySelectorAll<SVGRectElement>(
      'rect.histogramBar')[1].width.baseVal.value).to.be.closeTo(2 * initHistogramBarWidth, 0.001);
  });
*/

  it('sets the opacity of the tooltip to 0.9 when user hovers over it', async () => {
    const rect = el.shadowRoot!.querySelector('rect.histogramBar');
    rect!.dispatchEvent(new MouseEvent('mousemove'));
    await aTimeout(250);
    const tooltip = el.shadowRoot!.querySelector('.tooltip') as HTMLElement;
    expect(tooltip!.style.opacity).to.equal('0.9');
  });

  it('passes the a11y audit', async () => {
    await expect(el).shadowDom.to.be.accessible();
  });
});

describe('Demo histogram with NAs', async () => {
  let el: BiowcHistogram;

  beforeEach(async () => {
    el = await fixture<BiowcHistogram>(
      html` <biowc-histogram
        .idKey="${HistogramFixture.naHistogram.idKey}"
        .valueKey="${HistogramFixture.naHistogram.valueKey}"
        .xLabel="${HistogramFixture.naHistogram.xLabel}"
        .yLabel="${HistogramFixture.naHistogram.yLabel}"
        .xValues="${HistogramFixture.naHistogram.xValues}"
      />`
    );
  });

  it('has 2 bars higher than 0 for naHistogram fixture', async () => {
    const bars =
      el.shadowRoot!.querySelectorAll<SVGRectElement>('rect.histogramBar');
    const visibleBars = Array.from(bars).filter(
      rect => rect.height.baseVal.value > 0
    );
    expect(visibleBars.length).to.equal(2);
  });

  it('has 3 NaN values for naHistogram fixture', async () => {
    // @ts-ignore
    const extractedValues = el._extractValues() as number[]; // accessing private function: https://stackoverflow.com/questions/35987055/how-to-write-unit-testing-for-angular-typescript-for-private-methods-with-jasm
    const nanCount = extractedValues.filter(x => Number.isNaN(x)).length;
    expect(nanCount).to.equal(3);
  });

  it('shows a modal warning box if NaN values are present', async () => {
    const modalbox = el.shadowRoot!.querySelector('.modalBox') as HTMLElement;
    expect(modalbox!.style.opacity).to.equal('0.9');
  });

  it('passes the a11y audit', async () => {
    await expect(el).shadowDom.to.be.accessible();
  });
});

describe('Demo histogram with KDE', async () => {
  let el: BiowcHistogram;

  beforeEach(async () => {
    el = await fixture<BiowcHistogram>(
      html` <biowc-histogram
        .idKey="${HistogramFixture.kdeHistogram.idKey}"
        .valueKey="${HistogramFixture.kdeHistogram.valueKey}"
        .xLabel="${HistogramFixture.kdeHistogram.xLabel}"
        .yLabel="${HistogramFixture.kdeHistogram.yLabel}"
        .xValues="${HistogramFixture.kdeHistogram.xValues}"
        .plotKDE="${HistogramFixture.kdeHistogram.plotKDE}"
      />`
    );
  });

  it('has element path for plotKDE=true', async () => {
    const paths = el.shadowRoot!.querySelectorAll('.kdePath');
    expect(paths.length).to.equal(1);
  });

  it('has kde path that covers the entire x axis range', async () => {
    const path = el.shadowRoot!.querySelector('.kdePath');

    // for some reason this doesn't work:
    // expect(path!.getBoundingClientRect().width).to.equal("370")

    expect(path!.getAttribute('d')!).to.contain('M0,'); // path starts at X=0
    expect(path!.getAttribute('d')!).to.contain('L370,'); // path ends at X=370 (width - margin.left - margin.right)
  });

  it('renders an invisible tooltip at first', async () => {
    const tooltip = el.shadowRoot!.querySelector('.tooltip') as HTMLElement;
    expect(tooltip!.style.opacity).to.equal('0');
  });

  it('passes the a11y audit', async () => {
    await expect(el).shadowDom.to.be.accessible();
  });
});

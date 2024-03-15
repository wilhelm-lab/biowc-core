import { html } from 'lit';
import { fixture, expect, aTimeout } from '@open-wc/testing';
import { BiowcBarplot } from '../src/BiowcBarplot.js';
import '../src/biowc-barplot.js';
import BarPlotFixture from './fixtures/BarPlotFixture.js';

describe('Default', () => {
  it('passes the a11y audit', async () => {
    const el = await fixture<BiowcBarplot>(
      html`<biowc-barplot></biowc-barplot>`
    );

    await expect(el).shadowDom.to.be.accessible();
  });
});

describe('Custom size', () => {
  let el: BiowcBarplot;

  beforeEach(async () => {
    el = await fixture<BiowcBarplot>(
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

describe('Custom data', () => {
  let el: BiowcBarplot;

  beforeEach(async () => {
    el = await fixture<BiowcBarplot>(
      html`<biowc-barplot
        .data="${BarPlotFixture.barPlot.data}"
      ></biowc-barplot>`
    );
  });

  it('has 4 bars higher than 0', async () => {
    const bars = el.shadowRoot!.querySelectorAll<SVGRectElement>('rect.Bar');
    const visibleBars = Array.from(bars).filter(
      rect => rect.height.baseVal.value > 0
    );
    expect(visibleBars.length).to.equal(4);
  });

  it('sets the opacity of the tooltip to 0.9 when user hovers over it and back to 0 when moving away', async () => {
    const rect = el.shadowRoot!.querySelector('rect.ClickBar');
    const tooltip = el.shadowRoot!.querySelector('.tooltip') as HTMLElement;

    rect!.dispatchEvent(new MouseEvent('mouseover'));
    await aTimeout(250);
    expect(tooltip!.style.opacity).to.equal('0.9');

    rect!.dispatchEvent(new MouseEvent('mouseout'));
    await aTimeout(350);
    expect(tooltip!.style.opacity).to.equal('0');
  });

  it('passes the a11y audit', async () => {
    await expect(el).shadowDom.to.be.accessible();
  });
});

describe('Custom labels', () => {
  let el: BiowcBarplot;

  beforeEach(async () => {
    el = await fixture<BiowcBarplot>(
      html`<biowc-barplot
        .yLabel="${BarPlotFixture.barPlot.yLabel}"
      ></biowc-barplot>`
    );
  });

  it('can override the x and y labels via attribute', async () => {
    expect(el.yLabel).to.equal('AUC');
  });

  it('passes the a11y audit', async () => {
    await expect(el).shadowDom.to.be.accessible();
  });
});

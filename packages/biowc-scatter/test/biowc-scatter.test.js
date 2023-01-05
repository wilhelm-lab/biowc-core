import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import '../biowc-scatter.js';

describe('BiowcScatter', () => {
  it('has empty x and y labels by default', async () => {
    const el = await fixture(html`<biowc-scatter></biowc-scatter>`);

    expect(el.xLabel).to.equal('');
    expect(el.yLabel).to.equal('');
  });

  it('has empty x and y values by default', async () => {
    const el = await fixture(html`<biowc-scatter></biowc-scatter>`);

    expect(el.xValues.length).to.equal(0);
    expect(el.yValues.length).to.equal(0);
  });

  it('can override the x and y labels via attribute', async () => {
    const el = await fixture(
      html`<biowc-scatter
        .xLabel=${'x label'}
        .yLabel=${'y label'}
      ></biowc-scatter>`
    );

    expect(el.xLabel).to.equal('x label');
    expect(el.yLabel).to.equal('y label');
  });

  it('can override the x and y values via attribute', async () => {
    const xValues = [{ id: 1, value: 3 }];
    const yValues = [{ id: 1, value: 1 }];
    const el = await fixture(
      html`<biowc-scatter
        .xValues=${xValues}
        .yValues=${yValues}
      ></biowc-scatter>`
    );

    expect(el.xValues.length).to.equal(1);
    expect(el.yValues.length).to.equal(1);
  });

  it('can find values in common', async () => {
    const xValues = [{ id: 1, value: 3 }];
    const yValues = [{ id: 1, value: 1 }];
    const el = await fixture(
      html`<biowc-scatter
        .xValues=${xValues}
        .yValues=${yValues}
      ></biowc-scatter>`
    );

    expect(el.getValuesInCommon().length).to.equal(1);
  });

  it('reports non-overlap if keys do not match', async () => {
    const xValues = [{ id: 1, value: 3 }];
    const yValues = [{ id: 2, value: 1 }];
    const el = await fixture(
      html`<biowc-scatter
        .xValues=${xValues}
        .yValues=${yValues}
      ></biowc-scatter>`
    );

    expect(el.getValuesInCommon().length).to.equal(0);
  });

  it('passes the a11y audit', async () => {
    const el = await fixture(html`<biowc-scatter></biowc-scatter>`);

    await expect(el).shadowDom.to.be.accessible();
  });
});

import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { BiowcLineplot } from '../src/BiowcLineplot.js';
import '../src/biowc-lineplot.js';
import LinePlotFixture from './fixtures/LinePlotFixture.js';

describe('BiowcLineplot', () => {
  it('consists only of 2-dimensional points', () => {
    expect(
      LinePlotFixture.basicLineplot.dataPoints[0]
        .map(elem => elem.length)
        .every(len => len === 2)
    ).to.be.true;
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<BiowcLineplot>(
      html` <biowc-lineplot></biowc-lineplot>`
    );

    await expect(el).shadowDom.to.be.accessible();
  });
});

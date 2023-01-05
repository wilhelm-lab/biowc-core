import { html } from 'lit';
import { fixture, expect, aTimeout } from '@open-wc/testing';
import { BiowcScatterTs } from '../src/BiowcScatterTs.js';
import '../src/biowc-scatter-ts.js';

describe('BiowcScatterTs', async () => {
  const idKey = 'Sample name';
  const valueKey = 'abundance';
  const xLabel = 'abundance Gene_X';
  const xValues = [
    { 'Sample name': 'sample1', abundance: 1 },
    { 'Sample name': 'sample2', abundance: 3 },
    { 'Sample name': 'sample4', abundance: 3 },
    { 'Sample name': 'sample5', abundance: 2 },
  ];
  const yLabel = 'abundance Gene_Y';
  const yValues = [
    { 'Sample name': 'sample1', abundance: 1 },
    { 'Sample name': 'sample2', abundance: 2 },
    { 'Sample name': 'sample4', abundance: 3 },
    { 'Sample name': 'sample5', abundance: -2.5 },
  ];

  const scatterplot = await fixture<BiowcScatterTs>(
    html` <biowc-scatter-ts
      .idKey="${idKey}"
      .valueKey="${valueKey}"
      .xLabel="${xLabel}"
      .yLabel="${yLabel}"
      .xValues="${xValues}"
      .yValues="${yValues}"
    />`
  );

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
});

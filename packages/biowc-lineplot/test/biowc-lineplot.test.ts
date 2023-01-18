import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { BiowcLineplot } from '../src/BiowcLineplot.js';
import '../src/biowc-lineplot.js';
import LinePlotFixture from './fixtures/LinePlotFixture.js';

describe('BiowcLineplot', async () => {
  it('consists only of 2-dimensional points', () => {
    expect(
      LinePlotFixture.basicLineplot.dataPoints[0]
        .map(elem => elem.length)
        .every(len => len === 2)
    ).to.be.true;
  });

  const simpleLineplot = await fixture<BiowcLineplot>(
    html`
      <biowc-lineplot .dataPoints=${LinePlotFixture.basicLineplot.dataPoints} />
    `
  );

  it('renders every line with a different color', () => {
    const connectingLines = simpleLineplot.shadowRoot!.querySelectorAll(
      '.dotconnector'
    ) as NodeList;
    // @ts-ignore
    const colors = [...connectingLines].map(
      connectingLine => connectingLine.style.stroke
    );
    const colorSet = new Set(colors);
    expect(colors.length).to.equal(colorSet.size);
    // TODO: Test with >8 lines
  });

  const emptyLineplot = await fixture<BiowcLineplot>(
    html`<biowc-lineplot
      .dataPoints=${LinePlotFixture.emptyLineplot.dataPoints}
    />`
  );

  it('still renders axes if there is no data', () => {
    const axisPaths = emptyLineplot.shadowRoot!.querySelectorAll('.domain');
    // @ts-ignore
    const pathLengths = [...axisPaths].map((path: SVGPathElement) =>
      path.getTotalLength()
    );
    pathLengths.forEach((l: number) => {
      expect(l).to.be.greaterThan(0);
    });
  });

  it('"renders" a connecting line with length 0 if there is not data', () => {
    expect(
      (<SVGPathElement>(
        emptyLineplot.shadowRoot!.querySelector('.dotconnector')
      )).getTotalLength()
    ).to.equal(0);
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<BiowcLineplot>(
      html` <biowc-lineplot></biowc-lineplot>`
    );

    await expect(el).shadowDom.to.be.accessible();
  });
});

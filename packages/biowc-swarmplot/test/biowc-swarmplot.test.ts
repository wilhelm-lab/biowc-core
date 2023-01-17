import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { BiowcSwarmplot } from '../src/BiowcSwarmplot.js';
// import SwarmPlotFixture from './fixtures/SwarmPlotFixture.js';

window.customElements.define('biowc-swarmplot', BiowcSwarmplot);

describe('BiowcSwarmplot', async () => {
  // const swarmplot = await fixture<BiowcSwarmplot>(
  //   html`<biowc-swarmplot
  //     .idKey="${SwarmPlotFixture.swarmPlot.idKey}"
  //     .valueKey="${SwarmPlotFixture.swarmPlot.valueKey}"
  //     .xLabel="${SwarmPlotFixture.swarmPlot.xLabel}"
  //     .xValues="${SwarmPlotFixture.swarmPlot.xValues}"
  //   />`
  // );

  it('has empty x labels by default', async () => {
    const el = await fixture<BiowcSwarmplot>(
      html`<biowc-swarmplot></biowc-swarmplot>`
    );

    expect(el.xLabel).to.equal('');
  });

  it('has empty x values by default', async () => {
    const el = await fixture<BiowcSwarmplot>(
      html`<biowc-swarmplot></biowc-swarmplot>`
    );

    expect(el.xValues.length).to.equal(0);
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
        .xValues=${[{ id: 1, value: 3 }]}
      ></biowc-swarmplot>`
    );

    expect(el.xValues.length).to.equal(1);
  });

  // it('renders 4 circles ', async () => {
  //   const circles = swarmplot.shadowRoot!.querySelectorAll('circle');
  //   expect(circles.length).to.equal(4);
  // });
  //
  // it('renders an invisible tooltip at first', async () => {
  //   const tooltip = swarmplot.shadowRoot!.querySelector(
  //     '.tooltip'
  //   ) as HTMLElement;
  //   expect(tooltip!.style.opacity).to.equal('0');
  // });
  //
  // it('sets the opacity of the tooltip to 0.9 when user hovers over it', async () => {
  //   const circle = swarmplot.shadowRoot!.querySelector('circle');
  //   circle!.dispatchEvent(new MouseEvent('mousemove'));
  //   await aTimeout(250);
  //   const tooltip = swarmplot.shadowRoot!.querySelector(
  //     '.tooltip'
  //   ) as HTMLElement;
  //   expect(tooltip!.style.opacity).to.equal('0.9');
  // });

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
});

import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { BioWcSwarmplot } from '../src/BioWcSwarmplot.js';
import '../src/biowc-swarmplot.js';

describe('BioWcSwarmplot', () => {
  it('has a default mytitle "Hey there" and counter 5', async () => {
    const el = await fixture<BioWcSwarmplot>(
      html`<biowc-swarmplot></biowc-swarmplot>`
    );

    expect(el.mytitle).to.equal('Hey there');
    expect(el.counter).to.equal(5);
  });

  it('increases the counter on button click', async () => {
    const el = await fixture<BioWcSwarmplot>(
      html`<biowc-swarmplot></biowc-swarmplot>`
    );
    el.shadowRoot!.querySelector('button')!.click();

    expect(el.counter).to.equal(6);
  });

  it('can override the mytitle via attribute', async () => {
    const el = await fixture<BioWcSwarmplot>(
      html`<biowc-swarmplot mytitle="attribute mytitle"></biowc-swarmplot>`
    );

    expect(el.mytitle).to.equal('attribute mytitle');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<BioWcSwarmplot>(
      html`<biowc-swarmplot></biowc-swarmplot>`
    );

    await expect(el).shadowDom.to.be.accessible();
  });
});

import { css } from 'lit';

export default css`
  :host {
    display: block;
    color: var(--biowc-scatter-text-color, #000);
  }

  #lineplot {
    display: flex;
  }

  .tooltip {
    position: absolute;
    font-size: 12px;
    width: auto;
    height: auto;
    pointer-events: none;
    background-color: white;
  }
`;

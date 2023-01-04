import { css } from 'lit';

export default css`
  :host {
    display: block;
    padding: 25px;
    color: var(--biowc-scatter-ts-text-color, #000);
  }

  .tooltip {
    position: absolute;
    font-size: 13px;
    width: auto;
    height: auto;
    pointer-events: none;
    background-color: white;
  }
`;

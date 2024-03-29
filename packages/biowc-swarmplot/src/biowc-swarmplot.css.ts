import { css } from 'lit';

export default css`
  :host {
    display: block;
    padding: 25px;
    color: var(--biowc-swarmplot-text-color, #000);
  }

  #swarmplot {
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

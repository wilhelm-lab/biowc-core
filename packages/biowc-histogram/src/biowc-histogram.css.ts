import { css } from 'lit';

export default css`
  :host {
    display: block;
    padding: 25px;
    color: var(--biowc-histogram-text-color, #000);
  }

  #histogram {
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

  .modalBox {
    position: absolute;
    font-size: 12px;
    width: auto;
    height: auto;
    pointer-events: none;
    background-color: white;
  }
`;

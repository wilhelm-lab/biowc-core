import { css } from 'lit';

export default css`
  :host {
    display: block;
    padding: 25px;
    color: var(--biowc-scatter-text-color, #000);
  }

  #scatterplot {
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

  .btn {
    margin-left: 25px;
    height: 25px;
    background-color: #207cb9;
    border: none;
    color: white;
    padding: 3px 7px;
    cursor: pointer;
    font-size: 12px;
    border-radius: 6px;
  }

  .btn:hover {
    background-color: #175a81;
  }
`;

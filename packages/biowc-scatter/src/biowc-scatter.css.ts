import { css } from 'lit';

export default css`
  :host {
    display: block;
    color: var(--biowc-scatter-text-color, #000);
  }

  #container {
    display: flex;
  }

  #scatterplot {
    flex: 1;
    flex-grow: 0;
  }

  .tooltip {
    position: absolute;
    font-size: 12px;
    width: auto;
    height: auto;
    pointer-events: none;
    background-color: white;
  }

  .legend-horizontal {
    flex-direction: row; /* Legend beside plot */
    align-items: start;
  }
  .legend-vertical {
    flex-direction: column; /* Legend below plot */
    align-items: flex-start;
  }
  .legend-container {
    flex-shrink: 0; /* Prevent legend from resizing */
  }
`;

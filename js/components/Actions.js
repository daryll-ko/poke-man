const Actions = `
  <div class="controls border-primary">
    <h2 class="info-heading">Controls</h2>
    <div class="movement-panel space-top">
      <div class="blank"></div>
      <div id="up" class="up border-primary">
        ↑W
      </div>
      <div class="blank"></div>
      <div id="left" class="left border-primary">
        ←A
      </div>
      <div id="down" class="down border-primary">
        S↓
      </div>
      <div id="right" class="right border-primary">
        D→
      </div>
    </div>
    <div id="button-time" class="button button-time space-top color-internal">
      Pause | E
    </div>
    <div id="button-reset" class="button space-top color-internal">
      New Game | F
    </div>
  </div>
  <div class="action border-primary">
    <div
      id="action-element"
      class="action-element border-primary color-internal"
    >
      Press any movement key to start!
    </div>
  </div>
`;

export default Actions;

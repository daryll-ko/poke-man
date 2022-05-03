const Main = `
  <main>
    <div class="container container-main">
      <div id="grid" class="grid"></div>
      <div class="info">
        <div class="progress border-primary">
          <h2 class="info-heading">Progress</h2>
          <div
            id="progress-bar"
            class="progress-bar border-primary space-top color-internal padded"
          ></div>
        </div>
        <div class="controls border-primary">
          <h2 class="info-heading">Controls</h2>
          <div class="movement-panel space-top">
            <div class="blank"></div>
            <div id="up" class="up border-primary">↑W</div>
            <div class="blank"></div>
            <div id="left" class="left border-primary">←A</div>
            <div id="down" class="down border-primary">S↓</div>
            <div id="right" class="right border-primary">D→</div>
          </div>
          <div
            id="button-time"
            class="button button-time space-top color-internal"
          >
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
        <div class="guide border-primary">
          <h2 class="info-heading">Guide</h2>
          <div
            id="players-pokeman"
            class="players-pokeman border-primary space-top color-internal padded"
          ></div>
          <div
            id="players-chasers"
            class="players-chasers border-primary space-top color-internal padded"
          ></div>
          <div class="berries">
            <div
              class="berry-row berries-normal border-primary space-top color-internal padded"
            >
              <div class="berry-guide berry-razz"></div>
              <div class="berry-guide berry-pinap"></div>
              <div class="berry-guide berry-nanab"></div>
              <p class="berry-score">1</p>
            </div>
            <div
              class="berry-row berries-silver border-primary space-top color-internal padded"
            >
              <div class="berry-guide berry-razz-silver"></div>
              <div class="berry-guide berry-pinap-silver"></div>
              <div class="berry-guide berry-nanab-silver"></div>
              <p class="berry-score">3</p>
            </div>
            <div
              class="berry-row berries-golden border-primary space-top color-internal padded"
            >
              <div class="berry-guide berry-razz-golden"></div>
              <div class="berry-guide berry-pinap-golden"></div>
              <div class="berry-guide berry-nanab-golden"></div>
              <p class="berry-score">5</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
`;

export default Main;

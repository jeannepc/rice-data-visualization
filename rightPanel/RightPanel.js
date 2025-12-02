export class RightPanel {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  // Loads a page component object (see below)
  load(page, context) {
    this.container.innerHTML = "";     // clear old page
    page.render(this.container, context);
  }
}
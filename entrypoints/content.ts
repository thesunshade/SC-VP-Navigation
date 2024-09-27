export default defineContentScript({
  matches: ["*://suttacentral.net/*"],
  main() {
    console.log("Active on SuttaCentral.net");

    // Helper function to inject CSS into the Shadow DOM
    function injectShadowStyles(shadowRoot: ShadowRoot) {
      const style = document.createElement("style");
      style.textContent = `
        #vpHamburger {
          padding: 10px;
        }
        /* Add more styles here */
      `;
      shadowRoot.appendChild(style);
    }

    // Helper function to traverse shadow DOM
    function queryShadowRoot(selector: string, shadowHost: Element): Element | null {
      const shadowRoot = shadowHost.shadowRoot as ShadowRoot; // Type assertion
      return shadowRoot ? shadowRoot.querySelector(selector) : null;
    }

    // Define the shadow host selector
    const shadowHostSelector = "#breadCrumb";

    // Use MutationObserver to detect changes in the DOM
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      const shadowHost = document.querySelector(shadowHostSelector) as Element; // Type assertion
      if (shadowHost) {
        const topBarHomeLink = queryShadowRoot(".top-bar-home-link", shadowHost);

        if (topBarHomeLink && !document.querySelector("#vpHamburger")) {
          // Create a new div element
          const vpHamburger = document.createElement("div");
          vpHamburger.id = "vpHamburger";
          vpHamburger.innerHTML = `
  <svg width="15" height="15" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
    <rect width="30" height="4" rx="2" fill="white" />
    <rect y="13" width="30" height="4" rx="2" fill="white" />
    <rect y="26" width="30" height="4" rx="2" fill="white" />
  </svg>
`;

          // Inject styles into the shadow DOM
          injectShadowStyles(shadowHost.shadowRoot as ShadowRoot);

          // Insert the new div after the 'top-bar-home-link' div
          topBarHomeLink.insertAdjacentElement("afterbegin", vpHamburger);
          observer.disconnect();
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  },
});

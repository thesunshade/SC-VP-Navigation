import { NavigationMenu } from "@/components/navigationMenu";

export default defineContentScript({
  matches: ["*://suttacentral.net/*"],
  main() {
    console.log("Active on SuttaCentral.net");

    // Helper function to inject CSS into the Shadow DOM
    function injectShadowStyles(shadowRoot: ShadowRoot) {
      console.log("Injecting styles into shadow DOM...");
      const style = document.createElement("style");
      style.textContent = `
        #vpHamburger {
          padding-left: 5px;
          cursor: pointer;
        }
        #vpNavigationMenu {
          display: none;
          position: absolute;
          background-color: white;
          box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
          padding: 10px;
          z-index: 1000;
          width: 250px;
          border: 1px solid #ccc; /* Add border for visibility */
          /* Reset styles */
          margin: 0;
          list-style: none; /* Reset list styles */
        }
      `;
      shadowRoot.appendChild(style);
    }

    // Helper function to traverse shadow DOM
    function queryShadowRoot(selector: string, shadowHost: Element): Element | null {
      console.log(`Querying shadow DOM for selector: ${selector}`);
      const shadowRoot = shadowHost.shadowRoot as ShadowRoot; // Type assertion
      return shadowRoot ? shadowRoot.querySelector(selector) : null;
    }

    // Define the shadow host selector
    const shadowHostSelector = "#breadCrumb";

    // Use MutationObserver to detect changes in the DOM
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      console.log("Mutation observed...");
      const shadowHost = document.querySelector(shadowHostSelector) as Element; // Type assertion

      if (shadowHost) {
        console.log("Shadow host found:", shadowHost);

        const topBarHomeLink = queryShadowRoot(".top-bar-home-link", shadowHost);

        if (topBarHomeLink && !document.querySelector("#vpHamburger")) {
          console.log("Top bar home link found and hamburger icon doesn't exist yet.");

          // Create a new div element for the hamburger icon
          const vpHamburger = document.createElement("div");
          vpHamburger.id = "vpHamburger";
          vpHamburger.innerHTML = `
            <svg width="15" height="15" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
              <rect width="30" height="4" rx="2" fill="white" />
              <rect y="13" width="30" height="4" rx="2" fill="white" />
              <rect y="26" width="30" height="4" rx="2" fill="white" />
            </svg>
          `;
          console.log("Hamburger icon created.");

          // Inject styles into the shadow DOM
          injectShadowStyles(shadowHost.shadowRoot as ShadowRoot);

          // Insert the hamburger icon into the DOM
          topBarHomeLink.insertAdjacentElement("afterbegin", vpHamburger);
          console.log("Hamburger icon inserted into the DOM.");

          // Create a shadow root for the navigation menu
          const menuContainer = document.createElement("div");
          const shadowRoot = menuContainer.attachShadow({ mode: "open" });

          // Create the navigation menu container with shadow root
          const vpNavigationMenu = document.createElement("div");
          vpNavigationMenu.id = "vpNavigationMenu";
          vpNavigationMenu.innerHTML = NavigationMenu();
          injectShadowStyles(shadowRoot); // Inject styles into the shadow root

          shadowRoot.appendChild(vpNavigationMenu); // Append menu to shadow root

          // Insert the menu container immediately after the hamburger icon
          vpHamburger.insertAdjacentElement("afterend", menuContainer);
          console.log("Navigation menu added to the page.");

          // Toggle navigation menu visibility on click
          vpHamburger.addEventListener("click", () => {
            console.log("Hamburger icon clicked.");
            const navMenu = shadowRoot.querySelector("#vpNavigationMenu") as HTMLElement;
            if (navMenu) {
              // Calculate the position of the hamburger icon and set the menu position
              const rect = vpHamburger.getBoundingClientRect();
              navMenu.style.top = `${rect.bottom}px`; // Place the menu right below the hamburger icon
              navMenu.style.left = `0px`; // Align the menu to the left side of the page

              // Toggle visibility
              navMenu.style.display = navMenu.style.display === "block" ? "none" : "block";
              console.log(`Toggled navigation menu visibility: ${navMenu.style.display}`);
            } else {
              console.log("Navigation menu not found.");
            }
          });

          // Add event listener to close the menu when clicking a link
          const links = shadowRoot.querySelectorAll("#vpNavigationMenu a");
          links.forEach(link => {
            link.addEventListener("click", () => {
              const navMenu = shadowRoot.querySelector("#vpNavigationMenu") as HTMLElement;
              if (navMenu) {
                navMenu.style.display = "none"; // Close the menu
                console.log("Navigation menu closed after clicking a link.");
              }
            });
          });

          // Add event listener to close the menu on page scroll
          window.addEventListener("scroll", () => {
            const navMenu = shadowRoot.querySelector("#vpNavigationMenu") as HTMLElement;
            if (navMenu && navMenu.style.display === "block") {
              navMenu.style.display = "none"; // Close the menu
              console.log("Navigation menu closed due to page scroll.");
            }
          });

          observer.disconnect();
        } else {
          console.log("Top bar home link not found or hamburger icon already exists.");
        }
      } else {
        console.log("Shadow host not found.");
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  },
});

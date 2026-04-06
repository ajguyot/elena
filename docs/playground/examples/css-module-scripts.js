export default {
  id: "css-module-scripts",
  title: "CSS Module Scripts",
  js: `import { Elena, html } from "@elenajs/core";
import styles from "./styles.css" with { type: "css" };

/**
 * Webring Embed
 *
 * @displayName Webring Embed
 * @status stable
 */
class WebringEmbed extends Elena(HTMLElement) {
  static tagName = "webring-embed";
  static props = ["url", "title", "logo", "count"];
  static shadow = "open";
  static styles = styles;

  /**
   * Base URL of the webring.
   *
   * @property
   * @type {string}
   */
  url = "";

  /**
   * Title of the webring.
   *
   * @property
   * @type {string}
   */
  title = "My Webring";

  /**
   * File path of the webring logo.
   *
   * @property
   * @type {string}
   */
  logo = "/assets/images/logo.svg";

  /**
   * Member count of the webring.
   * Reads from the webring API.
   *
   * @property
   * @type {Number}
   */
  count = 23;

  /**
   * Renders the template.
   *
   * @internal
   */
  render() {
    return html\`
      <div class="webring-banner">
        <div class="webring-banner__header">
          <img class="webring-banner__image" src="\${this.url}\${this.logo}" alt="" />
          <div class="webring-banner__description">
            <span>This site is part of</span>
            <h3 class="webring-banner__title">
              <a href="\${this.url}">\${this.title}</a>
            </h3>
            <span>A webring with \${this.count} Members</span>
          </div>
          <a class="webring-banner__info" href="https://en.wikipedia.org/wiki/Webring" title="What's this?">?</a>
        </div>
        <p class="webring-banner__links">
          <a href="\${this.url}/prev" rel="external" referrerpolicy="strict-origin" class="webring-banner__link webring-banner__link--prev" aria-label="Go to previous site">⬅️ Previous</a>
          <a href="\${this.url}/random" rel="external" referrerpolicy="strict-origin" class="webring-banner__link webring-banner__link--random" aria-label="Go to a random site">😎 Random</a>
          <a href="\${this.url}/next" rel="external" referrerpolicy="strict-origin" class="webring-banner__link webring-banner__link--next" aria-label="Go to next site">Next ➡️</a>
        </p>
      </div>
    \`;
  }
}

/**
 * Register the web component
 */
WebringEmbed.define();`,
  html: `<webring-embed
  url="https://design-system.club"
  logo="/assets/images/logo.svg"
  title="Design Systems Webring">
</webring-embed>`,
  css: `* {
  box-sizing: border-box;
  line-height: 1.4;
}

:root {
  font-size: 100%;
}

:host {
  display: block;
  inline-size: 100%;
  font-family: sans-serif;
  text-align: left;
  color: #231f20;
  container-type: inline-size;
  container-name: webring;
}

.webring-banner {
  font-size: 15px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px 0 rgba(14, 30, 37, 0.12);
  max-inline-size: 480px;
}

@container webring (width > 420px) {
  .webring-banner {
    font-size: 16px;
  }
}

@container webring (width < 380px) {
  .webring-banner {
    font-size: 14px;
  }
}

@container webring (width < 340px) {
  .webring-banner {
    font-size: 13px;
  }
}

.webring-banner a {
  color: #6600ff;
  text-decoration: none;
}

.webring-banner a:hover,
.webring-banner a:focus {
  color: #5200cc;
  text-decoration: underline;
}

.webring-banner__header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  padding: 1.5em 1.2em;
  border-bottom: 1px solid #ddd;
}

.webring-banner__description {
  flex: 1 0 0%;
  padding-right: 2em;
}

.webring-banner__image {
  display: block;
  inline-size: 70px;
  block-size: 70px;
  margin: 0 1rem 0 0;
  border-radius: 50%;
}

.webring-banner__title {
  margin: 0;
  font-family: sans-serif;
  font-size: 1.25em;
  font-weight: bold;
  line-height: 1.2;
}

.webring-banner__info {
  display: flex;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid #ddd;
  inline-size: 1.25rem;
  block-size: 1.25rem;
  line-height: 1.25rem;
  font-size: 0.75rem;
  text-align: center;
  align-items: center;
  text-decoration: none;
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.webring-banner__links {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 1em;
  margin: 0;
}

.webring-banner__link {
  display: block;
}

.webring-banner__link--random {
  text-align: center;
}

.webring-banner__link--next {
  text-align: right;
}`,
};

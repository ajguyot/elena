export default {
  id: "declarative-component",
  title: "Declarative Component",
  js: `import { Elena } from "@elenajs/core";

/**
 * Button component is used for interface actions.
 *
 * @displayName Button
 * @slot - The button content
 * @status alpha
 */
export default class MyButton extends Elena(HTMLElement) {
  static tagName = "my-button";
  static shadow = "open";
}

MyButton.define();`,
  html: `<my-button>
  <template shadowrootmode="open">
    <link rel="stylesheet" href="./styles.css">
    <button><slot></slot></button>
  </template>
  Click me
</my-button>

<my-button style="--button-bg: #eaecf0; --button-text: #172b4d;">
  <template shadowrootmode="open">
    <link rel="stylesheet" href="./styles.css">
    <button><slot></slot></button>
  </template>
  Cancel
</my-button>`,
  css: `button {
  font-family: system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  background: var(--button-bg, #5a44d4);
  color: var(--button-text, #fff);
  cursor: pointer;
}

button:hover {
  filter: brightness(0.9);
}

button:active {
  opacity: 0.7;
}

button:focus {
  outline: 2px solid #5a44d4;
  outline-offset: 1px;
}`,
};

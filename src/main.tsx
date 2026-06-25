
// Patch DOM operations to prevent crashes from Google Translate / extension mutations
if (typeof Node !== 'undefined' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function<T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      console.warn('removeChild: parentNode mismatch, ignoring to prevent crash.');
      return child;
    }
    try {
      return originalRemoveChild.call(this, child) as T;
    } catch (err) {
      console.warn('removeChild: error caught, ignoring to prevent crash.', err);
      return child;
    }
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function<T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      console.warn('insertBefore: parentNode mismatch, ignoring to prevent crash.');
      return newNode;
    }
    try {
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    } catch (err) {
      console.warn('insertBefore: error caught, ignoring to prevent crash.', err);
      return newNode;
    }
  };
}

import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);
  
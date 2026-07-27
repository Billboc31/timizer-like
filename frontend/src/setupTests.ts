import '@testing-library/jest-dom/vitest';

// JSDOM does not implement the native <dialog> API; polyfill for tests.
HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
  this.setAttribute('open', '');
};
HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
  this.removeAttribute('open');
};

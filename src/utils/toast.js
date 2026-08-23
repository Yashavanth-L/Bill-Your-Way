export const showToast = (message, type = 'info') => {
  window.dispatchEvent(new CustomEvent('show_toast', { detail: { message, type } }));
};

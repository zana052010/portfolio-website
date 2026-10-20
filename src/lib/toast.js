let toastTimer;

export function showToast(message) {
  const toast = document.getElementById('toast');
  const output = document.getElementById('toast-message');
  if (!toast || !output) return;
  output.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2800);
}

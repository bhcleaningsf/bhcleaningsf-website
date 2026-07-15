
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade').forEach(el => observer.observe(el));

  const form = document.querySelector('#quote-form');
  if (!form) return;

  const button = form.querySelector('.submit-btn');
  const buttonLabel = form.querySelector('.button-label');
  const status = document.querySelector('#form-status');

  const setStatus = (message, type = '') => {
    status.textContent = message;
    status.className = `form-status ${type}`.trim();
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    setStatus('');

    if (!form.checkValidity()) {
      form.reportValidity();
      setStatus('Please complete all required fields.', 'error');
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());

    button.disabled = true;
    buttonLabel.textContent = 'Sending...';
    setStatus('Sending your request...', 'sending');

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'We could not send your request.');
      }

      form.reset();
      setStatus('Thank you! Your estimate request was sent successfully. We will contact you shortly.', 'success');
    } catch (error) {
      console.error(error);
      setStatus('Your request could not be sent. Please call or text us at (650) 720-0743.', 'error');
    } finally {
      button.disabled = false;
      buttonLabel.textContent = 'Send Estimate Request';
    }
  });
});

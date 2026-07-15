
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, {threshold: .12});
  document.querySelectorAll('.fade').forEach(el => observer.observe(el));

  const form = document.querySelector('#quote-form');
  if(form){
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.querySelector('#name').value.trim();
      const service = document.querySelector('#service').value;
      const city = document.querySelector('#city').value.trim();
      const details = document.querySelector('#details').value.trim();
      const subject = encodeURIComponent('Cleaning Estimate Request');
      const body = encodeURIComponent(`Name: ${name}\nService: ${service}\nCity: ${city}\n\nDetails:\n${details}`);
      location.href = `mailto:bhcleaning.sf@gmail.com?subject=${subject}&body=${body}`;
    });
  }
});

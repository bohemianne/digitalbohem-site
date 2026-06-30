// ===== MOBILE MENU =====
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const closeMenu = document.querySelector('.close-menu');

if (menuToggle) {
  menuToggle.addEventListener('click', () => mobileMenu.classList.add('active'));
}
if (closeMenu) {
  closeMenu.addEventListener('click', () => mobileMenu.classList.remove('active'));
}

// ===== INSTAGRAM MODAL =====
const modal = document.getElementById('instagram-modal');
const modalPackageName = document.getElementById('modal-package-name');
const closeModal = document.querySelector('.close-modal');

function openModal(packageName) {
  if (modalPackageName) modalPackageName.textContent = packageName;
  if (modal) modal.classList.add('active');
}

if (closeModal) {
  closeModal.addEventListener('click', () => modal.classList.remove('active'));
}
if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

// ===== LOCALSTORAGE PRICES =====
function loadPrices() {
  const prices = JSON.parse(localStorage.getItem('db_prices') || '{}');
  if (prices.basic) document.getElementById('price-basic').textContent = prices.basic;
  if (prices.premium) document.getElementById('price-premium').textContent = prices.premium;
  if (prices.elite) document.getElementById('price-elite').textContent = prices.elite;
}
loadPrices();

// ===== FETCH PRICES FROM API =====
async function fetchPrices() {
  try {
    const res = await fetch('api/data.php?table=fiyatlar');
    const data = await res.json();
    if (data.success && data.data) {
      const prices = {};
      data.data.forEach(p => { prices[p.paket] = p.fiyat; });
      localStorage.setItem('db_prices', JSON.stringify(prices));
      loadPrices();
    }
  } catch (e) { console.log('API offline, using localStorage'); }
}
fetchPrices();

// ===== SCROLL ANIMATIONS =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });

document.querySelectorAll('.package-card, .category-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Add visible class style dynamically
const style = document.createElement('style');
style.textContent = '.visible { opacity: 1 !important; transform: translateY(0) !important; }';
document.head.appendChild(style);

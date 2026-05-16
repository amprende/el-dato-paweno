// OFERTAS.JS - WALL PAGE
document.addEventListener('DOMContentLoaded', async () => {
  await getDealsFromSupabase();
  renderDeals(DEALS_DATA);
  updateResultsCount(DEALS_DATA.length);
});

function closeSubscribeBar() {
  const bar = document.getElementById('subscribe-bar');
  if (bar) {
    bar.style.display = 'none';
  }
}

function renderDeals(deals) {
  const grid = document.getElementById('deals-grid');
  if (!grid) return;

  if (deals.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: var(--space-xl);">
        <span class="material-icons" style="font-size: 3rem; color: var(--outline);">search_off</span>
        <h3 style="margin-top: var(--space-md);">No se encontraron ofertas</h3>
        <p style="color: var(--on-surface-variant);">Prueba a cambiar los filtros</p>
      </div>
    `;
    return;
  }

  // ORDENAR: Por ID (Cronológico, más reciente primero)
  const sortedDeals = [...deals].sort((a, b) => b.id - a.id);

  grid.innerHTML = sortedDeals.map(deal => {
    const discount = calculateDiscountPercentage(deal.originalPrice, deal.dealPrice);
    
    return `
      <div class="floating-card card-${deal.rarity}">
        <div class="card-badge ${deal.rarity}-badge">${getRarityLabel(deal.rarity)}</div>
        <div class="discount-badge">-${discount}%</div>
        <div style="height: 150px; background: url('${deal.imageUrl}') center/cover; border-radius: var(--radius-md) var(--radius-md) 0 0; margin: -var(--space-lg) -var(--space-lg) var(--space-md) -var(--space-lg);"></div>
        <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: var(--space-sm);">
          <span style="color: var(--on-surface-variant); font-size: 0.8rem;">${deal.store}</span>
        </div>
        <h4 style="font-family: var(--font-headline); font-weight: 700; margin-bottom: var(--space-sm); font-size: 1rem;">${deal.title}</h4>
        <div style="display: flex; align-items: baseline; gap: var(--space-sm);">
          <span style="font-family: var(--font-headline); font-size: 1.2rem; font-weight: 800; color: var(--primary);">${formatCurrency(deal.dealPrice)}</span>
          <span style="text-decoration: line-through; color: var(--on-surface-variant); font-size: 0.8rem;">${formatCurrency(deal.originalPrice)}</span>
        </div>
        ${deal.stock ? `<p style="color: #ef4444; font-size: 0.8rem; font-weight: 600; margin-top: 4px;"><span class="material-icons" style="font-size: 12px;">timer</span> ¡Solo quedan ${deal.stock} unidades!</p>` : ''}
        <a href="${deal.url}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="width: 100%; justify-content: center; margin-top: var(--space-md); padding: 8px;">Ir a la Oferta</a>
      </div>
    `;
  }).join('');
}

function updateResultsCount(count) {
  const element = document.getElementById('results-count');
  if (element) {
    element.textContent = `Mostrando ${count} ofertas`;
  }
}

function applyFilters() {
  const legendaryCheck = document.querySelector('.legendary-check input').checked;
  const epicCheck = document.querySelector('.epic-check input').checked;
  const commonCheck = document.querySelector('.common-check input').checked;
  
  const selectedCategory = document.querySelector('input[name="category"]:checked').value;
  const minDiscount = parseInt(document.getElementById('discount-range').value);

  const filtered = DEALS_DATA.filter(deal => {
    // Filter by rarity
    if (deal.rarity === 'legendary' && !legendaryCheck) return false;
    if (deal.rarity === 'epic' && !epicCheck) return false;
    if (deal.rarity === 'common' && !commonCheck) return false;
    
    // Filter by category
    if (selectedCategory !== 'all' && deal.category !== selectedCategory) return false;
    
    // Filter by discount
    const discount = calculateDiscountPercentage(deal.originalPrice, deal.dealPrice);
    if (discount < minDiscount) return false;
    
    return true;
  });

  renderDeals(filtered);
  updateResultsCount(filtered.length);
}

function updateDiscountFilter(val) {
  document.getElementById('range-value').textContent = `${val}%+`;
  applyFilters();
}

function selectChip(el) {
  document.querySelectorAll('.category-chips .chip').forEach(c => c.classList.remove('chip-active'));
  el.classList.add('chip-active');
  
  const cat = el.dataset.cat;
  const radio = document.querySelector(`input[name="category"][value="${cat}"]`);
  if (radio) {
    radio.checked = true;
    applyFilters();
  }
}

function toggleSubscribeModal() {
  const modal = document.getElementById('subscribe-modal');
  modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function closeModal(e) {
  if (e.target.id === 'subscribe-modal') {
    toggleSubscribeModal();
  }
}

function handleSubscribeModal(e) {
  e.preventDefault();
  
  const email = document.getElementById('modal-email').value;
  const countryCode = document.getElementById('country-code').value;
  const phoneNumber = document.getElementById('modal-phone').value;
  const phone = phoneNumber ? (countryCode + ' ' + phoneNumber) : '';
  
  const preferences = [];
  if (document.getElementById('notif-legendary').checked) preferences.push('Legendary');
  if (document.getElementById('notif-epic').checked) preferences.push('Epic');
  if (document.getElementById('notif-common').checked) preferences.push('Common');

  const formData = new URLSearchParams();
  formData.append('email', email);
  formData.append('phone', phone);
  formData.append('preferences', preferences.join(', '));

  const button = e.submitter;
  const originalText = button ? button.innerHTML : 'Activar Alertas';
  if (button) {
    button.innerHTML = '<span class="material-icons">hourglass_empty</span> Enviando...';
    button.disabled = true;
  }

  fetch('https://script.google.com/macros/s/AKfycbzwT8NZZ02jUktMuq-YiACf7L9O6IOeabnG0j1HKbk28y30EdPfElYVHuWrHk--ic46Zw/exec', {
    method: 'POST',
    mode: 'no-cors',
    body: formData
  })
  .then(() => {
    alert('¡Alertas activadas con éxito!');
    toggleSubscribeModal();
    e.target.reset();
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Hubo un error al guardar los datos.');
  })
  .finally(() => {
    button.innerHTML = originalText;
    button.disabled = false;
  });
}

function setView(viewType) {
  const grid = document.getElementById('deals-grid');
  const btnGrid = document.getElementById('btn-grid-view');
  const btnList = document.getElementById('btn-list-view');
  
  if (!grid || !btnGrid || !btnList) return;

  if (viewType === 'grid') {
    grid.classList.remove('list-view');
    grid.classList.add('grid-view');
    btnGrid.classList.add('active');
    btnList.classList.remove('active');
  } else {
    grid.classList.remove('grid-view');
    grid.classList.add('list-view');
    btnList.classList.add('active');
    btnGrid.classList.remove('active');
  }
}

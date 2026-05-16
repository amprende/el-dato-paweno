// ADMIN.JS - PANEL
document.addEventListener('DOMContentLoaded', async () => {
  await getDealsFromSupabase();
  renderAdminDeals();
});

function calculateDiscount() {
  const original = parseFloat(document.getElementById('deal-original-price').value.replace(',', '.'));
  const current = parseFloat(document.getElementById('deal-deal-price').value.replace(',', '.'));
  
  const discountDisplay = document.getElementById('calculated-discount');
  const rarityAuto = document.getElementById('auto-rarity');
  
  if (isNaN(original) || isNaN(current) || original <= 0) {
    discountDisplay.textContent = '—';
    rarityAuto.textContent = 'Introduce los precios';
    return;
  }
  
  const percentage = calculateDiscountPercentage(original, current);
  discountDisplay.textContent = `-${percentage}%`;
  
  // Auto suggest rarity
  let rarity = 'common';
  if (percentage >= 70) rarity = 'legendary';
  else if (percentage >= 40) rarity = 'epic';
  
  rarityAuto.textContent = `Sugerido: ${rarity.toUpperCase()}`;
  selectRarity(rarity);
}

function selectRarity(rarity) {
  document.querySelectorAll('.rarity-btn').forEach(btn => btn.classList.remove('active'));
  const btn = document.querySelector(`.rarity-btn[data-rarity="${rarity}"]`);
  if (btn) btn.classList.add('active');
}

function renderAdminDeals() {
  const list = document.getElementById('recent-deals-list');
  if (!list) return;

  list.innerHTML = DEALS_DATA.map(deal => {
    const discount = calculateDiscountPercentage(deal.originalPrice, deal.dealPrice);
    
    return `
      <div class="admin-deal-item" style="display: flex; justify-content: space-between; align-items: center;">
        <div class="deal-item-info">
          <span class="deal-item-title">${deal.title}</span>
          <div class="deal-item-meta">
            ${deal.store} · <span class="rarity-badge ${deal.rarity}">${deal.rarity.toUpperCase()}</span>
          </div>
        </div>
        <div style="display: flex; align-items: center;">
          <div class="deal-item-price" style="text-align: right; margin-right: 15px;">
            <div class="deal-current-price">${formatCurrency(deal.dealPrice)}</div>
            <div class="deal-original-price">${formatCurrency(deal.originalPrice)}</div>
          </div>
          <button onclick="deleteDeal('${deal.id}')" class="btn-quitar">Quitar</button>
        </div>
      </div>
    `;
  }).join('');
}

async function handlePublishDeal(e) {
  e.preventDefault();
  console.log('Iniciando publicación de oferta...');
  
  // Recoger datos del formulario
  const title = document.getElementById('deal-title').value;
  const category = document.getElementById('deal-category').value;
  const originalPrice = parseFloat(document.getElementById('deal-original-price').value.replace(',', '.'));
  const dealPrice = parseFloat(document.getElementById('deal-deal-price').value.replace(',', '.'));
  const store = document.getElementById('deal-store').value;
  const url = document.getElementById('deal-url').value;
  const description = document.getElementById('deal-description').value;
  const imageUrl = document.getElementById('deal-image-url').value || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format';
  const stock = document.getElementById('deal-stock').value ? parseInt(document.getElementById('deal-stock').value) : null;
  
  const activeRarityBtn = document.querySelector('.rarity-btn.active');
  const rarity = activeRarityBtn ? activeRarityBtn.dataset.rarity : 'common';

  const newDeal = {
    title,
    category,
    originalPrice,
    dealPrice,
    rarity,
    store,
    url,
    imageUrl,
    stock,
    timestamp: new Date().getTime()
  };

  console.log('Nueva oferta creada:', newDeal);

  let dealToPush = newDeal;

  // Guardar en Supabase
  if (typeof supabase !== 'undefined' && supabase) {
    const dealForSupabase = {
      title,
      category,
      originalprice: originalPrice,
      dealprice: dealPrice,
      rarity,
      store,
      url,
      imageurl: imageUrl,
      stock,
      timestamp: newDeal.timestamp
    };

    const { data, error } = await supabase
      .from('deals')
      .insert([dealForSupabase])
      .select();
    
    if (error) {
      console.error('Error guardando en Supabase:', error);
      alert('Error al guardar la oferta en la nube.');
      return;
    }
    console.log('Guardado en Supabase con éxito');
    if (data && data.length > 0) {
      dealToPush = {
        ...data[0],
        originalPrice: data[0].originalprice,
        dealPrice: data[0].dealprice,
        imageUrl: data[0].imageurl
      };
    }
  } else {
    // Fallback a localStorage
    newDeal.id = new Date().getTime(); // Generar ID local
    const customDeals = JSON.parse(localStorage.getItem('custom_deals') || '[]');
    customDeals.push(newDeal);
    localStorage.setItem('custom_deals', JSON.stringify(customDeals));
    console.log('Guardado en localStorage.');
  }

  // Actualizar DEALS_DATA en memoria
  DEALS_DATA.unshift(dealToPush);
  renderAdminDeals();
  console.log('DEALS_DATA actualizado y re-renderizado.');

  // Enviar notificaciones via Google Sheets
  const formData = new URLSearchParams();
  formData.append('title', title);
  formData.append('price', formatCurrency(dealPrice));
  formData.append('url', url);
  formData.append('rarity', rarity);
  formData.append('store', store);
  formData.append('action', 'publish_offer');
  
  const notifyEmail = document.getElementById('notify-email').checked;
  const notifyPhone = document.getElementById('notify-phone').checked;
  formData.append('notifyEmail', notifyEmail);
  formData.append('notifyPhone', notifyPhone);

  console.log('Enviando notificación a Google Sheets...');
  fetch('https://script.google.com/macros/s/AKfycbzwT8NZZ02jUktMuq-YiACf7L9O6IOeabnG0j1HKbk28y30EdPfElYVHuWrHk--ic46Zw/exec', {
    method: 'POST',
    mode: 'no-cors',
    body: formData
  })
  .then(() => console.log('Notificación enviada con éxito (modo no-cors)'))
  .catch(err => console.error('Error al enviar notificación:', err));

  // Mostrar toast
  const toast = document.getElementById('publish-toast');
  toast.style.display = 'flex';
  
  setTimeout(() => {
    toast.style.display = 'none';
    document.getElementById('publish-form').reset();
    document.getElementById('calculated-discount').textContent = '—';
    document.getElementById('auto-rarity').textContent = 'Introduce los precios';
    document.querySelectorAll('.rarity-btn').forEach(btn => btn.classList.remove('active'));
  }, 3000);
}

function handleFileSelect(input) {
  const file = input.files[0];
  if (!file) return;
  
  document.getElementById('file-name').textContent = file.name;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64 = e.target.result;
    document.getElementById('deal-image-url').value = base64;
    console.log('Imagen cargada como Base64');
  };
  reader.readAsDataURL(file);
}

function previewImage(url) {
  console.log('URL de imagen actualizada:', url);
}

window.deleteDeal = async function(id) {
  console.log('deleteDeal llamada con ID:', id);

  // 1. Eliminar de Supabase
  if (typeof supabase !== 'undefined' && supabase) {
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error eliminando de Supabase:', error);
      alert('Error al eliminar la oferta de la nube.');
      return;
    }
    console.log('Eliminado de Supabase con éxito');
  } else {
    // Fallback a localStorage
    const customDeals = JSON.parse(localStorage.getItem('custom_deals') || '[]');
    const updatedCustomDeals = customDeals.filter(deal => deal.id != id);
    localStorage.setItem('custom_deals', JSON.stringify(updatedCustomDeals));
    
    if (customDeals.length === updatedCustomDeals.length) {
      const deletedDeals = JSON.parse(localStorage.getItem('deleted_deals') || '[]');
      if (!deletedDeals.includes(id)) {
        deletedDeals.push(id);
        localStorage.setItem('deleted_deals', JSON.stringify(deletedDeals));
      }
    }
  }

  // 2. Quitar de la memoria actual y re-renderizar
  const index = DEALS_DATA.findIndex(deal => deal.id == id);
  if (index !== -1) {
    DEALS_DATA.splice(index, 1);
    renderAdminDeals();
    console.log('Oferta quitada de la memoria.');
  }
}

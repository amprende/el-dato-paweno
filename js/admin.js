let uploadedImages = [];

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await dealsLoadedPromise;
    renderAdminDeals();
  } catch (error) {
    console.error('Error al cargar ofertas:', error);
  }

  // Agregar listeners para calcular descuento (siempre se ejecutan)
  const originalInput = document.getElementById('deal-original-price');
  const currentInput = document.getElementById('deal-deal-price');
  if (originalInput) originalInput.addEventListener('input', calculateDiscount);
  if (currentInput) currentInput.addEventListener('input', calculateDiscount);
  
  const form = document.getElementById('publish-form');
  if (form) form.addEventListener('submit', handlePublishDeal);
});

function calculateDiscount() {
  const originalStr = document.getElementById('deal-original-price').value;
  const currentStr = document.getElementById('deal-deal-price').value;
  
  console.log('calculateDiscount triggered. Original:', originalStr, 'Current:', currentStr);
  
  const original = parseFloat(originalStr.replace(',', '.'));
  const current = parseFloat(currentStr.replace(',', '.'));
  
  console.log('Parsed values - Original:', original, 'Current:', current);
  
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
    const rarity = deal.rarity || 'common';
    const store = deal.store || 'Tienda';
    const title = deal.title || 'Sin título';
    
    return `
      <div class="admin-deal-item" style="display: flex; justify-content: space-between; align-items: center;">
        <div class="deal-item-info">
          <span class="deal-item-title">${title}</span>
          <div class="deal-item-meta">
            ${store} · <span class="rarity-badge ${rarity}">${rarity.toUpperCase()}</span>
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

window.handlePublishDeal = async function(e) {
  e.preventDefault();
  console.log('Iniciando publicación de oferta...');
  try {
  
  // Recoger datos del formulario
  const title = document.getElementById('deal-title').value || 'Sin título';
  const category = document.getElementById('deal-category').value || 'Otros';
  
  const originalStr = document.getElementById('deal-original-price').value;
  const originalPrice = originalStr ? parseFloat(originalStr.replace(',', '.')) : null;
  
  const currentStr = document.getElementById('deal-deal-price').value;
  const dealPrice = currentStr ? parseFloat(currentStr.replace(',', '.')) : null;
  
  const store = document.getElementById('deal-store').value || 'Tienda';
  const url = document.getElementById('deal-url').value || '#';
  const description = document.getElementById('deal-description').value || '';
  const imageUrl = document.getElementById('deal-image-url').value || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format';
  const stock = document.getElementById('deal-stock').value ? parseInt(document.getElementById('deal-stock').value) : null;
  const coupon = document.getElementById('deal-coupon').value || '';
  
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
    description,
    coupon,
    images: uploadedImages,
    timestamp: new Date().getTime()
  };

  console.log('Nueva oferta creada:', newDeal);

  let dealToPush = newDeal;

  // Guardar en Supabase
  if (window.supabaseClient) {
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
      description,
      coupon,
      images: uploadedImages,
      timestamp: newDeal.timestamp
    };

    const { data, error } = await window.supabaseClient
      .from('deals')
      .insert([dealForSupabase])
      .select();
    
    if (error) {
      console.error('Error guardando en Supabase:', error);
      alert('Error al guardar la oferta en la nube: ' + error.message);
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

  const notifyEmail = document.getElementById('notify-email').checked;
  const notifyPhone = document.getElementById('notify-phone').checked;
  
  const detailsUrl = `${window.location.origin}/detalle.html?id=${dealToPush.id}`;

  if (notifyEmail || notifyPhone) {
    console.log('Enviando señal de notificación a Google Sheets...');
    const scriptUrl = `https://script.google.com/macros/s/AKfycbzJ2WWNBeCgk1XGzVkRahAGkehMQ5M2ZiYgdoM8Y74aib7UnWjs7r1ZfGXhrWkRHytTwA/exec`;
    const payload = {
      notifyEmail: notifyEmail,
      notifyPhone: notifyPhone,
      title: title,
      price: formatCurrency(dealPrice),
      store: store,
      url: detailsUrl,
      rarity: rarity,
      imageUrl: imageUrl
    };

    fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors', // Evita problemas de CORS con Google Scripts
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(() => {
      console.log('Petición a Google Sheets enviada con éxito.');
    })
    .catch(err => {
      console.error('Error enviando a Google Sheets:', err);
    });
  } else {
    console.log('Ninguna casilla de notificación seleccionada. Saltando envío a Google.');
  }

  // Actualizar DEALS_DATA en memoria
  DEALS_DATA.unshift(dealToPush);
  renderAdminDeals();
  console.log('DEALS_DATA actualizado y re-renderizado.');

  // Mostrar toast
  const toast = document.getElementById('publish-toast');
  toast.style.display = 'flex';
  
  setTimeout(() => {
    toast.style.display = 'none';
    document.getElementById('publish-form').reset();
    document.getElementById('image-previews').innerHTML = '';
    uploadedImages = [];
    document.getElementById('calculated-discount').textContent = '—';
    document.getElementById('auto-rarity').textContent = 'Introduce los precios';
    document.querySelectorAll('.rarity-btn').forEach(btn => btn.classList.remove('active'));
  }, 3000);
  } catch (err) {
    console.error('ERROR en handlePublishDeal:', err);
    alert('Error al publicar: ' + err.message);
  }
}

async function handleFileSelect(input) {
  const files = input.files;
  if (!files || files.length === 0) return;
  
  const previewsContainer = document.getElementById('image-previews');
  
  // Limitar a 10 en total
  const remainingSlots = 10 - uploadedImages.length;
  if (remainingSlots <= 0) {
    alert('Ya has alcanzado el límite de 10 imágenes.');
    return;
  }
  
  const count = Math.min(files.length, remainingSlots);
  document.getElementById('file-name').textContent = `${uploadedImages.length + count} archivos seleccionados`;
  
  for (let i = 0; i < count; i++) {
    const file = files[i];
    const filename = `${Date.now()}_${file.name}`;
    
    try {
      console.log('Subiendo imagen a Supabase Storage...');
      const { data, error } = await window.supabaseClient
        .storage
        .from('ofertas')
        .upload(filename, file);
        
      if (error) throw error;
      
      const { data: urlData } = window.supabaseClient
        .storage
        .from('ofertas')
        .getPublicUrl(filename);
        
      const publicUrl = urlData.publicUrl;
      uploadedImages.push(publicUrl);
      
      // Mostrar miniatura en el panel
      const img = document.createElement('img');
      img.src = publicUrl;
      img.style.width = '60px';
      img.style.height = '60px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = 'var(--radius-sm)';
      img.style.border = '1px solid var(--border-color)';
      previewsContainer.appendChild(img);
      
      // Si es la primera de todas, ponerla en el input de URL principal
      if (uploadedImages.length === 1) {
        document.getElementById('deal-image-url').value = publicUrl;
      }
      
      console.log('Imagen subida con éxito:', publicUrl);
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      alert('Error al subir la imagen: ' + err.message);
    }
  }
}

window.deleteDeal = async function(id) {
  console.log('deleteDeal llamada con ID:', id);

  // 0. Intentar borrar la imagen de Storage si es de Supabase
  try {
    const deal = DEALS_DATA.find(d => d.id == id);
    const imgUrl = deal ? (deal.imageUrl || deal.imageurl) : null;
    
    if (imgUrl && imgUrl.includes('storage/v1/object/public/ofertas/')) {
      const filename = imgUrl.split('/').pop();
      console.log('Borrando imagen de Storage:', filename);
      
      await window.supabaseClient
        .storage
        .from('ofertas')
        .remove([filename]);
    }
  } catch (err) {
    console.error('Error al intentar borrar la imagen del Storage:', err);
  }

  // 1. Eliminar de Supabase
  if (window.supabaseClient) {
    const { error } = await window.supabaseClient
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

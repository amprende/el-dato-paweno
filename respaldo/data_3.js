// MOCK DATA - LOOTDEALS
const DEALS_DATA = [
  {
    id: 1,
    title: "Laptop Pro X-9000",
    category: "electronica",
    originalPrice: 1299.99,
    dealPrice: 194.99,
    rarity: "legendary",
    store: "Amazon",
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format",
    stock: 3,
    timestamp: new Date().getTime() - 120000 // 2 min ago
  },
  {
    id: 2,
    title: "Studio ANC Wireless Headphones",
    category: "electronica",
    originalPrice: 299.99,
    dealPrice: 99.99,
    rarity: "epic",
    store: "FNAC",
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format",
    stock: 15,
    timestamp: new Date().getTime() - 300000 // 5 min ago
  },
  {
    id: 3,
    title: "Mouse Gamer RGB v2",
    category: "gaming",
    originalPrice: 79.99,
    dealPrice: 47.99,
    rarity: "common",
    store: "PC Componentes",
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format",
    stock: null,
    timestamp: new Date().getTime() - 480000 // 8 min ago
  },
  {
    id: 4,
    title: "Silla Gaming Ergonómica",
    category: "gaming",
    originalPrice: 249.99,
    dealPrice: 124.99,
    rarity: "epic",
    store: "Amazon",
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1598550476439-6847785fce68?w=500&auto=format",
    stock: 5,
    timestamp: new Date().getTime() - 600000 // 10 min ago
  },
  {
    id: 5,
    title: "Smart TV 55\" 4K QLED",
    category: "electronica",
    originalPrice: 799.99,
    dealPrice: 499.99,
    rarity: "epic",
    store: "El Corte Inglés",
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1593359674240-a5a2ddcd5654?w=500&auto=format",
    stock: 10,
    timestamp: new Date().getTime() - 900000 // 15 min ago
  },
  {
    id: 6,
    title: "Camiseta Algodón Orgánico",
    category: "moda",
    originalPrice: 29.99,
    dealPrice: 8.99,
    rarity: "common",
    store: "Zalando",
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ed0358269937?w=500&auto=format",
    stock: null,
    timestamp: new Date().getTime() - 1200000 // 20 min ago
  }
];

// Inicializar Supabase
const supabaseUrl = 'https://qfvkjtrcgwsuivsrfpfd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdmtqdHJjZ3dzdWl2c3JmcGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NDQ5NjMsImV4cCI6MjA5MzIyMDk2M30.C3yN_DvjqEc8uV1GpHTW4gzcbxlNaO8CQrnnsY8Mr8k';
window.supabaseClient = typeof supabase !== 'undefined' ? supabase.createClient(supabaseUrl, supabaseKey) : null;

// Función para cargar ofertas desde Supabase
async function getDealsFromSupabase() {
  if (!window.supabaseClient) {
    console.log('Supabase client not available, using static data');
    return DEALS_DATA;
  }
  const { data, error } = await window.supabaseClient
    .from('deals')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Error cargando ofertas de Supabase:', error);
    return DEALS_DATA;
  }
  
  console.log('Data fetched from Supabase:', data);
  
  const deals = data && data.length > 0 ? data.map(deal => ({
    ...deal,
    originalPrice: deal.originalprice,
    dealPrice: deal.dealprice,
    imageUrl: deal.imageurl
  })) : DEALS_DATA;
  
  // Actualizar DEALS_DATA en memoria para que funcione con los filtros existentes
  DEALS_DATA.length = 0;
  DEALS_DATA.push(...deals);
  return DEALS_DATA;
}

// Iniciar la carga inmediatamente y exponer la promesa
const dealsLoadedPromise = getDealsFromSupabase();

// Helper to get rarity label
function getRarityLabel(rarity) {
  switch(rarity) {
    case 'legendary': return '👑 LEGENDARY';
    case 'epic': return '💎 EPIC';
    case 'common': return '🍃 COMMON';
    default: return 'DEAL';
  }
}

// Helper to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
}

// Helper to calculate discount percentage
function calculateDiscountPercentage(original, current) {
  return Math.round(((original - current) / original) * 100);
}

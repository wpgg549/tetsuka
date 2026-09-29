const SUPABASE_URL = 'https://upeuriwvpwendwfutpkq.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_mscNam3qsFICQJykosgggA_JtyLNpjq';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const KATEGORI_LIST = ['Semua', '5MB', 'XML', 'JJ', 'Velocity'];
let selectedCategory = 'Semua';
let presets = [];

document.addEventListener('DOMContentLoaded', () => {
  renderFilters();
  fetchPresets();
  document.getElementById('searchInput').addEventListener('input', renderPresets);
  lucide.createIcons();
});

async function fetchPresets() {
  const grid = document.getElementById('presetGrid');
  grid.innerHTML = `<div class="col-span-full text-center py-16 text-gray-500 font-medium">Memuat katalog preset...</div>`;
  
  const { data, error } = await supabase
    .from('presets')
    .select('*')
    .order('number', { ascending: false });

  if (error) {
    showToast('Gagal memuat data dari server!', 'error');
  } else {
    presets = data;
    renderPresets();
  }
}

function renderFilters() {
  const container = document.getElementById('filterContainer');
  container.innerHTML = KATEGORI_LIST.map(cat => `
    <button onclick="setCategory('${cat}')" 
      class="filter-btn px-4.5 py-2 rounded-full font-bold text-xs transition-all duration-300 shadow-md 
      ${selectedCategory === cat ? 'bg-green-500 text-gray-950 shadow-green-500/25 scale-105' : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700'}">
      ${cat}
    </button>
  `).join('');
}

function renderPresets() {
  const grid = document.getElementById('presetGrid');
  const searchVal = document.getElementById('searchInput').value.toLowerCase().trim();
  const rawSearch = searchVal.replace('#', '');
  
  const filtered = presets.filter(p => {
    const matchCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchTitle = p.title.toLowerCase().includes(searchVal);
    const matchNumber = p.number.toString() === rawSearch;
    return matchCategory && (matchTitle || matchNumber);
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
        <i data-lucide="folder-search" class="w-12 h-12 mb-3 opacity-30 text-green-400"></i>
        <p class="text-sm font-semibold">Preset tidak ditemukan</p>
      </div>`;
    lucide.createIcons();
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const alightUrl = p.alightLink || '';
    const xmlUrl = p.xmlLink || '';
    
    let linksHtml = '';
    if (alightUrl && xmlUrl) {
      linksHtml = `
        <a href="${alightUrl}" target="_blank" class="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold py-2.5 rounded-xl text-center transition flex items-center justify-center gap-1 active:scale-95">⚡ Alight</a>
        <a href="${xmlUrl}" target="_blank" class="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold py-2.5 rounded-xl text-center transition flex items-center justify-center gap-1 active:scale-95">📄 XML</a>
      `;
    } else if (alightUrl) {
      linksHtml = `<a href="${alightUrl}" target="_blank" class="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold py-2.5 rounded-xl text-center transition flex items-center justify-center gap-1.5 active:scale-95">Buka Alight Link</a>`;
    } else if (xmlUrl) {
      linksHtml = `<a href="${xmlUrl}" target="_blank" class="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold py-2.5 rounded-xl text-center transition flex items-center justify-center gap-1.5 active:scale-95">Download XML</a>`;
    }

    const thumb = p.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600';
    const mediaHtml = p.video 
      ? `<video src="${p.video}" poster="${thumb}" playsinline loop muted onmouseenter="this.play()" onmouseleave="this.pause()" onclick="this.paused ? this.play() : this.pause()" class="w-full h-full object-cover cursor-pointer"></video>
         <div class="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-[9px] text-gray-200 px-2.5 py-1 rounded-md flex items-center gap-1 font-medium pointer-events-none">
           <i data-lucide="play" class="w-3 h-3 text-green-400 fill-green-400"></i> Tap/Hover Play
         </div>`
      : `<img src="${thumb}" class="w-full h-full object-cover opacity-80 group-hover:scale-110 transition duration-500">`;

    return `
      <div class="bg-gray-900/90 border border-gray-800/80 rounded-3xl overflow-hidden hover:border-gray-700 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 flex flex-col group">
        <div class="h-48 bg-gray-950 relative overflow-hidden flex items-center justify-center">
          <span class="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-400 text-gray-950 text-xs font-black px-3 py-1 rounded-xl z-10 shadow-lg tracking-wider">#${p.number}</span>
          <span class="absolute top-3 right-3 bg-gray-950/80 backdrop-blur-md text-green-400 border border-green-500/20 text-[10px] font-bold px-2.5 py-1 rounded-md z-10">${p.category}</span>
          ${mediaHtml}
        </div>
        <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-gray-900 to-gray-950">
          <h3 class="font-bold text-sm line-clamp-2 text-gray-100 mb-4 leading-snug">${p.title}</h3>
          <div class="flex gap-2 items-center">
            ${linksHtml}
            <button onclick="copyToClipboard('${alightUrl || xmlUrl}')" class="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2.5 rounded-xl border border-gray-700 transition active:scale-95" title="Copy Link Utama">
              <i data-lucide="copy" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  lucide.createIcons();
}

function setCategory(cat) {
  selectedCategory = cat;
  renderFilters();
  renderPresets();
}

function copyToClipboard(text) {
  if (!text) return;
  navigator.clipboard.writeText(text);
  showToast('Link berhasil disalin!', 'success');
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-gray-900 border-green-500/50' : 'bg-gray-900 border-red-500/50';
  const icon = type === 'success' ? '<i data-lucide="check-circle" class="w-4 h-4 text-green-400"></i>' : '<i data-lucide="alert-circle" class="w-4 h-4 text-red-400"></i>';
  
  toast.className = `toast-enter flex items-center gap-2 px-4 py-3 rounded-2xl border ${bgColor} text-white shadow-2xl text-sm font-medium pointer-events-auto`;
  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.classList.replace('toast-enter', 'toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

const SUPABASE_URL = 'https://upeuriwvpwendwfutpkq.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_mscNam3qsFICQJykosgggA_JtyLNpjq';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const ADMIN_PASSKEY = "semutaprika67$";

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('uploadForm').addEventListener('submit', handleUpload);
  lucide.createIcons();
});

async function handleUpload(e) {
  e.preventDefault();
  
  if (document.getElementById('passkeyInput').value !== ADMIN_PASSKEY) {
    showToast('Passkey Admin salah!', 'error');
    return;
  }

  const alightVal = document.getElementById('alightLinkInput').value.trim();
  const xmlVal = document.getElementById('xmlLinkInput').value.trim();

  if (!alightVal && !xmlVal) {
    showToast('Isi minimal satu link (Alight/XML)!', 'error');
    return;
  }

  showToast('Sedang mengupload preset ke server...', 'success');

  // Ambil data dulu dari Supabase buat ngecek nomor preset terakhir
  const { data: existingPresets, error: fetchError } = await supabase
    .from('presets')
    .select('number');

  if (fetchError) {
    showToast('Gagal menyambung ke database!', 'error');
    return;
  }

  const maxNumber = existingPresets.reduce((max, p) => Math.max(max, p.number), 0);
  const newNumber = maxNumber + 1;

  const newPreset = {
    number: newNumber,
    title: document.getElementById('titleInput').value,
    alightLink: alightVal,
    xmlLink: xmlVal,
    category: document.getElementById('categoryInput').value,
    thumbnail: document.getElementById('thumbInput').value,
    video: document.getElementById('videoInput').value
  };

  const { error } = await supabase.from('presets').insert([newPreset]);

  if (error) {
    showToast('Gagal upload preset!', 'error');
    console.error(error);
  } else {
    document.getElementById('uploadForm').reset();
    showToast(`Berhasil! Preset #${newNumber} berhasil dipublish.`, 'success');
  }
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

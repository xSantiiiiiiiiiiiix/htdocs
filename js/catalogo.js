(function () {
  const client = window.supabaseClient;
  let products = [];
  const grid = () => document.getElementById('catalog-grid');
  const fallback = 'img/amedida3d_png.png';
  function render(list) {
    const container = grid();
    if (!container) return;
    container.innerHTML = list.length ? list.map((product) => `
      <article class="product-card">
        <img src="${product.imagen_url || fallback}" alt="${escapeHtml(product.nombre)}" loading="lazy">
        <span class="category-pill">${escapeHtml(product.categoria || 'Sin categoría')}</span>
        <h4>${escapeHtml(product.nombre)}</h4><p>${escapeHtml(product.descripcion || '')}</p>
        <div class="price">$${Number(product.precio || 0).toFixed(2)}</div>
        <div class="product-actions"><button class="add-cart" data-product-id="${product.id}">Agregar al carrito</button><button class="view" data-product-id="${product.id}">Ver detalles</button></div>
      </article>`).join('') : '<div class="no-results">No hay productos disponibles.</div>';
    const count = document.getElementById('catalog-count');
    if (count) count.textContent = list.length;
  }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char])); }
  async function load() {
    if (!grid()) return;
    if (!client) { render([]); return; }
    const { data, error } = await client.from('productos').select('*').eq('activo', true).order('id', { ascending: false });
    if (error) { console.error('Error al cargar productos:', error); render([]); return; }
    products = data || []; render(products); renderCategories();
  }
  function renderCategories() {
    const select = document.getElementById('filter-category');
    if (!select) return;
    select.innerHTML = '<option value="">Todas las categorías</option>' +
      [...new Set(products.map((item) => item.categoria).filter(Boolean))].sort().map((category) => `<option>${escapeHtml(category)}</option>`).join('');
  }
  function apply() {
    const query = (document.getElementById('catalog-search-input')?.value || '').toLowerCase();
    const category = document.getElementById('filter-category')?.value || '';
    render(products.filter((item) => (!category || item.categoria === category) &&
      `${item.nombre} ${item.descripcion || ''} ${item.categoria || ''}`.toLowerCase().includes(query)));
  }
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-product-id]');
    if (!button) return;
    const product = products.find((item) => String(item.id) === button.dataset.productId);
    if (!product) return;
    if (button.classList.contains('add-cart')) window.cart.add(product);
    if (button.classList.contains('view')) window.productModal.open(product);
  });
  document.addEventListener('input', (event) => { if (event.target.id === 'catalog-search-input' || event.target.id === 'filter-category') apply(); });
  document.addEventListener('DOMContentLoaded', load);
})();

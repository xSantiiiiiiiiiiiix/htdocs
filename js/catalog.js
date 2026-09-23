/* Catalogue loader, search and filter
   Exposes window.searchProducts(query, {category}) -> Promise<array of products>
*/
(function(){
  let products = [];

  function isCatalogPage(){
   return document.body.classList.contains('catalog-page') || window.location.pathname.includes('catalog.html');
  }

  async function load(){
   if(!isCatalogPage()){ return; }
   try{
     const res = await fetch('js/products.json');
     products = await res.json();
   }catch(e){ console.error('Could not load products.json', e); products = []; }
   renderFilters();
   applyFilters();
  }

  function renderFilters(){
   const sel = document.getElementById('filter-category');
   if(!sel) return;
   const cats = Array.from(new Set(products.map(p=>p.category))).sort();
   sel.innerHTML = '<option value="">Todas las categorías</option>' + cats.map(c=>`<option value="${c}">${c}</option>`).join('');
  }

  function getVisibleProducts(){
   const searchInput = document.getElementById('catalog-search-input');
   const filterSelect = document.getElementById('filter-category');
   const q = (searchInput ? searchInput.value : '').trim().toLowerCase();
   const category = filterSelect ? filterSelect.value : '';
   return searchProducts(q, { category });
  }

  function getFallbackProducts(){
   return [
     { id: 'suggest-1', name: 'Porta auriculares premium', price: 2100, category: 'Sugeridos', description: 'Diseño elegante para organizar tus auriculares con estilo.', image: 'img/Soporte de Auriculares.jpg' },
     { id: 'suggest-2', name: 'Soporte de tablet compacto', price: 1800, category: 'Sugeridos', description: 'Ideal para escritorio, cama o cocina con base estable.', image: 'img/Soporte de Celular.png' },
     { id: 'suggest-3', name: 'Mini figura personalizada', price: 2600, category: 'Sugeridos', description: 'Figura decorativa hecha a medida para regalo o decoración.', image: 'img/Cabeza Kratos.png' },
     { id: 'suggest-4', name: 'Llavero de diseño único', price: 950, category: 'Sugeridos', description: 'Un llavero práctico con estética personalizada.', image: 'img/amedida3d_png.png' }
   ];
  }

  function render(list=products){
   const container = document.getElementById('catalog-grid');
   if(!container) return;
   const isEmpty = list.length === 0;
   const itemsToRender = isEmpty ? getFallbackProducts() : list;
   container.innerHTML = '';
   const countEl = document.getElementById('catalog-count');
   if(countEl) countEl.textContent = String(itemsToRender.length);

   if(isEmpty){
     const none = document.createElement('div');
     none.className = 'no-results';
     none.innerHTML = '<strong>No encontramos coincidencias</strong><br>Te dejamos estas opciones para seguir mirando.';
     container.appendChild(none);
   }

   itemsToRender.forEach(p=>{
     const card = document.createElement('div');
     card.className = 'product-card';
     const imageUrl = p.image && p.image.trim() ? p.image : 'img/amedida3d_png.png';
     card.innerHTML = `
       <img src="${imageUrl}" alt="${p.name}">
       <span class="category-pill">${p.category}</span>
       <h4>${p.name}</h4>
       <p>${p.description}</p>
       <div class="price">$${Number(p.price).toFixed(2)}</div>
       <div class="product-actions">
         <button data-id="${p.id}" class="add-cart">Agregar</button>
         <button data-id="${p.id}" class="view">Ver</button>
       </div>
     `;
     container.appendChild(card);
   });
  }

  function searchProducts(q, opts){
   q = (q||'').toLowerCase();
   opts = opts||{};
   return products.filter(p=>{
     if(opts.category && opts.category!=='' && p.category!==opts.category) return false;
     if(!q) return true;
     return (p.name + ' ' + p.description + ' ' + p.category).toLowerCase().includes(q);
   });
  }

  function getCatalogItemById(id){
   return [...products, ...getFallbackProducts()].find(x=>x.id===id);
  }

  function applyFilters(){
   render(getVisibleProducts());
  }

  document.addEventListener('click', function(e){
    const btn = e.target.closest('button');
    if(!btn) return;
    
    // Acción: Agregar al carrito
    if(btn.classList.contains('add-cart')){
      const id = btn.getAttribute('data-id');
      const p = getCatalogItemById(id);
      
      if(p){
        // Si lo encontró en la lista interna
        window.addToCart(p.name, p.price, p.id);
      } else {
        // Plan B: Buscar los datos directamente en el HTML de la tarjeta
        const card = btn.closest('.product-card, .card, .producto, article') || btn.parentElement;
        const name = card.querySelector('h3, h4')?.textContent || 'Producto';
        const priceText = card.querySelector('.price, .precio')?.textContent || '0';
        const price = Number(priceText.replace(/[^0-9.-]+/g, '')) || 0;
        
        window.addToCart(name, price, id);
      }
    }
    
    // Acción: Ver detalles
    if(btn.classList.contains('view')){
      const id = btn.getAttribute('data-id');
      const p = getCatalogItemById(id);
      if(p){
        const detail = `${p.name}\n\n${p.description}\n\nPrecio: $${Number(p.price).toFixed(2)}`;
        window.alert(detail);
      } else {
        window.alert("Detalles no disponibles desde esta página.");
      }
    }
  });

  document.addEventListener('input', function(e){
   if(!e.target) return;
   if(e.target.id==='catalog-search-input' || e.target.id==='filter-category'){
     applyFilters();
   }
  });

  document.addEventListener('change', function(e){
   if(e.target && e.target.id==='filter-category'){
     applyFilters();
   }
  });

  document.addEventListener('keydown', function(e){
   if(e.key === 'Enter' && document.activeElement && document.activeElement.id==='catalog-search-input'){
     e.preventDefault();
     applyFilters();
   }
  });

  window.searchProducts = function(q, opts){ return Promise.resolve(searchProducts(q, opts)); };

  document.addEventListener('DOMContentLoaded', load);
})();
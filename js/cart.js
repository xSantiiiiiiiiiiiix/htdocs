/* Simple cart implementation using localStorage
    Usage: call window.addToCart(name, price) from product buttons
*/
(function(){
  const STORAGE_KEY = 'santi_cart_v1';

  function readCart(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }catch(e){return [];} 
  }

  function writeCart(cart){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
  }

  function formatPrice(n){ return Number(n).toFixed(2); }

  function escapeHtml(s){ return String(s).replace(/[&<>\"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c])); }

  function render(){
    const itemsEl = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const countEl = document.getElementById('cart-count');
    const pageItemsEl = document.getElementById('cart-page-items');
    const pageTotalEl = document.getElementById('cart-page-total');
    const pageCountEl = document.getElementById('cart-page-count');
    const cart = readCart();
    let total = 0;

    if(itemsEl && totalEl && countEl){
      itemsEl.innerHTML = '';
      cart.forEach((it, idx)=>{
        total += Number(it.price || 0);
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `<span>${escapeHtml(it.name)}</span><span>$${formatPrice(it.price)} <button data-idx="${idx}" class="remove">x</button></span>`;
        itemsEl.appendChild(div);
      });
      totalEl.textContent = formatPrice(total);
      countEl.textContent = String(cart.length);
    }

    if(pageItemsEl){
      if(cart.length === 0){
        pageItemsEl.innerHTML = '<div class="empty-cart">Tu carrito está vacío. Elegí algunos productos del catálogo para continuar.</div>';
      } else {
        pageItemsEl.innerHTML = '';
        cart.forEach((it, idx)=>{
          const card = document.createElement('div');
          card.className = 'cart-item-card';
          card.innerHTML = `
            <div class="cart-item-main">
              <span class="cart-item-name">${escapeHtml(it.name)}</span>
              <span class="cart-item-price">$${formatPrice(it.price)}</span>
            </div>
            <button class="remove-btn" data-idx="${idx}">Eliminar</button>
          `;
          pageItemsEl.appendChild(card);
        });
      }
    }

    if(pageTotalEl) pageTotalEl.textContent = formatPrice(cart.reduce((sum, it) => sum + Number(it.price || 0), 0));
    if(pageCountEl) pageCountEl.textContent = String(cart.length);
  }

  function addItem(name, price, id){
    const cart = readCart();
    cart.push({id: id || null, name, price: Number(price)});
    writeCart(cart);
    render();
  }

  function clearCart(){
    writeCart([]);
    render();
  }

  function removeItem(idx){
    const cart = readCart();
    cart.splice(idx,1);
    writeCart(cart);
    render();
  }

  function showToast(message){
    let t = document.getElementById('site-toast');
    if(!t){
      t = document.createElement('div');
      t.id = 'site-toast';
      t.className = 'site-toast';
      document.body.appendChild(t);
    }
    t.textContent = message;
    t.classList.add('visible');
    clearTimeout(t._tm);
    t._tm = setTimeout(()=> t.classList.remove('visible'), 1700);
  }

  function openCartPanel(){
    const panel = document.getElementById('cart-panel');
    if(panel){
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      render();
    }
  }

  function closeCartPanel(){
    const panel = document.getElementById('cart-panel');
    if(panel){
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
    }
  }

  document.addEventListener('click', function(e){
    const target = e.target;
    if(!target) return;

    if(target.id === 'cart-button' || target.closest('#cart-button')){
      openCartPanel();
      return;
    }

    if(target.id === 'close-cart'){
      closeCartPanel();
      return;
    }

    if(target.classList.contains('remove') || target.classList.contains('remove-btn')){
      const idx = Number(target.getAttribute('data-idx'));
      removeItem(idx);
      return;
    }

    if(target.id === 'cart-clear'){
      clearCart();
      return;
    }

    if(target.id === 'checkout'){
      const cart = readCart();
      if(cart.length === 0){
        alert('El carrito está vacío.');
        return;
      }
      fetch('/mp/create_preference', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({items: cart})
      }).then(r=>r.json()).then(data=>{
        if(data && data.init_point){
          window.location.href = data.init_point;
          return;
        }
        throw new Error('No init_point');
      }).catch(()=>{
        const total = cart.reduce((s,it)=>s+Number(it.price||0),0).toFixed(2);
        const mail = 'santiagowaig@gmail.com';
        const subject = encodeURIComponent('Nuevo pedido desde sitio web');
        const bodyText = encodeURIComponent(`Resumen de pedido:\n\n${cart.map(it=>it.name + ' — $' + formatPrice(it.price)).join('\n')}\n\nTotal: $${total}`);
        window.location.href = `mailto:${mail}?subject=${subject}&body=${bodyText}`;
      });
    }
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      closeCartPanel();
      const panel = document.getElementById('chatbot-panel');
      if(panel){
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
      }
    }
  });

  window.addToCart = function(name, price, id){ addItem(name, price, id); showToast(`${name} agregado al carrito`); };

  document.addEventListener('DOMContentLoaded', render);
})();

(function () {
  const KEY = 'amedida3d_cart_v2';
  const read = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (error) { console.error(error); return []; }
  };
  const write = (cart) => {
    localStorage.setItem(KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
  };
  const total = (cart = read()) => cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);

  function render() {
    const cart = read();
    const count = cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
    document.querySelectorAll('[data-cart-count], #cart-count, #cart-page-count').forEach((el) => { el.textContent = count; });
    document.querySelectorAll('[data-cart-total], #cart-total, #cart-page-total').forEach((el) => { el.textContent = total(cart).toFixed(2); });
    const page = document.getElementById('cart-page-items');
    if (!page) return;
    page.innerHTML = cart.length ? cart.map((item, index) => `
      <article class="cart-item-card">
        <div class="cart-item-main"><strong>${escapeHtml(item.name)}</strong><span>$${Number(item.price).toFixed(2)} x ${item.quantity}</span></div>
        <button type="button" class="remove-btn" data-cart-index="${index}">Eliminar</button>
      </article>`).join('') : '<div class="empty-cart">Tu carrito está vacío.</div>';
  }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char])); }
  function add(product) {
    const cart = read();
    const existing = cart.find((item) => String(item.id) === String(product.id));
    if (existing) existing.quantity += 1;
    else cart.push({ id: product.id, name: product.nombre || product.name, price: Number(product.precio ?? product.price), image: product.imagen_url || product.image, quantity: 1 });
    write(cart);
  }
  function remove(index) { const cart = read(); cart.splice(index, 1); write(cart); }
  window.cart = { read, write, total, add, remove };
  window.addToCart = (name, price, id) => add({ id, name, price });
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cart-index], #cart-clear');
    if (!button) return;
    if (button.id === 'cart-clear') write([]);
    else remove(Number(button.dataset.cartIndex));
  });
  document.addEventListener('DOMContentLoaded', render);
  window.addEventListener('cart:updated', render);
})();

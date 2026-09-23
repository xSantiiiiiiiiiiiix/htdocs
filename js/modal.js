(function () {
  function close() {
    const modal = document.getElementById('product-modal');
    if (modal) { modal.hidden = true; document.body.classList.remove('modal-open'); }
  }
  window.productModal = {
    open(product) {
      const modal = document.getElementById('product-modal');
      if (!modal) return;
      modal.querySelector('[data-detail="image"]').src = product.imagen_url || product.image || 'img/amedida3d_png.png';
      modal.querySelector('[data-detail="name"]').textContent = product.nombre || product.name;
      modal.querySelector('[data-detail="category"]').textContent = product.categoria || product.category || 'Sin categoría';
      modal.querySelector('[data-detail="description"]').textContent = product.descripcion || product.description || '';
      modal.querySelector('[data-detail="price"]').textContent = `$${Number(product.precio ?? product.price).toFixed(2)}`;
      modal.querySelector('[data-detail="technical"]').textContent =
        `Peso estimado: ${product.peso_estimado_g ?? 'No informado'} g · Tiempo estimado: ${product.tiempo_estimado_min ?? 'No informado'} min · Material: ${product.material_defecto_id ?? 'No informado'}`;
      modal.querySelector('[data-detail="add"]').onclick = () => window.cart.add(product);
      modal.hidden = false;
      document.body.classList.add('modal-open');
    }
  };
  document.addEventListener('click', (event) => {
    if (event.target.matches('[data-modal-close]') || event.target.id === 'product-modal') close();
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
})();

(function () {
  document.addEventListener('DOMContentLoaded', async () => {
    const list = document.getElementById('purchase-list');
    if (!list) return;
    const user = await window.auth.currentUser();
    if (!user) { window.location.href = 'auth.html?redirect=mis-compras.html'; return; }
    const { data, error } = await window.supabaseClient.from('compras').select('*').eq('user_id', user.id).order('fecha', { ascending: false });
    if (error) { list.textContent = error.message; return; }
    list.innerHTML = data.length ? data.map((purchase) =>
      `<article><strong>Pedido #${purchase.id}</strong><span>${new Date(purchase.fecha).toLocaleString('es-AR')}</span><span>$${Number(purchase.total).toFixed(2)} · ${purchase.estado}</span></article>`
    ).join('') : '<p>Todavía no tenés compras registradas.</p>';
  });
})();

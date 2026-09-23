(function () {
  const client = window.supabaseClient;
  async function init() {
    const form = document.getElementById('order-form');
    if (!form) return;
    const user = await window.auth?.currentUser();
    if (user) {
      form.elements.nombre_cliente.value = user.user_metadata?.nombre || '';
      form.elements.email_cliente.value = user.email || '';
    }
    const summary = document.getElementById('checkout-summary');
    summary.textContent = `Total: $${window.cart.total().toFixed(2)}`;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const items = window.cart.read();
      if (!items.length) { summary.textContent = 'El carrito está vacío.'; return; }
      if (!client) { summary.textContent = 'Configurá Supabase para registrar el pedido.'; return; }
      const values = Object.fromEntries(new FormData(form));
      const { data: session } = await client.auth.getSession();
      const { error } = await client.from('compras').insert({
        user_id: session.session?.user?.id || null,
        nombre_cliente: values.nombre_cliente,
        email_cliente: values.email_cliente,
        telefono: values.telefono || null,
        direccion: values.direccion || null,
        total: window.cart.total(),
        detalle: items,
        estado: 'pendiente'
      });
      if (error) { summary.textContent = error.message; return; }
      window.cart.write([]);
      form.reset();
      summary.textContent = 'Pedido registrado correctamente. ¡Gracias!';
    });
  }
  document.addEventListener('DOMContentLoaded', init);
})();

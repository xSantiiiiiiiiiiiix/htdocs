const SUPABASE_URL = 'https://yftqsypswohrkedeoqtk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmdHFzeXBzd29ocmtlZGVvcXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNDc1NzQsImV4cCI6MjEwMTYyMzU3NH0._6-aBcryxpYhy67JYD6okn1HbDPGZtSmgZ8UXrTOHbY';
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

function mostrarFeedback(texto, tipo = 'info', feedbackId = 'form-feedback') {
  const feedback = document.getElementById(feedbackId);
  if (!feedback) return;
  feedback.textContent = texto;
  feedback.className = `form-feedback ${tipo}`;
}

function setButtonLoading(button, cargando, texto = 'Enviar') {
  if (!button) return;
  button.disabled = cargando;
  button.textContent = cargando ? 'Enviando...' : texto;
}

function renderCatalogo(productos) {
  const contenedor = document.getElementById('catalogo-productos');
  const estado = document.getElementById('catalogo-status');

  if (!contenedor) return;

  if (!productos.length) {
    contenedor.innerHTML = '<p>No hay productos disponibles por el momento.</p>';
    if (estado) estado.textContent = 'No hay productos activos disponibles en este momento.';
    return;
  }

  contenedor.innerHTML = productos.map((producto) => `
    <article class="card producto-card">
      <img src="${producto.imagen_url || 'img/amedida3d_png.png'}" alt="${producto.nombre}" loading="lazy" />
      <div class="producto-info">
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion || 'Producto personalizado disponible.'}</p>
        <div class="producto-meta">
          <span class="precio">$${Number(producto.precio || 0).toLocaleString('es-AR')}</span>
          <span class="stock">Stock: ${Number(producto.stock || 0)}</span>
        </div>
      </div>
    </article>
  `).join('');

  if (estado) estado.textContent = 'Catálogo cargado desde Supabase.';
}

async function cargarCatalogo() {
  if (!supabaseClient) {
    mostrarFeedback('No fue posible conectar con Supabase. Revisá la configuración.', 'error');
    return;
  }

  const contenedor = document.getElementById('catalogo-productos');
  const estado = document.getElementById('catalogo-status');

  if (estado) estado.textContent = 'Cargando catálogo desde Supabase...';
  if (contenedor) contenedor.innerHTML = '<p>Cargando catálogo...</p>';

  try {
    const { data, error } = await supabaseClient
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('id', { ascending: false });

    if (error) throw error;
    renderCatalogo(data || []);
  } catch (error) {
    console.error('Error al cargar productos:', error);
    if (estado) estado.textContent = 'No se pudo cargar el catálogo.';
    if (contenedor) contenedor.innerHTML = '<p>No se pudo cargar el catálogo. Revisá la conexión con Supabase.</p>';
    mostrarFeedback('No se pudo cargar el catálogo desde Supabase.', 'error');
  }
}

async function guardarPedidoPersonalizado(payload) {
  if (!supabaseClient) {
    throw new Error('Supabase no está disponible.');
  }

  const { error } = await supabaseClient.from('pedidos_personalizados').insert([payload]);
  if (error) throw error;
}

async function manejarFormularioPersonalizado(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector('button[type="submit"]');
  const nombreCliente = form.querySelector('[name="nombre_cliente"]')?.value?.trim() || 'Sin nombre';
  const email = form.querySelector('[name="email"]')?.value?.trim() || '';
  const telefono = form.querySelector('[name="telefono"]')?.value?.trim() || null;
  const descripcion = form.querySelector('[name="descripcion_pedido"]')?.value?.trim() || '';

  if (!email || !descripcion) {
    mostrarFeedback('Completá tu email y una descripción del pedido.', 'error', 'form-feedback');
    return;
  }

  setButtonLoading(submitButton, true);
  mostrarFeedback('Enviando tu solicitud...', 'info', 'form-feedback');

  try {
    await guardarPedidoPersonalizado({
      nombre_cliente: nombreCliente,
      email,
      telefono,
      descripcion_pedido: descripcion,
      estado: 'Pendiente',
      fecha_solicitud: new Date().toISOString()
    });

    mostrarFeedback('Tu solicitud fue recibida correctamente. Nos pondremos en contacto pronto.', 'success', 'form-feedback');
    window.alert('Tu solicitud fue recibida correctamente. Nos pondremos en contacto pronto.');
    form.reset();
  } catch (error) {
    console.error('Error al guardar pedido personalizado:', error);
    mostrarFeedback('No se pudo enviar la solicitud. Intentá nuevamente.', 'error', 'form-feedback');
  } finally {
    setButtonLoading(submitButton, false, submitButton?.dataset.label || 'Enviar pedido');
  }
}

async function manejarCotizacion(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector('button[type="submit"]');
  const nombreCliente = form.querySelector('[name="nombre"]')?.value?.trim() || 'Sin nombre';
  const email = form.querySelector('[name="email"]')?.value?.trim() || '';
  const titulo = form.querySelector('[name="titulo"]')?.value?.trim() || '';

  if (!email || !titulo) {
    mostrarFeedback('Completá tu email y el proyecto o pieza que querés cotizar.', 'error', 'form-feedback-cotizacion');
    return;
  }

  setButtonLoading(submitButton, true);
  mostrarFeedback('Enviando tu cotización...', 'info', 'form-feedback-cotizacion');

  try {
    await guardarPedidoPersonalizado({
      nombre_cliente: nombreCliente,
      email,
      telefono: null,
      descripcion_pedido: `Cotización rápida: ${titulo}`,
      estado: 'Pendiente',
      fecha_solicitud: new Date().toISOString()
    });

    mostrarFeedback('Tu cotización fue registrada correctamente.', 'success', 'form-feedback-cotizacion');
    window.alert('Tu cotización fue registrada correctamente.');
    form.reset();
  } catch (error) {
    console.error('Error al guardar cotización:', error);
    mostrarFeedback('No se pudo registrar la cotización. Intentá nuevamente.', 'error', 'form-feedback-cotizacion');
  } finally {
    setButtonLoading(submitButton, false, submitButton?.dataset.label || 'Enviar cotización');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const pedidoForm = document.getElementById('pedido-personalizado-form');
  const cotizacionForm = document.getElementById('form-cotizacion');

  const submitPedido = pedidoForm?.querySelector('button[type="submit"]');
  if (submitPedido && !submitPedido.dataset.label) {
    submitPedido.dataset.label = submitPedido.textContent?.trim() || 'Enviar pedido';
  }

  const submitCotizacion = cotizacionForm?.querySelector('button[type="submit"]');
  if (submitCotizacion && !submitCotizacion.dataset.label) {
    submitCotizacion.dataset.label = submitCotizacion.textContent?.trim() || 'Enviar cotización';
  }

  if (pedidoForm) pedidoForm.addEventListener('submit', manejarFormularioPersonalizado);
  if (cotizacionForm) cotizacionForm.addEventListener('submit', manejarCotizacion);

  cargarCatalogo();
});

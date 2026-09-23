const SUPABASE_URL = 'https://yftqsypswohrkedeoqtk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmdHFzeXBzd29ocmtlZGVvcXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNDc1NzQsImV4cCI6MjEwMTYyMzU3NH0._6-aBcryxpYhy67JYD6okn1HbDPGZtSmgZ8UXrTOHbY';

const supabaseClient = window.supabaseClient;

// Elementos del DOM
const loginSection = document.getElementById('login-section');
const adminSection = document.getElementById('admin-section');
const loginForm = document.getElementById('login-form');
const loginStatus = document.getElementById('login-status');
const logoutBtn = document.getElementById('logout-btn');
const passwordInput = document.getElementById('password');
const emailInput = document.getElementById('admin-email');

const productForm = document.getElementById('producto-form');
const editForm = document.getElementById('edit-product-form');
const formStatus = document.getElementById('form-status');
const lista = document.getElementById('productos-lista');

const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const editModal = document.getElementById('edit-modal');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const submitProductBtn = document.getElementById('submit-product-btn');
const saveEditBtn = document.getElementById('save-edit-btn');

const statTotal = document.getElementById('stat-total');
const statActivos = document.getElementById('stat-activos');
const statValor = document.getElementById('stat-valor');

let productos = [];
let pedidos = [];
let productoEditandoId = null;
let isSubmitting = false;
let stockChart = null;
let salesChart = null;

function mostrarMensaje(texto, esError = false) {
  if (formStatus) {
    formStatus.textContent = texto;
    formStatus.style.color = esError ? '#ef4444' : '#94a3b8';
  }
}

function mostrarMensajeLogin(texto, esError = false) {
  if (loginStatus) {
    loginStatus.textContent = texto;
    loginStatus.style.color = esError ? '#ef4444' : '#94a3b8';
  }
}

function mostrarAdmin() {
  loginSection.classList.add('hidden');
  loginSection.classList.remove('active');
  adminSection.classList.remove('hidden');
  logoutBtn.classList.remove('hidden');
}

function ocultarAdmin() {
  loginSection.classList.remove('hidden');
  loginSection.classList.add('active');
  adminSection.classList.add('hidden');
  logoutBtn.classList.add('hidden');
  if (passwordInput) passwordInput.value = '';
  mostrarMensajeLogin('');
}

function setButtonLoading(button, texto, cargando) {
  if (!button) return;
  button.disabled = cargando;
  button.textContent = cargando ? texto : (button.dataset.originalText || texto);
}

function prepararBotones() {
  if (submitProductBtn && !submitProductBtn.dataset.originalText) {
    submitProductBtn.dataset.originalText = submitProductBtn.textContent;
  }
  if (saveEditBtn && !saveEditBtn.dataset.originalText) {
    saveEditBtn.dataset.originalText = saveEditBtn.textContent;
  }
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn && !loginBtn.dataset.originalText) {
    loginBtn.dataset.originalText = loginBtn.textContent;
  }
}

function renderStats() {
  const total = productos.length;
  const activos = productos.filter((p) => p.activo).length;
  const valor = productos.reduce((acc, p) => acc + Number(p.precio || 0), 0);

  if (statTotal) statTotal.textContent = total;
  if (statActivos) statActivos.textContent = activos;
  if (statValor) statValor.textContent = `$${valor.toLocaleString('es-AR')}`;
}

function renderCharts() {
  if (!productos.length) {
    if (stockChart) stockChart.destroy();
    if (salesChart) salesChart.destroy();
    stockChart = null;
    salesChart = null;
    return;
  }

  const labels = productos.map((producto) => producto.nombre || 'Sin nombre');
  const stockData = productos.map((producto) => Number(producto.stock ?? producto.cantidad ?? 0));
  const directSalesData = productos.map((producto) => Number(producto.precio || 0) * Math.max(1, Number(producto.stock || 0) / 10));
  const pedidosConfirmados = pedidos.filter((pedido) => pedido.estado === 'Confirmado');
  const customRevenue = pedidosConfirmados.reduce((acc, pedido) => acc + Number(pedido.monto_acordado || 0), 0);
  const directRevenue = directSalesData.reduce((acc, value) => acc + value, 0);

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#f8fafc' } } },
    scales: { x: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.08)' } }, y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.08)' } } }
  };

  if (stockChart) stockChart.destroy();
  if (salesChart) salesChart.destroy();

  const stockCtx = document.getElementById('stock-chart');
  const salesCtx = document.getElementById('sales-chart');

 if (stockCtx) {
  stockChart = new Chart(stockCtx, {
    type: 'bar',
    data: {
      labels: labels, // Asegurate de que este array exista previamente
      datasets: [{
        label: 'Stock disponible',
        data: stockData, // Asegurate de que este array exista previamente
        backgroundColor: '#3b82f6',
        borderColor: '#60a5fa',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Stock de Productos' // Podés cambiar este título
        }
      }
    }
  });
}

  if (salesCtx) {
    salesChart = new Chart(salesCtx, {
      type: 'bar',
      data: {
        labels: ['Productos', 'Pedidos personalizados'],
        datasets: [{
          label: 'Ingresos estimados',
          data: [directRevenue, customRevenue],
          backgroundColor: ['#22c55e', '#f59e0b'],
          borderColor: ['#86efac', '#fbbf24'],
          borderWidth: 1
        }]
      },
      options: commonOptions
    });
  }
}

function getFilteredProductos() {
  const query = (searchInput?.value || '').toLowerCase().trim();
  const categoria = categoryFilter?.value || '';

  return productos.filter((producto) => {
    const matchesQuery = !query || 
      (producto.nombre || '').toLowerCase().includes(query) || 
      (producto.descripcion || '').toLowerCase().includes(query);
    const matchesCategory = !categoria || (producto.categoria || 'Sin categoría') === categoria;
    return matchesQuery && matchesCategory;
  });
}

function renderProductos() {
  const productosFiltrados = getFilteredProductos();

  if (!productosFiltrados.length) {
    lista.innerHTML = '<p style="padding: 16px; color: var(--muted);">No hay productos que coincidan con la búsqueda.</p>';
    return;
  }

  lista.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Imagen</th>
          <th>Producto</th>
          <th>Precio</th>
          <th>Categoría</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${productosFiltrados.map((producto) => `
          <tr>
            <td><img class="thumb" src="${producto.imagen_url || 'img/amedida3d_png.png'}" alt="${producto.nombre}" /></td>
            <td><strong>${producto.nombre}</strong></td>
            <td>$${Number(producto.precio || 0).toLocaleString('es-AR')}</td>
            <td>${producto.categoria || 'Sin categoría'}</td>
            <td><span class="badge ${producto.activo ? 'active' : 'inactive'}">${producto.activo ? 'Activo' : 'Inactivo'}</span></td>
            <td class="actions">
              <button class="btn-edit" data-action="edit" data-id="${producto.id}">Editar</button>
              <button class="btn-toggle" data-action="toggle" data-id="${producto.id}" data-activo="${producto.activo}">${producto.activo ? 'Desactivar' : 'Activar'}</button>
              <button class="btn-danger" data-action="delete" data-id="${producto.id}">Eliminar</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function cargarDatos() {
  try {
    mostrarMensaje('Cargando catálogo...');
    const [{ data: productosData, error: productosError }, { data: pedidosData, error: pedidosError }] = await Promise.all([
      supabaseClient.from('productos').select('*').order('id', { ascending: false }),
      supabaseClient.from('pedidos_personalizados').select('*').order('id', { ascending: false })
    ]);

    if (productosError) throw productosError;
    if (pedidosError) throw pedidosError;

    productos = productosData || [];
    pedidos = pedidosData || [];

    renderStats();
    renderCharts();
    renderProductos();
    renderPedidos();
    mostrarMensaje('Catálogo cargado correctamente.');
  } catch (error) {
    console.error('Error al cargar datos:', error);
    if (lista) lista.innerHTML = `<p style="color:#ef4444; padding:16px;">Error de conexión: ${error.message || 'Verificá permisos o conectividad.'}</p>`;
    mostrarMensaje(`Error al cargar datos: ${error.message || 'Revisá permisos RLS o la red.'}`, true);
  }
}

function renderPedidos() {
  const contenedor = document.getElementById('pedidos-lista');
  if (!contenedor) return;

  if (!pedidos.length) {
    contenedor.innerHTML = '<p style="padding: 12px; color: var(--muted);">No hay pedidos personalizados todavía.</p>';
    return;
  }

  contenedor.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Email</th>
          <th>Descripción</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th>Monto</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${pedidos.map((pedido) => `
          <tr>
            <td>${pedido.nombre_cliente || 'Sin nombre'}</td>
            <td>${pedido.email || ''}</td>
            <td>${pedido.descripcion_pedido || ''}</td>
            <td>${pedido.fecha_solicitud ? new Date(pedido.fecha_solicitud).toLocaleString('es-AR') : ''}</td>
            <td>
              <select data-pedido-id="${pedido.id}" class="pedido-status-select">
                <option value="Pendiente" ${pedido.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                <option value="Confirmado" ${pedido.estado === 'Confirmado' ? 'selected' : ''}>Confirmado</option>
                <option value="Rechazado" ${pedido.estado === 'Rechazado' ? 'selected' : ''}>Rechazado</option>
              </select>
            </td>
            <td>${pedido.monto_acordado ? `$${Number(pedido.monto_acordado).toLocaleString('es-AR')}` : '—'}</td>
            <td>
              ${pedido.estado === 'Confirmado' ? `<button class="btn-secondary" data-action="monto" data-id="${pedido.id}">Registrar monto</button>` : ''}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function actualizarEstadoPedido(id, estado) {
  try {
    const payload = { estado };
    if (estado === 'Confirmado') {
      payload.monto_acordado = payload.monto_acordado || 0;
    }
    const { error } = await supabaseClient.from('pedidos_personalizados').update(payload).eq('id', id);
    if (error) throw error;
    await cargarDatos();
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    mostrarMensaje(`Error al actualizar pedido: ${error.message}`, true);
  }
}

async function registrarMontoPedido(id) {
  const pedido = pedidos.find((item) => String(item.id) === String(id));
  const monto = window.prompt(`Ingresá el monto acordado para ${pedido?.nombre_cliente || 'este pedido'}:`, pedido?.monto_acordado || '');
  if (monto === null) return;
  const valor = Number(monto);
  if (Number.isNaN(valor)) {
    mostrarMensaje('Ingresá un monto numérico válido.', true);
    return;
  }

  try {
    const { error } = await supabaseClient.from('pedidos_personalizados').update({ monto_acordado: valor }).eq('id', id);
    if (error) throw error;
    await cargarDatos();
  } catch (error) {
    console.error('Error al registrar monto:', error);
    mostrarMensaje(`Error al registrar monto: ${error.message}`, true);
  }
}

function abrirModalEdicion(producto) {
  productoEditandoId = producto.id;
  document.getElementById('edit-nombre').value = producto.nombre || '';
  document.getElementById('edit-precio').value = producto.precio || 0;
  document.getElementById('edit-categoria').value = producto.categoria || 'Soportes';
  document.getElementById('edit-imagen_url').value = producto.imagen_url || '';
  document.getElementById('edit-descripcion').value = producto.descripcion || '';
  document.getElementById('edit-activo').checked = Boolean(producto.activo);
  editModal.classList.remove('hidden');
}

function cerrarModalEdicion() {
  productoEditandoId = null;
  editModal.classList.add('hidden');
  if (editForm) editForm.reset();
}

// INICIO DE SESIÓN (Enter y Clic capturados automáticamente por el evento submit del form)
if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const loginBtn = document.getElementById('login-btn');
    const passValue = passwordInput ? passwordInput.value.trim() : '';

    if (!passValue) {
      mostrarMensajeLogin('Ingresá una contraseña.', true);
      return;
    }

    isSubmitting = true;
    setButtonLoading(loginBtn, 'Ingresando...', true);

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: emailInput.value.trim(),
        password: passValue
      });
      if (error) throw error;
      if (!(await window.auth.hasRole(data.user, 'admin'))) {
        await supabaseClient.auth.signOut();
        throw new Error('Esta cuenta no tiene permisos de administrador.');
      }
      mostrarAdmin();
      await cargarDatos();
    } catch (error) {
      mostrarMensajeLogin(`Error: ${error.message}`, true);
    } finally {
      isSubmitting = false;
      setButtonLoading(loginBtn, 'Entrar', false);
    }
  });
}

// CREAR PRODUCTO
async function crearProducto(event) {
  event.preventDefault();
  if (isSubmitting) return;

  const nombre = document.getElementById('nombre').value.trim();
  const descripcion = document.getElementById('descripcion').value.trim();
  const precio = Number(document.getElementById('precio').value);
  const imagen_url = document.getElementById('imagen_url').value.trim();
  const categoria = document.getElementById('categoria').value;
  const activo = document.getElementById('activo').checked;

  if (!nombre || !descripcion || Number.isNaN(precio)) {
    mostrarMensaje('Completá nombre, descripción y precio.', true);
    return;
  }

  isSubmitting = true;
  setButtonLoading(submitProductBtn, 'Guardando...', true);
  mostrarMensaje('Guardando producto...');

  try {
    const payload = {
      nombre,
      descripcion,
      precio,
      imagen_url: imagen_url || 'img/amedida3d_png.png',
      activo
    };

    if (categoria) {
      payload.categoria = categoria;
    }

    const { error } = await supabaseClient.from('productos').insert([payload]);

    if (error) throw error;

    productForm.reset();
    document.getElementById('activo').checked = true;
    mostrarMensaje('¡Producto cargado con éxito!');
    await cargarDatos();
  } catch (error) {
    console.error('Error al insertar producto:', error);
    mostrarMensaje(`Error al cargar producto: ${error.message || 'Revisá permisos RLS.'}`, true);
  } finally {
    isSubmitting = false;
    setButtonLoading(submitProductBtn, 'Cargar Producto', false);
  }
}

// GUARDAR EDICIÓN
async function guardarEdicion(event) {
  event.preventDefault();
  if (!productoEditandoId || isSubmitting) return;

  const nombre = document.getElementById('edit-nombre').value.trim();
  const descripcion = document.getElementById('edit-descripcion').value.trim();
  const precio = Number(document.getElementById('edit-precio').value);
  const imagen_url = document.getElementById('edit-imagen_url').value.trim();
  const categoria = document.getElementById('edit-categoria').value;
  const activo = document.getElementById('edit-activo').checked;

  if (!nombre || !descripcion || Number.isNaN(precio)) {
    mostrarMensaje('Completá nombre, descripción y precio.', true);
    return;
  }

  isSubmitting = true;
  setButtonLoading(saveEditBtn, 'Guardando...', true);
  mostrarMensaje('Guardando cambios...');

  try {
    const payload = {
      nombre,
      descripcion,
      precio,
      imagen_url: imagen_url || 'img/amedida3d_png.png',
      activo
    };

    if (categoria) {
      payload.categoria = categoria;
    }

    const { error } = await supabaseClient
      .from('productos')
      .update(payload)
      .eq('id', productoEditandoId);

    if (error) throw error;

    cerrarModalEdicion();
    mostrarMensaje('¡Producto actualizado con éxito!');
    await cargarDatos();
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    mostrarMensaje(`Error al actualizar producto: ${error.message || 'Revisá permisos RLS.'}`, true);
  } finally {
    isSubmitting = false;
    setButtonLoading(saveEditBtn, 'Guardar cambios', false);
  }
}

// CAMBIAR ESTADO
async function cambiarEstado(id, activo) {
  if (isSubmitting) return;
  isSubmitting = true;
  try {
    const { error } = await supabaseClient.from('productos').update({ activo }).eq('id', id);
    if (error) throw error;
    mostrarMensaje('Estado actualizado correctamente.');
    await cargarDatos();
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    mostrarMensaje(`Error al cambiar estado: ${error.message}`, true);
  } finally {
    isSubmitting = false;
  }
}

// ELIMINAR PRODUCTO
async function eliminarProducto(id) {
  const confirmar = window.confirm('¿Seguro que querés eliminar este producto?');
  if (!confirmar || isSubmitting) return;

  isSubmitting = true;
  try {
    const { error } = await supabaseClient.from('productos').delete().eq('id', id);
    if (error) throw error;
    mostrarMensaje('Producto eliminado correctamente.');
    await cargarDatos();
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    mostrarMensaje(`Error al eliminar producto: ${error.message}`, true);
  } finally {
    isSubmitting = false;
  }
}

// LISTENERS DE EVENTOS
if (logoutBtn) logoutBtn.addEventListener('click', () => window.auth.signOut());
if (productForm) productForm.addEventListener('submit', crearProducto);
if (editForm) editForm.addEventListener('submit', guardarEdicion);
if (cancelEditBtn) cancelEditBtn.addEventListener('click', cerrarModalEdicion);

if (searchInput) searchInput.addEventListener('input', renderProductos);
if (categoryFilter) categoryFilter.addEventListener('change', renderProductos);

async function ejecutarConsultaSQL() {
  const sqlText = document.getElementById('sql-input')?.value?.trim();
  const sqlStatus = document.getElementById('sql-status');
  const sqlResults = document.getElementById('sql-results');
  const runBtn = document.getElementById('run-sql-btn');

  if (!sqlText) {
    if (sqlStatus) {
      sqlStatus.textContent = 'Escribí una consulta SQL antes de ejecutar.';
      sqlStatus.className = 'status sql-error';
    }
    return;
  }

  if (runBtn) {
    runBtn.disabled = true;
    runBtn.textContent = 'Ejecutando...';
  }

  if (sqlStatus) {
    sqlStatus.textContent = 'Ejecutando consulta...';
    sqlStatus.className = 'status';
  }

  if (sqlResults) {
    sqlResults.innerHTML = '<p>Cargando resultados...</p>';
  }

  try {
    const { data, error } = await supabaseClient.rpc('exec_sql', { query: sqlText }).catch((rpcError) => ({ data: null, error: rpcError }));

    if (error) {
      if (error.message && error.message.includes('Could not find the function')) {
        sqlResults.innerHTML = '<p class="sql-error">La función RPC exec_sql no existe aún en Supabase. Podés crearla desde SQL Editor o usar una consulta directa si tu proyecto lo permite.</p>';
        if (sqlStatus) {
          sqlStatus.textContent = 'RPC no disponible.';
          sqlStatus.className = 'status sql-error';
        }
        return;
      }
      throw error;
    }

    let rows = data;
    if (typeof rows === 'string') {
      try {
        rows = JSON.parse(rows);
      } catch (parseError) {
        rows = null;
      }
    }

    if (rows && typeof rows === 'object' && !Array.isArray(rows)) {
      if (Array.isArray(rows.rows)) {
        rows = rows.rows;
      } else if (rows.data && Array.isArray(rows.data)) {
        rows = rows.data;
      } else if (rows.result && Array.isArray(rows.result)) {
        rows = rows.result;
      } else {
        rows = [rows];
      }
    }

    if (Array.isArray(rows) && rows.length) {
      const headers = Object.keys(rows[0]);
      sqlResults.innerHTML = `
        <table>
          <thead><tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr></thead>
          <tbody>${rows.map((row) => `<tr>${headers.map((header) => `<td>${row[header] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      `;
      if (sqlStatus) {
        sqlStatus.textContent = 'Consulta ejecutada correctamente.';
        sqlStatus.className = 'status sql-success';
      }
    } else {
      sqlResults.innerHTML = '<p>No se devolvieron filas.</p>';
      if (sqlStatus) {
        sqlStatus.textContent = 'Comando ejecutado correctamente.';
        sqlStatus.className = 'status sql-success';
      }
    }
  } catch (error) {
    console.error('Error al ejecutar consulta SQL:', error);
    if (sqlResults) {
      sqlResults.innerHTML = `<p class="sql-error">${error.message || 'No se pudo ejecutar la consulta.'}</p>`;
    }
    if (sqlStatus) {
      sqlStatus.textContent = `Error: ${error.message || 'No se pudo ejecutar.'}`;
      sqlStatus.className = 'status sql-error';
    }
  } finally {
    if (runBtn) {
      runBtn.disabled = false;
      runBtn.textContent = 'Ejecutar Consulta';
    }
  }
}

const runSqlBtn = document.getElementById('run-sql-btn');
if (runSqlBtn) {
  runSqlBtn.addEventListener('click', ejecutarConsultaSQL);
}

document.addEventListener('click', async (event) => {
  const target = event.target.closest('button');
  if (!target) return;

  const action = target.dataset.action;
  const id = target.dataset.id;

  if (action === 'edit' && id) {
    const producto = productos.find((item) => String(item.id) === String(id));
    if (producto) abrirModalEdicion(producto);
    return;
  }

  if (action === 'toggle' && id) {
    const activo = target.dataset.activo === 'true' ? false : true;
    await cambiarEstado(id, activo);
    return;
  }

  if (action === 'delete' && id) {
    await eliminarProducto(id);
    return;
  }

  if (action === 'monto' && id) {
    await registrarMontoPedido(id);
  }
});

document.addEventListener('change', async (event) => {
  const select = event.target.closest('.pedido-status-select');
  if (!select) return;

  const id = select.dataset.pedidoId;
  const estado = select.value;
  if (!id) return;

  await actualizarEstadoPedido(id, estado);
});

// INICIALIZACIÓN
prepararBotones();
renderCharts();
window.auth.currentUser().then(async (user) => {
  if (user && await window.auth.hasRole(user, 'admin')) {
    mostrarAdmin();
    await cargarDatos();
    return;
  }
  ocultarAdmin();
}).catch((error) => mostrarMensajeLogin(error.message, true));
const SUPABASE_URL = 'https://yftqsypswohrkedeoqtk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmdHFzeXBzd29ocmtlZGVvcXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNDc1NzQsImV4cCI6MjEwMTYyMzU3NH0._6-aBcryxpYhy67JYD6okn1HbDPGZtSmgZ8UXrTOHbY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('form-cotizacion');

function formatearPrecio(precio) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(precio || 0);
}

function obtenerImagenProducto(producto) {
  return producto.imagen_url || 'img/amedida3d_png.png';
}

function llenarFormularioDesdeProducto(producto) {
  const tituloInput = document.getElementById('titulo');
  const nombreInput = document.getElementById('nombre');

  if (tituloInput) {
    tituloInput.value = producto.nombre || '';
  }

  if (nombreInput) {
    nombreInput.focus();
  }
}

async function cargarCatalogo() {
  const contenedor = document.getElementById('catalogo-productos');
  const estado = document.getElementById('catalogo-status');

  if (!contenedor) {
    return;
  }

  if (estado) {
    estado.textContent = 'Cargando catálogo...';
  }

  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*, categorias(nombre), materiales(nombre, tipo)')
      .eq('activo', true);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      contenedor.innerHTML = '<p>No hay productos disponibles por el momento.</p>';
      if (estado) {
        estado.textContent = 'Sin productos disponibles';
      }
      return;
    }

    contenedor.innerHTML = '';

    const fragmento = document.createDocumentFragment();

    data.forEach((producto) => {
      const tarjeta = document.createElement('article');
      tarjeta.className = 'card';

      const categoriaNombre = producto.categorias?.nombre || 'Sin categoría';
      const materialNombre = producto.materiales?.nombre || 'Material a definir';
      const precio = producto.precio || 0;

      tarjeta.innerHTML = `
        <img src="${obtenerImagenProducto(producto)}" alt="${producto.nombre}" style="width:100%;height:180px;object-fit:cover;border-radius:8px;">
        <h3>${producto.nombre}</h3>
        <p><strong>${categoriaNombre}</strong></p>
        <p>${producto.descripcion || 'Producto hecho a medida.'}</p>
        <p><strong>Material:</strong> ${materialNombre}</p>
        <p><strong>Precio:</strong> ${formatearPrecio(precio)}</p>
        <button type="button" class="btn-solicitar">Solicitar</button>
      `;

      const boton = tarjeta.querySelector('.btn-solicitar');
      boton.addEventListener('click', () => {
        llenarFormularioDesdeProducto(producto);
        document.getElementById('titulo').value = producto.nombre;
        document.getElementById('nombre').focus();
        alert(`Has seleccionado ${producto.nombre}. Completa el formulario de cotización.`);
      });

      fragmento.appendChild(tarjeta);
    });

    contenedor.appendChild(fragmento);

    if (estado) {
      estado.textContent = 'Catálogo actualizado';
    }
  } catch (error) {
    console.error('Error al cargar productos desde Supabase:', error);
    contenedor.innerHTML = '<p>No se pudo cargar el catálogo en este momento.</p>';
    if (estado) {
      estado.textContent = 'No se pudo cargar el catálogo';
    }
  }
}

if (form) {
  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const nombreInput = document.getElementById('nombre');
    const emailInput = document.getElementById('email');
    const tituloInput = document.getElementById('titulo');

    const nombre = nombreInput.value.trim();
    const email = emailInput.value.trim();
    const titulo = tituloInput.value.trim();

    if (!nombre || !email || !titulo) {
      alert('Por favor completa todos los campos del formulario.');
      return;
    }

    try {
      // Insertar el cliente y obtener el id generado.
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .insert([{ nombre, email }])
        .select()
        .single();

      if (clienteError) {
        throw clienteError;
      }

      // Insertar la cotización asociada al cliente.
      const { error: cotizacionError } = await supabase
        .from('cotizaciones')
        .insert([
          {
            cliente_id: cliente.id,
            titulo_proyecto: titulo,
            archivo_stl_url: 'temporal/archivo-stl.pendiente'
          }
        ]);

      if (cotizacionError) {
        throw cotizacionError;
      }

      alert('Cotización enviada correctamente. Nos contactaremos pronto.');
      form.reset();
    } catch (error) {
      console.error('Error al enviar la cotización:', error);
      alert('No se pudo enviar la cotización. Inténtalo nuevamente.');
    }
  });
}

document.addEventListener('DOMContentLoaded', cargarCatalogo);

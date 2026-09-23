/* Lightweight chatbot UI. General requests answered locally; personalized requests open an email to the site owner.
   Replace 'amedida3d.ar@gmail.com' with your target Gmail address if needed.
*/
(function(){
  const mailTo = 'santiagowaig@gmail.com';

  function appendMessage(text, who){
    const el = document.createElement('div');
    el.className = 'chat-message ' + (who==='bot' ? 'bot' : 'user');
    el.textContent = text;
    const box = document.getElementById('chat-messages');
    if(!box) return;
    el.classList.add('new');
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
  }

  function isPersonalized(msg){
    const k = ['personal','pedido','personalizado','diseño','modelo','medida'];
    msg = msg.toLowerCase();
    return k.some(t=> msg.includes(t)) || msg.length>140;
  }

  document.addEventListener('click', function(e){
    if(e.target && (e.target.id==='chatbot-button' || e.target.classList.contains('chat-action'))){
      const panel = document.getElementById('chatbot-panel');
      panel.classList.add('open'); panel.setAttribute('aria-hidden','false');
      appendMessage('Hola! ¿En qué puedo ayudarte? Puedes preguntar por servicios o escribir "personalizado" para pedidos a medida.', 'bot');
    }
    if(e.target && e.target.id==='close-chat'){
      const panel = document.getElementById('chatbot-panel');
      panel.classList.remove('open'); panel.setAttribute('aria-hidden','true');
    }
  });

  document.getElementById && document.addEventListener('submit', function(ev){
    if(ev.target && ev.target.id==='chat-form'){
      ev.preventDefault();
      const input = document.getElementById('chat-input');
      const text = input.value.trim();
      if(!text) return;
      appendMessage(text,'user');
      input.value = '';
      setTimeout(async ()=>{
        if(isPersonalized(text)){
          appendMessage('Parece un pedido personalizado. ¿Deseas enviar este pedido por email para que lo revisemos? Pulsa el botón para abrir tu gestor de correo.', 'bot');
          const btn = document.createElement('button');
          btn.textContent = 'Enviar por email';
          btn.addEventListener('click', ()=>{
            const subject = encodeURIComponent('Pedido personalizado desde sitio web');
            const body = encodeURIComponent('Mensaje del usuario:%0A%0A' + text + '%0A%0A--%0AEnviado desde el chatbot.');
            window.location.href = `mailto:${mailTo}?subject=${subject}&body=${body}`;
          });
          const box = document.getElementById('chat-messages');
          box.appendChild(btn);
          box.scrollTop = box.scrollHeight;
          return;
        }

        // Try to search catalogue for matching products
        if(window.searchProducts){
          const results = await window.searchProducts(text || '');
          if(results && results.length){
            appendMessage(`Encontré ${results.length} producto(s):`, 'bot');
            const box = document.getElementById('chat-messages');
            results.slice(0,6).forEach(p=>{
              const node = document.createElement('div'); node.className='chat-message bot';
              node.style.display='flex'; node.style.flexDirection='column'; node.style.gap='6px';
              node.innerHTML = `<div><strong>${p.name}</strong> — $${Number(p.price).toFixed(2)}</div><div style="font-size:13px;color:#444">${p.description}</div>`;
              const btn = document.createElement('button'); btn.textContent='Agregar al carrito'; btn.style.marginTop='6px';
              btn.addEventListener('click', ()=>{ window.addToCart(p.name, p.price, p.id); appendMessage(p.name + ' agregado al carrito.', 'bot'); });
                node.appendChild(btn);
                node.classList.add('new');
                box.appendChild(node);
            });
            box.scrollTop = box.scrollHeight;
            return;
          }
        }

        // default canned response
        appendMessage('Gracias por tu consulta. Podemos ayudarte con eso. Para pedidos personalizados, contanos más detalles o pulsa el botón de enviar por email.', 'bot');
      }, 600);
    }
  });
})();
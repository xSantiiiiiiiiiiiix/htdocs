MercadoPago integration (frontend placeholder)
=============================================

What this project includes
- The frontend attempts to POST the cart to `/mp/create_preference` and expects a JSON response containing an `init_point` URL returned by MercadoPago.

Why a server is required
- Creating a MercadoPago Checkout preference requires your MercadoPago access token (private). You must create the preference server-side and return the `init_point` or `preference.id` to the client.

Minimal Express example (Node.js)
--------------------------------
```js
// Install: npm install express node-fetch mercadopago
const express = require('express');
const mercadopago = require('mercadopago');
mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN });
const app = express(); app.use(express.json());

app.post('/mp/create_preference', async (req, res) => {
  const items = (req.body.items || []).map(it => ({ title: it.name, quantity: 1, unit_price: Number(it.price) }));
  try{
    const preference = await mercadopago.preferences.create({ items });
    res.json({ init_point: preference.body.init_point, preference_id: preference.body.id });
  }catch(err){ console.error(err); res.status(500).json({error:'create failed'}); }
});

app.listen(3000);
```

Frontend expectations
- The frontend sends `{ items: [ {id,name,price}, ... ] }` and will redirect the browser to `init_point` returned by the server.
- If the server or MercadoPago is not available, the frontend gracefully falls back to opening the default mail client with the order summary.

Security notes
- Keep your `MP_ACCESS_TOKEN` secret (server env var). Do not expose it in frontend code.
- Validate item prices and IDs server-side if you rely on pricing or inventory.

Support
- If you'd like, I can scaffold a minimal Node/Express endpoint in this repo and a README showing deployment to Heroku/Vercel. Ask and I'll add it.

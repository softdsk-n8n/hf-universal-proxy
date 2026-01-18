const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.all('/proxy', async (req, res) => {
  const target = req.query.target;
  if (!target) {
    return res.status(400).json({ error: 'Missing target param' });
  }

  try {
    const headers = { ...req.headers };
    delete headers.host;

    const response = await axios({
      url: target,
      method: req.method,
      headers,
      data: req.body,
      validateStatus: () => true
    });

    res
      .status(response.status)
      .set(response.headers)
      .send(response.data);
  } catch (e) {
    console.error('Proxy error:', e.message);
    res
      .status(502)
      .json({ error: 'Proxy error', details: e.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Proxy listening on port ${port}`);
});

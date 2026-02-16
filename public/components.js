const req = (method, key, body) =>
  fetch(`${window.api_url}/${key ? encodeURIComponent(key) : ''}`, {
    method,
    headers: {
      ...(localStorage.token ? { Authorization: `Bearer ${localStorage.token}` } : {}),
    },
    body: body instanceof Blob || typeof body === 'string' ? body : JSON.stringify(body),
    credentials: 'include',
  });

const toJson = (r) => {
  const ct = (r.headers.get('content-type') || '').toLowerCase();
  if (!ct.includes('application/json')) {
    return r.text().then((t) => {
      throw new Error('Server returned non-JSON (HTML?): ' + (t.slice(0, 60) || r.status));
    });
  }
  return r.json();
};

const list = () => req('PROPFIND').then(toJson);

export const components = {
  "hello-world": {
    prop: (data) => `${data} World`,
    render: function(data) { 
      return this.prop(data); 
    }
  },
  "file-widget": async () => {
    try {
      const files = await list();
      const escHtml = (s) =>
        String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
      const enc = (s) => encodeURIComponent(String(s));
      const style = `<style>.w-c{font:13px sans-serif;border:1px solid #ddd;border-radius:6px;overflow:hidden;max-width:320px}.w-i{display:flex;justify-content:space-between;padding:8px 12px;border-bottom:1px solid #f0f0f0;align-items:center}.w-i:hover{background:#f9f9f9}.w-d{border:none;background:none;cursor:pointer;opacity:.5;transition:.2s}.w-d:hover{opacity:1}.w-u{display:block;padding:10px;background:#f5f5f5;text-align:center;cursor:pointer;color:#555;font-weight:600;transition:.2s}.w-u:hover{background:#eee}.w-e{padding:20px;text-align:center;color:#999}</style>`;
      
      const items = Array.isArray(files) ? files.map(item => `
        <div class="w-i">
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-right:10px">${escHtml(item.name ?? "")}</span>
          <button class="w-d" data-vl-action="download" data-name="${enc(item.name ?? "")}" title="Download">⬇️</button>
          <button class="w-d" data-vl-action="delete" data-name="${enc(item.name ?? "")}" title="Delete">🗑️</button>
        </div>`
      ).join('') : '';

      const upload = `
        <label class="w-u">
          📂 Upload
          <input type="file" style="display:none" data-vl-action="upload">
        </label>`;

      return style + `<div class="w-c">${items || '<div class="w-e">No files</div>'}${upload}</div>`;
    } catch (err) {
      const style = `<style>.w-c{font:13px sans-serif;border:1px solid #ddd;border-radius:6px;overflow:hidden;max-width:320px}.w-e{padding:20px;text-align:center;color:#999}</style>`;
      return style + `<div class="w-c"><div class="w-e">Please <button data-vl-action="login" style="background:#007bff;color:white;border:none;padding:5px 10px;border-radius:3px;cursor:pointer">Login</button> to view files</div></div>`;
    }
  }
};

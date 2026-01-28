window.custom = {
  "hello-world": (data) => `Hello ${data}`,
  "hello-world-2": {
    prop: (data) => `${data} World`,
    render: function(data) { 
      return this.prop(data); 
    }
  },
  "file-widget": async () => {
    try {
      const list = await window.list();
      const style = `<style>.w-c{font:13px sans-serif;border:1px solid #ddd;border-radius:6px;overflow:hidden;max-width:320px}.w-i{display:flex;justify-content:space-between;padding:8px 12px;border-bottom:1px solid #f0f0f0;align-items:center}.w-i:hover{background:#f9f9f9}.w-d{border:none;background:none;cursor:pointer;opacity:.5;transition:.2s}.w-d:hover{opacity:1}.w-u{display:block;padding:10px;background:#f5f5f5;text-align:center;cursor:pointer;color:#555;font-weight:600;transition:.2s}.w-u:hover{background:#eee}.w-e{padding:20px;text-align:center;color:#999}</style>`;
      
      const items = Array.isArray(list) ? list.map(item => `
        <div class="w-i">
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-right:10px">${item.name}</span>
          <button class="w-d" onclick="window.download('${item.name}')" title="Download">⬇️</button>
          <button class="w-d" onclick="(async()=>{await window.purge('${item.name}');location.reload()})()" title="Delete">🗑️</button>
        </div>`
      ).join('') : '';

      const upload = `
        <label class="w-u">
          📂 Upload
          <input type="file" style="display:none" onchange="(async()=>{const f=this.files[0];if(f){await window.put(f.name,f);location.reload()})()">
        </label>`;

      return style + `<div class="w-c">${items || '<div class="w-e">No files</div>'}${upload}</div>`;
    } catch (err) {
      const style = `<style>.w-c{font:13px sans-serif;border:1px solid #ddd;border-radius:6px;overflow:hidden;max-width:320px}.w-e{padding:20px;text-align:center;color:#999}</style>`;
      return style + `<div class="w-c"><div class="w-e">Please <button onclick="window.login()" style="background:#007bff;color:white;border:none;padding:5px 10px;border-radius:3px;cursor:pointer">Login</button> to view files</div></div>`;
    }
  }
}

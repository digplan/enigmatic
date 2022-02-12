class ScriptCache extends HTMLElement {
  connectedCallback() {
    const ver = this.getAttribute('src') + ';' + this.getAttribute('v');
    const cached = localStorage.getItem(ver);
    if (!cached) return this.get(this.getAttribute('src'));
    if (this.hasAttribute('debug'))
      console.log('retrieving script cache ' + ver);
    eval(cached);
  }
  async get(ver) {
    const [u, h] = ver.split(';');
    const code = await (await fetch(u)).text();
    const hash = (await this.hash(code)).slice(0, 10);
    const k = u + ';' + hash;
    if (this.hasAttribute('debug'))
      console.log(k + ' setting script cache ' + code);
    localStorage.setItem(k, code);
    eval(code);
  }
  async hash(s) {
    const utf8 = new TextEncoder().encode(s);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  }
}
customElements.define('script-cache', ScriptCache);
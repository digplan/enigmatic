class BeeMap extends Map {
  constructor(jsonlFile, timems) {
    super();
    this.jsonlFile = jsonlFile;
    this.timems = timems;
    this.intervalId = null;
    
    // Load existing data
    this.load();
    
    // Set up interval to save
    if (!timems) return;
    this.intervalId = setInterval(() => {
      this.save();
    }, timems);
  }
  
  async load() {
    const file = Bun.file(this.jsonlFile);
    if (!(await file.exists())) return;
      
    const text = await file.text();
    const lines = text.trim().split('\n').filter(line => line.length > 0);
      
    for (const line of lines) {
      const [key, value] = JSON.parse(line);
      super.set(key, value);
    }
  }
  
  async save() {
    const lines = [];
    for (const [key, value] of this) {
      lines.push(JSON.stringify([key, value]));
    }
    await Bun.write(this.jsonlFile, lines.join('\n') + '\n');
  }
  
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export { BeeMap };

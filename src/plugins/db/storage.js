import jsonc from 'jsonc-data';

export default function(app) {
  app.db = new jsonc(import.meta.resolve(`#data/db.jsonl`))
  app.routes = { 
    ...app.routes, 
    "POST /api": (req, resp, data) => {
       db.save(data);
    },
    "GET /api": (req, resp, data) => {
      db.save(data);
   } 
  }
}
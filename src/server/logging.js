export default function(app) { 
  app.routes.always.push((req, resp, data) => console.log(req.method, req.url));
}

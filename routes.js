export default {
  "GET /": (req, res) => {
      return new Response("Hello World", { headers: { "Content-Type": "text/plain" } });
  },
  "POST /": (req, res) => {
    return new Response("Hello World", { headers: { "Content-Type": "text/plain" } });
  },
  "PUT /": (req, res) => {
    return new Response("Hello World", { headers: { "Content-Type": "text/plain" } });
  },
  "DELETE /": (req, res) => {
    return new Response("Hello World", { headers: { "Content-Type": "text/plain" } });
  },
  "PATCH /": (req, res) => {
    return new Response("Hello World", { headers: { "Content-Type": "text/plain" } });
  },
  "OPTIONS /": (req, res) => {
    return new Response("Hello World", { headers: { "Content-Type": "text/plain" } });
  }
}

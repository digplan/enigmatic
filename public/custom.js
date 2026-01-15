window.custom = {
  "hello-world": (data) => `Hello ${data}`,
  "hello-world-2": {
    prop: (data) => `${data} World`,
    render: function(data) { 
      return this.prop(data); 
    }
  },
  "some-element": ()=> `Some element`
}
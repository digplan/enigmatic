const apis = {}
apis['randomuser.me'] = { "service": "randomuser", "params": [{"n": "3"}], "url": "https://randomuser.me/api/?results=${n}", "options": {}, "directives": {} }

export { apis: apis }

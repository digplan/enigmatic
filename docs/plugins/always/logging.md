# `src/plugins/always/logging.js`

## Purpose

Adds a global request logger that runs for every request.

## Behavior

- pushes a function into `app.routes.always`
- logs: `<METHOD> <URL>`

## Notes

- does not block or modify responses
- useful for local debugging and smoke-test visibility


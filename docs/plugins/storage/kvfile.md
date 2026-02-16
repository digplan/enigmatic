# `src/plugins/storage/kvfile.js`

## Purpose

Provides authenticated key/value storage backed by per-user JSONL files in `data/`.

## Storage Model

- file path: `data/<user.sub>.jsonl`
- append-only operations:
  - `{ op: "set", key, value, at }`
  - `{ op: "del", key, at }`
- current value map is reconstructed by replaying the file

## Reserved Keys

Requests are ignored (`return null`) for reserved/invalid keys:

- empty key
- key containing `.`
- auth endpoints (`login`, `logout`, `callback`, `register`, `me`)
- keys starting with `llm/`

## Routes

- `GET *`
  - returns stored value or `null`
  - requires `ctx.user`
- `POST *`
  - stores JSON request body
  - requires `ctx.user`
  - returns `{ POST: "ok" }`
- `DELETE *`
  - records delete operation
  - requires `ctx.user`
  - returns `{ DELETE: "ok" }`

## Auth

Unauthorized access returns:

```json
{ "error": "Unauthorized" }
```


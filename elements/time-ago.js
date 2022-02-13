
class TimeAgo extends EnigmaticElement {
    set(v) {
      const d = new Date(v)
      const now = new Date()
      const diff = (now - d) / 1000
      const day_diff = Math.floor(diff / 86400)
      this.textContent = 
        diff < 60 && 'just now' ||
        diff < 120 && '1 minute ago' ||
        diff < 3600 && Math.floor( diff / 60 ) + ' minutes ago' ||
        diff < 7200 && '1 hour ago' ||
        diff < 86400 && Math.floor( diff / 3600 ) + ' hours ago' ||
        day_diff == 1 && 'Yesterday' ||
        day_diff < 7 && day_diff + ' days ago' ||
        day_diff < 31 && Math.ceil( day_diff / 7 ) + ' weeks ago' ||
        day_diff < 365 && Math.ceil(day_diff / 30) + ' months ago' ||
        Math.ceil(day_diff / 365) + ' years ago'
    }
}

customElements.define('time-ago', TimeAgo)

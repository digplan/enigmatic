class DateTime extends EnigmaticElement {
    constructor () {
      super ()
      this.dateObj = (!this.at || this.at === 'now') ? new Date() : new Date(this.at)
      this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      this.localeString = this.dateObj.toLocaleString()
      this.dateObj.toISOString()
      this.innerHTML = this.dateObj[this.format]()
    }
  }
customElements.define('date-time', DateTime)
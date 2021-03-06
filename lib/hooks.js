const pLimit = require('p-limit')

class Hooks {
  constructor() {
    this.hooks = new Map()
  }

  add(name, handler) {
    if (!handler) return
    if (!this.hooks.has(name)) {
      this.hooks.set(name, new Set())
    }
    const hooks = this.hooks.get(name)
    hooks.add(handler)
    return this
  }

  async run(name, context) {
    if (!this.hooks.has(name)) return
    for (const hook of this.hooks.get(name)) {
      // eslint-disable-next-line no-await-in-loop
      await hook(context)
    }
  }

  async runParallel(name, context) {
    if (!this.hooks.has(name)) return

    // Only run 5 promises at once
    const limit = pLimit(5)
    await Promise.all(
      [...this.hooks.get(name)].map(hook => {
        return limit(() => hook(context))
      })
    )
  }
}

module.exports = new Hooks()

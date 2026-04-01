import { defineStore } from 'pinia'

export const useSocialStore = defineStore('social', {
  state: () => ({ posts: [], messages: [], connections: [], loading: false }),
  actions: {
    async fetchFeed() {},
    async fetchMessages() {},
    async fetchConnections() {}
  }
})

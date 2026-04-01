export default [
  {
    path: '/social',
    component: () => import('@/layouts/SocialLayout.vue'),
    meta: { role: 'alumni' },
    children: [
      { path: 'feed', name: 'social-feed', component: () => import('@/views/social/FeedView.vue') },
      { path: 'messages', name: 'social-messages', component: () => import('@/views/social/MessagesView.vue') },
      { path: 'connections', name: 'social-connections', component: () => import('@/views/social/ConnectionsView.vue') },
      { path: 'groups', name: 'social-groups', component: () => import('@/views/social/GroupListView.vue') },
      { path: 'testimonials', name: 'social-testimonials', component: () => import('@/views/social/TestimonialsPublicView.vue') }
    ]
  }
]

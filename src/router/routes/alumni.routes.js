export default [
  {
    path: '/alumni',
    component: () => import('@/layouts/AlumniLayout.vue'),
    meta: { role: 'alumni' },
    children: [
      { path: 'dashboard', name: 'alumni-dashboard', component: () => import('@/views/alumni/DashboardView.vue') },
      { path: 'profile', name: 'alumni-profile', component: () => import('@/views/alumni/MyProfileView.vue') },
      { path: 'career-path', name: 'alumni-career', component: () => import('@/views/alumni/CareerPathView.vue') },
      { path: 'testimonial', name: 'alumni-testimonial', component: () => import('@/views/alumni/TestimonialView.vue') },
      { path: 'documents', name: 'alumni-documents', component: () => import('@/views/alumni/DocumentsView.vue') }
    ]
  }
]

export default [
  {
    path: '/',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: { public: true },
    children: [
      { path: '', redirect: { name: 'login' } },
      { path: 'login', name: 'login', component: () => import('@/views/auth/LoginView.vue'), meta: { public: true } },
      { path: 'register', name: 'register', component: () => import('@/views/auth/RegisterAlumniView.vue'), meta: { public: true } },
      { path: 'profile', name: 'profile', component: () => import('@/views/auth/ProfileView.vue') }
    ]
  }
]

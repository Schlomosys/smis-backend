export default [
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: '',
        redirect: { name: 'admin-dashboard' }
      },
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { title: 'Tableau de bord' }
      },

      // Beneficiaries Management
      {
        path: 'beneficiaries',
        name: 'admin-beneficiaries',
        component: () => import('@/views/admin/beneficiaries/BeneficiaryListView.vue'),
        meta: { title: 'Bénéficiaires' }
      },
      {
        path: 'beneficiaries/create',
        name: 'admin-beneficiaries-create',
        component: () => import('@/views/admin/beneficiaries/BeneficiaryFormView.vue'),
        meta: { title: 'Nouveau bénéficiaire' }
      },
      {
        path: 'beneficiaries/:id',
        name: 'admin-beneficiaries-detail',
        component: () => import('@/views/admin/beneficiaries/BeneficiaryDetailView.vue'),
        meta: { title: 'Détails du bénéficiaire' },
        props: true
      },
      {
        path: 'beneficiaries/:id/edit',
        name: 'admin-beneficiaries-edit',
        component: () => import('@/views/admin/beneficiaries/BeneficiaryFormView.vue'),
        meta: { title: 'Modifier bénéficiaire' },
        props: true
      },

      {
        path: 'beneficiaries/:id/supports-report',
        name: 'admin-beneficiaries-supports-report',
        component: () => import('@/views/admin/beneficiaries/BeneficiarySupportsReportView.vue'),
        meta: { title: 'Rapport des appuis du bÃ©nÃ©ficiaire' },
        props: true
      },

      // Reference Data Management
      // Countries
      {
        path: 'countries',
        name: 'admin-countries',
        component: () => import('@/views/admin/countries/CountryListView.vue'),
        meta: { title: 'Pays' }
      },
      {
        path: 'countries/create',
        name: 'admin-countries-create',
        component: () => import('@/views/admin/countries/CountryFormView.vue'),
        meta: { title: 'Nouveau pays' }
      },
      {
        path: 'countries/:id',
        name: 'admin-countries-detail',
        component: () => import('@/views/admin/countries/CountryDetailView.vue'),
        meta: { title: 'Détails du pays' },
        props: true
      },
      {
        path: 'countries/:id/edit',
        name: 'admin-countries-edit',
        component: () => import('@/views/admin/countries/CountryFormView.vue'),
        meta: { title: 'Modifier pays' },
        props: true
      },

      // Regions
      {
        path: 'regions',
        name: 'admin-regions',
        component: () => import('@/views/admin/regions/RegionListView.vue'),
        meta: { title: 'Régions' }
      },
      {
        path: 'regions/create',
        name: 'admin-regions-create',
        component: () => import('@/views/admin/regions/RegionFormView.vue'),
        meta: { title: 'Nouvelle région' }
      },
      {
        path: 'regions/:id',
        name: 'admin-regions-detail',
        component: () => import('@/views/admin/regions/RegionDetailView.vue'),
        meta: { title: 'Détails de la région' },
        props: true
      },
      {
        path: 'regions/:id/edit',
        name: 'admin-regions-edit',
        component: () => import('@/views/admin/regions/RegionFormView.vue'),
        meta: { title: 'Modifier région' },
        props: true
      },

      // Municipalities
      {
        path: 'municipalities',
        name: 'admin-municipalities',
        component: () => import('@/views/admin/municipalities/MunicipalityListView.vue'),
        meta: { title: 'Communes' }
      },
      {
        path: 'municipalities/create',
        name: 'admin-municipalities-create',
        component: () => import('@/views/admin/municipalities/MunicipalityFormView.vue'),
        meta: { title: 'Nouvelle commune' }
      },
      {
        path: 'municipalities/:id',
        name: 'admin-municipalities-detail',
        component: () => import('@/views/admin/municipalities/MunicipalityDetailView.vue'),
        meta: { title: 'Détails de la commune' },
        props: true
      },
      {
        path: 'municipalities/:id/edit',
        name: 'admin-municipalities-edit',
        component: () => import('@/views/admin/municipalities/MunicipalityFormView.vue'),
        meta: { title: 'Modifier commune' },
        props: true
      },

      // Communes
      {
        path: 'communes',
        name: 'admin-communes',
        component: () => import('@/views/admin/communes/CommuneList.vue'),
        meta: { title: 'Communes' }
      },
      {
        path: 'communes/create',
        name: 'admin-communes-create',
        component: () => import('@/views/admin/communes/CommuneForm.vue'),
        meta: { title: 'Nouvelle commune' }
      },
      {
        path: 'communes/:id/edit',
        name: 'admin-communes-edit',
        component: () => import('@/views/admin/communes/CommuneForm.vue'),
        meta: { title: 'Modifier commune' },
        props: true
      },

      // Family Profiles
      {
        path: 'family-profiles',
        name: 'admin-family-profiles',
        component: () => import('@/views/admin/family-profiles/FamilyList.vue'),
        meta: { title: 'Profils familiaux' }
      },
      {
        path: 'family-profiles/create',
        name: 'admin-family-profiles-create',
        component: () => import('@/views/admin/family-profiles/FamilyForm.vue'),
        meta: { title: 'Nouveau profil familial' }
      },
      {
        path: 'family-profiles/:id/edit',
        name: 'admin-family-profiles-edit',
        component: () => import('@/views/admin/family-profiles/FamilyForm.vue'),
        meta: { title: 'Modifier profil familial' },
        props: true
      },

      // Schools
      {
        path: 'schools',
        name: 'admin-schools',
        component: () => import('@/views/admin/schools/SchoolList.vue'),
        meta: { title: 'Ecoles' }
      },
      {
        path: 'schools/create',
        name: 'admin-schools-create',
        component: () => import('@/views/admin/schools/SchoolForm.vue'),
        meta: { title: 'Nouvelle ecole' }
      },
      {
        path: 'schools/:id/edit',
        name: 'admin-schools-edit',
        component: () => import('@/views/admin/schools/SchoolForm.vue'),
        meta: { title: 'Modifier ecole' },
        props: true
      },

      // Support Types
      {
        path: 'support-types',
        name: 'admin-support-types',
        component: () => import('@/views/admin/support-types/SupportTypeListView.vue'),
        meta: { title: 'Types d\'appui' }
      },
      {
        path: 'support-types/create',
        name: 'admin-support-types-create',
        component: () => import('@/views/admin/support-types/SupportTypeFormView.vue'),
        meta: { title: 'Nouveau type d\'appui' }
      },
      {
        path: 'support-types/:id',
        name: 'admin-support-types-detail',
        component: () => import('@/views/admin/support-types/SupportTypeDetailView.vue'),
        meta: { title: 'Détails du type d\'appui' },
        props: true
      },
      {
        path: 'support-types/:id/edit',
        name: 'admin-support-types-edit',
        component: () => import('@/views/admin/support-types/SupportTypeFormView.vue'),
        meta: { title: 'Modifier type d\'appui' },
        props: true
      },

      // Sponsors Management
      {
        path: 'sponsors',
        name: 'admin-sponsors',
        component: () => import('@/views/admin/sponsors/SponsorListView.vue'),
        meta: { title: 'Sponsors' }
      },
      {
        path: 'sponsors/create',
        name: 'admin-sponsors-create',
        component: () => import('@/views/admin/sponsors/SponsorFormView.vue'),
        meta: { title: 'Nouveau sponsor' }
      },
      {
        path: 'sponsors/:id',
        name: 'admin-sponsors-detail',
        component: () => import('@/views/admin/sponsors/SponsorDetailView.vue'),
        meta: { title: 'Détails du sponsor' },
        props: true
      },
      {
        path: 'sponsors/:id/edit',
        name: 'admin-sponsors-edit',
        component: () => import('@/views/admin/sponsors/SponsorFormView.vue'),
        meta: { title: 'Modifier sponsor' },
        props: true
      },

      // Sponsorships
      {
        path: 'sponsorships',
        name: 'admin-sponsorships',
        component: () => import('@/views/admin/sponsorships/SponsorshipListView.vue'),
        meta: { title: 'Parrainages' }
      },

      // Statistics
      {
        path: 'statistics',
        name: 'admin-statistics',
        component: () => import('@/views/admin/statistics/StatisticsView.vue'),
        meta: { title: 'Statistiques' }
      }
    ]
  }
]

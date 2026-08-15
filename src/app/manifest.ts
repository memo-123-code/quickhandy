import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'QuickHandy Admin Panel & Dispatch',
    short_name: 'QuickHandy',
    description: 'Enterprise administration, handyman dispatching, KYC approvals, and dispute ticket management dashboard.',
    start_url: '/dashboard/admin',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#020617',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/icons/icon.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      }
    ],
    categories: ['business', 'productivity', 'utilities'],
    shortcuts: [
      {
        name: 'Admin Dashboard',
        short_name: 'Dashboard',
        description: 'View KPIs, financial analytics, and operations',
        url: '/dashboard/admin',
        icons: [{ src: '/icons/icon.svg', sizes: '192x192', type: 'image/svg+xml' }]
      },
      {
        name: 'KYC Approvals',
        short_name: 'KYC',
        description: 'Approve or reject provider licenses',
        url: '/dashboard/admin?tab=KYC',
        icons: [{ src: '/icons/icon.svg', sizes: '192x192', type: 'image/svg+xml' }]
      }
    ]
  };
}

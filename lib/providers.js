const STORAGE_KEY = 'providers-data';

export const DEFAULT_PROVIDERS = [
  {
    id: 'p1',
    name: 'Dr. Amelia Hart',
    location: 'New York, NY',
    service: 'Primary Care Consultation',
    availability: 'Mon-Fri, 09:00-17:00',
  },
  {
    id: 'p2',
    name: 'Dr. Benjamin Clarke',
    location: 'Brooklyn, NY',
    service: 'Dermatology Appointment',
    availability: 'Mon-Thu, 10:00-16:00',
  },
  {
    id: 'p3',
    name: 'Dr. Clara Nguyen',
    location: 'Jersey City, NJ',
    service: 'Orthopedic Evaluation',
    availability: 'Tue-Sat, 08:30-14:30',
  },
  {
    id: 'p4',
    name: 'Dr. David Patel',
    location: 'Queens, NY',
    service: 'Pediatric Checkup',
    availability: 'Mon-Fri, 09:30-18:00',
  },
  {
    id: 'p5',
    name: 'Dr. Eva Rodriguez',
    location: 'Staten Island, NY',
    service: 'Physical Therapy Session',
    availability: 'Mon-Sat, 07:30-15:30',
  },
  {
    id: 'p6',
    name: 'Dr. Frank Sinclair',
    location: 'Hoboken, NJ',
    service: 'Cardiology Consultation',
    availability: 'Mon-Wed, 11:00-19:00',
  },
  {
    id: 'p7',
    name: 'Dr. Grace Thompson',
    location: 'Albany, NY',
    service: 'Women’s Health Visit',
    availability: 'Tue-Fri, 09:00-17:30',
  },
  {
    id: 'p8',
    name: 'Dr. Henry Wilson',
    location: 'Buffalo, NY',
    service: 'Sleep & Wellness Appointment',
    availability: 'Mon-Fri, 08:00-16:00',
  },
  {
    id: 'p9',
    name: 'Dr. Isabella Martin',
    location: 'Rochester, NY',
    service: 'General Dentistry',
    availability: 'Mon-Sat, 10:00-18:30',
  },
  {
    id: 'p10',
    name: 'Dr. Jack Anderson',
    location: 'Syracuse, NY',
    service: 'Consultation & Follow-up',
    availability: 'Wed-Sun, 09:00-13:00',
  },
];

export function getProviders() {
  if (typeof window === 'undefined') {
    return DEFAULT_PROVIDERS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROVIDERS;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_PROVIDERS;
    }
    return parsed;
  } catch {
    return DEFAULT_PROVIDERS;
  }
}

export function saveProviders(providers) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(providers));
}

export function addProvider(provider) {
  const providers = getProviders();
  const next = [...providers, provider];
  saveProviders(next);
  return next;
}

export function updateProvider(providerId, updates) {
  const providers = getProviders();
  const next = providers.map((provider) =>
    provider.id === providerId ? { ...provider, ...updates } : provider
  );
  saveProviders(next);
  return next;
}

export function removeProvider(providerId) {
  const providers = getProviders();
  const next = providers.filter((provider) => provider.id !== providerId);
  saveProviders(next);
  return next;
}

export function getProviderById(providerId, providers = getProviders()) {
  if (!providerId) return undefined;
  return providers.find((p) => p.id === providerId);
}


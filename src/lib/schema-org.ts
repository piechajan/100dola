// JSON-LD strukturovaná data pro Google. Generuje standardní schema.org
// objekty, které se vkládají do <head> přes <JsonLd /> komponentu.

import { COMPANY, STERNBERK_STORE } from "@/data/company";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com";

const SAME_AS = [
  "https://www.instagram.com/100dolasport.cz/",
  "https://www.instagram.com/100dola_malaga/",
  "https://www.instagram.com/open_miles_clinic/",
];

/** Organization — kořenová identita značky. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "100dola",
    legalName: COMPANY.name,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: SAME_AS,
    taxID: COMPANY.dic,
    vatID: COMPANY.dic,
    identifier: { "@type": "PropertyValue", propertyID: "IČO", value: COMPANY.ico },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: COMPANY.contact.phoneIntl,
      email: COMPANY.contact.email,
      contactType: "customer service",
      availableLanguage: ["Czech", "English"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.registeredOffice.streetAddress,
      addressLocality: COMPANY.registeredOffice.addressLocality,
      postalCode: COMPANY.registeredOffice.postalCode,
      addressRegion: COMPANY.registeredOffice.addressRegion,
      addressCountry: COMPANY.registeredOffice.addressCountry,
    },
  };
}

/** SportsActivityLocation — kamenná prodejna Šternberk. */
export function storeSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SportingGoodsStore",
    "@id": `${SITE_URL}/#store`,
    name: STERNBERK_STORE.name,
    image: `${SITE_URL}/media/obchod/01-obchod.jpg`,
    url: `${SITE_URL}/kontakt`,
    telephone: COMPANY.contact.phoneIntl,
    email: COMPANY.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: STERNBERK_STORE.streetAddress,
      addressLocality: STERNBERK_STORE.addressLocality,
      postalCode: STERNBERK_STORE.postalCode,
      addressRegion: STERNBERK_STORE.addressRegion,
      addressCountry: STERNBERK_STORE.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 49.7311,
      longitude: 17.2978,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Wednesday",
        opens: "09:30",
        closes: "16:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Thursday",
        opens: "09:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Friday",
        opens: "09:00",
        closes: "16:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "12:00",
      },
    ],
    priceRange: "$$$",
    paymentAccepted: "Cash, Credit Card, Bank Transfer, QR Code",
    currenciesAccepted: "CZK",
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
    sameAs: SAME_AS,
  };
}

/** WebSite — pro Sitelinks Search Box (Google). */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "100dola",
    description: "Sport. Komunita. Malaga.",
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "cs-CZ",
  };
}

/** Event — pro ISAAC test (a další eventy). */
export function eventSchema(p: {
  name: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  location: { name: string; street: string; city: string; postalCode: string };
  url: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: p.name,
    description: p.description,
    startDate: p.startDate,
    endDate: p.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: p.location.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: p.location.street,
        addressLocality: p.location.city,
        postalCode: p.location.postalCode,
        addressCountry: "CZ",
      },
    },
    url: p.url,
    image: p.image,
    organizer: { "@id": `${SITE_URL}/#organization` },
    offers: {
      "@type": "Offer",
      url: p.url,
      price: "0",
      priceCurrency: "CZK",
      availability: "https://schema.org/InStock",
    },
  };
}

/** Service — pro Malaga / Lab. */
export function serviceSchema(p: {
  name: string;
  description: string;
  serviceType: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: p.name,
    description: p.description,
    serviceType: p.serviceType,
    url: p.url,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: { "@type": "Country", name: "Česká republika" },
  };
}

/** Product — pro shop produkty. */
export function productSchema(p: {
  name: string;
  description: string;
  image: string;
  sku: string;
  price: number;
  url: string;
  brand?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.image,
    sku: p.sku,
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    offers: {
      "@type": "Offer",
      url: p.url,
      priceCurrency: "CZK",
      price: p.price,
      availability: `https://schema.org/${p.availability || "InStock"}`,
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };
}

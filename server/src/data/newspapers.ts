/**
 * Newspaper Definitions
 * Phase 12, Wave 12.1 - Desperados Destiny
 *
 * Four distinct newspapers with unique voices and coverage areas
 */

import { Newspaper } from '@desperados/shared';

export const NEWSPAPERS: Record<string, Newspaper> = {
  'red-gulch-gazette': {
    id: 'red-gulch-gazette',
    name: 'The Red Gulch Gazette',
    motto: 'Truth, Justice, and the American Way',
    alignment: 'settlers',
    coverageAreas: ['Red Gulch', 'Longhorn Ranch', 'Whiskey Bend', 'Dusty Creek'],
    publishDay: 'friday',
    price: 2,
    subscriptionPrice: 20,
    editor: 'Elijah Montgomery',
    biases: ['pro-law', 'anti-criminal', 'pro-military'],
    language: 'english',
    logo: '/assets/newspapers/gazette-logo.png',
    founded: '1867',
    circulation: 2500,
  },

  'la-voz-frontera': {
    id: 'la-voz-frontera',
    name: 'La Voz de la Frontera',
    motto: 'La Verdad sin Fronteras / Truth Without Borders',
    alignment: 'frontera',
    coverageAreas: ['The Frontera', 'Border Towns', 'Smuggler Routes', 'Cantinas'],
    publishDay: 'wednesday',
    price: 3,
    subscriptionPrice: 25,
    editor: 'Rosa Delgado',
    biases: ['pro-frontera', 'anti-settler', 'neutral'],
    language: 'bilingual',
    logo: '/assets/newspapers/voz-logo.png',
    founded: '1872',
    circulation: 1800,
  },

  'fort-ashford-dispatch': {
    id: 'fort-ashford-dispatch',
    name: 'The Fort Ashford Dispatch',
    motto: 'Official Voice of the Frontier Army',
    alignment: 'military',
    coverageAreas: ['Fort Ashford', 'Military Outposts', 'Protected Routes', 'Government Land'],
    publishDay: 'monday',
    price: 1,
    subscriptionPrice: 15,
    editor: 'Major Harold Blackwood',
    biases: ['pro-military', 'pro-law', 'anti-criminal'],
    language: 'english',
    logo: '/assets/newspapers/dispatch-logo.png',
    founded: '1865',
    circulation: 3200,
  },

  'frontier-oracle': {
    id: 'frontier-oracle',
    name: 'The Frontier Oracle',
    motto: 'The Strange, the True, and Everything In Between',
    alignment: 'sensational',
    coverageAreas: ['All Territories', 'Remote Locations', 'Mysterious Sites'],
    publishDay: 'sunday',
    price: 5,
    subscriptionPrice: 30,
    editor: 'Cornelius P. Worthington III',
    biases: ['sensationalist'],
    language: 'english',
    logo: '/assets/newspapers/oracle-logo.png',
    founded: '1870',
    circulation: 4100,
  },
};

export const NEWSPAPER_DESCRIPTIONS: Record<string, string> = {
  'red-gulch-gazette': `
The Red Gulch Gazette is the most respectable newspaper in the territory,
serving the law-abiding citizens of Red Gulch and surrounding settlements.
Editor Elijah Montgomery maintains strict journalistic standards and a
pro-civilization stance. Known for accurate reporting on business, politics,
and crime, with a particular focus on upholding law and order.
  `.trim(),

  'la-voz-frontera': `
La Voz de la Frontera serves the border communities in both Spanish and English.
Editor Rosa Delgado provides fearless coverage of the criminal underworld,
cartel activities, and border politics that other papers won't touch.
Despite covering criminal activities, the paper maintains journalistic
integrity and provides a voice for the Frontera people.
  `.trim(),

  'fort-ashford-dispatch': `
The Fort Ashford Dispatch is the official military newspaper, though it
also serves civilian readers. Major Harold Blackwood ensures all news
supports military operations and government policy. Known for propaganda,
but also the most reliable source for official announcements, military
movements, and government regulations.
  `.trim(),

  'frontier-oracle': `
The Frontier Oracle is the territory's premier tabloid, specializing in
sensational stories, supernatural encounters, and exaggerated accounts
of frontier life. Editor Cornelius P. Worthington III never lets facts
get in the way of a good story. Despite its sensationalism, the Oracle
has the highest circulation and occasionally breaks real news.
  `.trim(),
};

export const NEWSPAPER_BYLINES: Record<string, string[]> = {
  'red-gulch-gazette': [
    'By Elijah Montgomery, Editor-in-Chief',
    'By Sarah Chen, Crime Reporter',
    'By Thomas O\'Brien, Business Editor',
    'By Margaret Whitfield, Society Editor',
    'By Staff Writer',
  ],

  'la-voz-frontera': [
    'Por Rosa Delgado, Editora / By Rosa Delgado, Editor',
    'Por Miguel Santos, Reportero / By Miguel Santos, Reporter',
    'Por Carmen Reyes, Corresponsal / By Carmen Reyes, Correspondent',
    'Por Redactor Anónimo / By Anonymous Writer',
  ],

  'fort-ashford-dispatch': [
    'By Major Harold Blackwood, Editor',
    'By Captain James Sterling, Military Affairs',
    'By Lieutenant Sarah Morrison, Public Relations',
    'By Official Dispatch',
  ],

  'frontier-oracle': [
    'By Cornelius P. Worthington III, Editor & Chief Investigator',
    'By "Mad" Jack Finnegan, Field Correspondent',
    'By Esmerelda Moonwhisper, Supernatural Expert',
    'By Anonymous Eyewitness',
    'By Our Intrepid Reporters',
  ],
};

export function getNewspaperById(id: string): Newspaper | undefined {
  return NEWSPAPERS[id];
}

export function getNewspapersByAlignment(
  alignment: Newspaper['alignment']
): Newspaper[] {
  return Object.values(NEWSPAPERS).filter((n) => n.alignment === alignment);
}

export function getNewspaperByCoverageArea(area: string): Newspaper[] {
  return Object.values(NEWSPAPERS).filter((n) =>
    n.coverageAreas.some(
      (ca) => ca.toLowerCase().includes(area.toLowerCase()) || area.toLowerCase().includes(ca.toLowerCase())
    )
  );
}

export function getAllNewspapers(): Newspaper[] {
  return Object.values(NEWSPAPERS);
}

export function getRandomByline(newspaperId: string): string {
  const bylines = NEWSPAPER_BYLINES[newspaperId];
  if (!bylines || bylines.length === 0) {
    return 'By Staff Writer';
  }
  return bylines[Math.floor(Math.random() * bylines.length)];
}

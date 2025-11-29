/**
 * Headline Generation Templates
 * Phase 12, Wave 12.1 - Desperados Destiny
 *
 * 50+ templates for dynamic article generation based on world events
 */

import {
  HeadlineTemplate,
  WorldEventType,
  NewsBias,
} from '@desperados/shared';

export const HEADLINE_TEMPLATES: HeadlineTemplate[] = [
  // BANK ROBBERY
  {
    eventType: 'bank-robbery',
    category: 'crime',
    templates: [
      'DARING DAYLIGHT HEIST: ${amount} Stolen from ${location}',
      'BANK ROBBERS STRIKE ${location}: ${amount} Missing',
      '${location} BANK FALLS TO BANDITS: ${amount} Taken',
      'BOLD ROBBERY AT ${location}: Thieves Escape with ${amount}',
      'DESPERATE OUTLAWS HIT ${location} BANK: ${amount} Gone',
    ],
    biasModifiers: [
      {
        bias: 'pro-law',
        alternativeTemplates: [
          'CRIMINAL SCUM ROB ${location}: Law Enforcement in Pursuit',
          'VICIOUS ATTACK ON ${location} BANK: Citizens Demand Justice',
          'LAWLESS BANDITS TERRORIZE ${location}: ${amount} Stolen',
        ],
      },
      {
        bias: 'sensationalist',
        alternativeTemplates: [
          'SHOCKING HEIST! Mysterious Bandits Steal ${amount} in BROAD DAYLIGHT!',
          'BLOOD AND GOLD! ${location} Bank Robbery Leaves Town in TERROR!',
          'LEGENDARY OUTLAWS Strike Again! ${amount} Vanishes!',
        ],
      },
    ],
  },

  // TRAIN HEIST
  {
    eventType: 'train-heist',
    category: 'crime',
    templates: [
      'IRON HORSE ROBBED: Train Heist Nets ${amount}',
      'BANDITS HALT LOCOMOTIVE: ${amount} Stolen from ${trainName}',
      '${trainName} STOPPED AND PLUNDERED: Passengers Terrorized',
      'TRAIN ROBBERY ON ${route}: ${amount} Missing',
      'OUTLAWS STRIKE ${trainName}: Bold Daytime Heist',
    ],
    biasModifiers: [
      {
        bias: 'pro-military',
        alternativeTemplates: [
          'ARMY CAVALRY IN PURSUIT After ${trainName} Robbery',
          'MILITARY RESPONSE: Train Robbers Will Face Justice',
          'FEDERAL TROOPS DEPLOYED After ${trainName} Attack',
        ],
      },
      {
        bias: 'sensationalist',
        alternativeTemplates: [
          'TERROR ON THE RAILS! Ghost Bandits Rob ${trainName}!',
          'MASSACRE ON THE ${trainName}! Witnesses Report SUPERNATURAL Events!',
          'CURSED GOLD Stolen from ${trainName}! Are the Robbers DOOMED?',
        ],
      },
    ],
  },

  // MURDER
  {
    eventType: 'murder',
    category: 'crime',
    templates: [
      'MURDER IN ${location}: ${victim} Found Dead',
      'FRONTIER JUSTICE: ${victim} Killed in ${location}',
      '${victim} SLAIN: Marshal Investigates Foul Play',
      'DEADLY ENCOUNTER: ${victim} Dies in ${location}',
      'BLOOD IN THE DUST: ${victim} Murdered',
    ],
    biasModifiers: [
      {
        bias: 'pro-law',
        alternativeTemplates: [
          'COLD-BLOODED MURDER: ${victim} Killed, Suspect Sought',
          'BRUTAL KILLING: Law Enforcement Vows Justice for ${victim}',
          'HEINOUS CRIME: ${victim} Murder Investigation Underway',
        ],
      },
      {
        bias: 'sensationalist',
        alternativeTemplates: [
          'MYSTERIOUS DEATH! Was ${victim} Killed by the SUPERNATURAL?',
          'SHOCKING MURDER! ${victim} Found in POOL OF BLOOD!',
          'CURSE STRIKES AGAIN! ${victim} Latest Victim!',
        ],
      },
    ],
  },

  // TERRITORY CHANGE
  {
    eventType: 'territory-change',
    category: 'politics',
    templates: [
      '${territory} FALLS: ${faction} Seizes Control',
      'POWER SHIFT IN ${territory}: ${faction} Takes Command',
      '${faction} CONQUERS ${territory} After Fierce Battle',
      'NEW RULERS: ${faction} Claims ${territory}',
      '${territory} TERRITORY: ${faction} Declares Sovereignty',
    ],
    biasModifiers: [
      {
        bias: 'pro-frontera',
        alternativeTemplates: [
          '${territory} LIBERATED: Frontera Forces Victorious',
          'FREEDOM FIGHTERS Take ${territory} from Oppressors',
          '${territory} RETURNS to Rightful Owners',
        ],
      },
      {
        bias: 'pro-military',
        alternativeTemplates: [
          'ENEMY FORCES Occupy ${territory}: Military Response Planned',
          'ILLEGAL SEIZURE of ${territory}: Government to Respond',
          'INSURGENTS Take ${territory}: Order Must Be Restored',
        ],
      },
    ],
  },

  // ARREST
  {
    eventType: 'arrest',
    category: 'crime',
    templates: [
      'OUTLAW CAPTURED: ${criminal} Behind Bars',
      'MARSHAL CATCHES ${criminal}: Justice Served',
      '${criminal} ARRESTED After ${crime}',
      'LAWMAN BRINGS IN ${criminal}: Town Celebrates',
      'WANTED CRIMINAL ${criminal} Finally Apprehended',
    ],
    biasModifiers: [
      {
        bias: 'pro-law',
        alternativeTemplates: [
          'JUSTICE PREVAILS: Notorious ${criminal} Captured',
          'HEROIC MARSHAL ARRESTS ${criminal}: Streets Safer',
          'LAW TRIUMPHS: ${criminal} in Custody',
        ],
      },
      {
        bias: 'pro-frontera',
        alternativeTemplates: [
          'POLITICAL PERSECUTION: ${criminal} Arrested by Corrupt Law',
          '${criminal} CAPTURED in Unjust Raid',
          'ANOTHER VICTIM: ${criminal} Arrested Without Fair Trial',
        ],
      },
    ],
  },

  // LEGENDARY KILL
  {
    eventType: 'legendary-kill',
    category: 'player-actions',
    templates: [
      'LEGENDARY BEAST SLAIN: ${hunter} Kills ${creature}',
      'HERO OF THE FRONTIER: ${hunter} Fells ${creature}',
      '${creature} DEFEATED: ${hunter} Triumphs',
      'MONSTER HUNTER: ${hunter} Slays Legendary ${creature}',
      '${hunter} BECOMES LEGEND: ${creature} Dead',
    ],
    biasModifiers: [
      {
        bias: 'sensationalist',
        alternativeTemplates: [
          'IMPOSSIBLE FEAT! ${hunter} Kills MYTHICAL ${creature}!',
          'SUPERNATURAL SHOWDOWN! ${hunter} Defeats ${creature}!',
          'WITNESS THE LEGEND! ${hunter} Slays ${creature} in EPIC BATTLE!',
        ],
      },
    ],
  },

  // DUEL
  {
    eventType: 'duel',
    category: 'player-actions',
    templates: [
      'SHOWDOWN AT ${location}: ${winner} Defeats ${loser}',
      'QUICK DRAW: ${winner} Beats ${loser} in Duel',
      'DEADLY DUEL: ${winner} Victorious Over ${loser}',
      '${winner} PROVES FASTER: ${loser} Falls in Duel',
      'FRONTIER JUSTICE: ${winner} Wins Duel at ${location}',
    ],
    biasModifiers: [
      {
        bias: 'sensationalist',
        alternativeTemplates: [
          'LEGENDARY GUNFIGHT! ${winner} OBLITERATES ${loser}!',
          'FASTEST GUN ALIVE! ${winner} Destroys ${loser}!',
          'BLOOD AND THUNDER! ${winner} Kills ${loser} in Epic Duel!',
        ],
      },
    ],
  },

  // GANG WAR
  {
    eventType: 'gang-war',
    category: 'crime',
    templates: [
      'GANG WAR ERUPTS: ${gang1} vs ${gang2}',
      'BLOODY FEUD: ${gang1} and ${gang2} Clash in ${location}',
      '${gang1} BATTLES ${gang2}: Territory War Begins',
      'VIOLENCE IN ${location}: ${gang1} Attacks ${gang2}',
      'GANG WARFARE: ${gang1} and ${gang2} Fight for Control',
    ],
    biasModifiers: [
      {
        bias: 'pro-law',
        alternativeTemplates: [
          'CRIMINAL GANGS WAR: Law Enforcement to Crack Down',
          'LAWLESSNESS: ${gang1} and ${gang2} Terrorize Citizens',
          'MARSHAL DECLARES: Gang War Must End',
        ],
      },
      {
        bias: 'sensationalist',
        alternativeTemplates: [
          'ALL-OUT WAR! ${gang1} and ${gang2} in DEADLY BATTLE!',
          'CARNAGE IN ${location}! Gang War Claims Multiple Lives!',
          'APOCALYPSE NOW! ${gang1} vs ${gang2} in EPIC SHOWDOWN!',
        ],
      },
    ],
  },

  // BOUNTY CLAIMED
  {
    eventType: 'bounty-claimed',
    category: 'crime',
    templates: [
      'BOUNTY HUNTER STRIKES: ${hunter} Claims ${bounty} on ${criminal}',
      '${criminal} BROUGHT TO JUSTICE: ${hunter} Earns ${bounty}',
      'WANTED OUTLAW CAUGHT: ${hunter} Collects ${bounty}',
      '${hunter} BRINGS IN ${criminal}: ${bounty} Reward',
      'BOUNTY CLAIMED: ${hunter} Captures ${criminal}',
    ],
    biasModifiers: [
      {
        bias: 'pro-law',
        alternativeTemplates: [
          'JUSTICE SERVED: Professional ${hunter} Ends ${criminal} Reign of Terror',
          'HERO BOUNTY HUNTER: ${hunter} Makes Frontier Safer',
          'LAW PREVAILS: ${hunter} Brings ${criminal} to Justice',
        ],
      },
    ],
  },

  // ESCAPE
  {
    eventType: 'escape',
    category: 'crime',
    templates: [
      'JAILBREAK: ${criminal} Escapes from ${location}',
      'PRISONER FLEES: ${criminal} on the Loose',
      '${criminal} BREAKS FREE: Manhunt Underway',
      'DANGEROUS ESCAPE: ${criminal} Flees ${location}',
      'OUTLAW LOOSE: ${criminal} Escapes Custody',
    ],
    biasModifiers: [
      {
        bias: 'pro-law',
        alternativeTemplates: [
          'INCOMPETENT GUARDS: ${criminal} Escapes ${location}',
          'DANGEROUS CRIMINAL ${criminal} AT LARGE: Public at Risk',
          'URGENT: ${criminal} Escapes, Marshal Issues Warning',
        ],
      },
      {
        bias: 'sensationalist',
        alternativeTemplates: [
          'IMPOSSIBLE ESCAPE! ${criminal} Vanishes from ${location}!',
          'SUPERNATURAL JAILBREAK! ${criminal} Walks Through Walls!',
          'SHOCKING! ${criminal} Escapes in DARING NIGHTTIME RAID!',
        ],
      },
    ],
  },

  // SUPERNATURAL SIGHTING
  {
    eventType: 'supernatural-sighting',
    category: 'weird-west',
    templates: [
      'STRANGE SIGHTING: ${creature} Reported Near ${location}',
      'SUPERNATURAL ENCOUNTER: Witnesses Describe ${creature}',
      '${creature} SPOTTED: Panic in ${location}',
      'UNEXPLAINED: ${creature} Sightings Increase',
      'FRONTIER MYSTERY: ${creature} Appears in ${location}',
    ],
    biasModifiers: [
      {
        bias: 'sensationalist',
        alternativeTemplates: [
          'SHOCKING PROOF! ${creature} EXISTS! Witnesses Terrified!',
          'SUPERNATURAL TERROR! ${creature} Haunts ${location}!',
          'BEYOND BELIEF! ${creature} Sightings CONFIRMED!',
          'THE TRUTH REVEALED! ${creature} Walks Among Us!',
        ],
      },
      {
        bias: 'pro-law',
        alternativeTemplates: [
          'Mass Hysteria: No Evidence of ${creature} in ${location}',
          'Rational Explanation Sought for ${creature} Claims',
          'Officials Dismiss ${creature} Reports as Hoax',
        ],
      },
    ],
  },

  // MARKET CHANGE
  {
    eventType: 'market-change',
    category: 'business',
    templates: [
      'MARKET REPORT: ${commodity} Prices ${change}',
      'ECONOMIC SHIFT: ${commodity} Now ${price}',
      'TRADERS ALERT: ${commodity} Market ${trend}',
      '${commodity} SHORTAGE: Prices ${change}',
      'BUSINESS NEWS: ${commodity} Prices Hit ${price}',
    ],
    biasModifiers: [],
  },

  // BUSINESS OPENING
  {
    eventType: 'business-opening',
    category: 'business',
    templates: [
      'NEW BUSINESS: ${business} Opens in ${location}',
      '${business} WELCOMES CUSTOMERS: Grand Opening Today',
      'ENTREPRENEUR ${owner} Opens ${business}',
      '${location} GROWS: ${business} Now Open',
      'PROSPERITY: ${business} Brings Jobs to ${location}',
    ],
    biasModifiers: [
      {
        bias: 'pro-law',
        alternativeTemplates: [
          'CIVILIZATION ADVANCES: ${business} Opens, Town Thrives',
          'LAW-ABIDING BUSINESS: ${business} Opens to Great Fanfare',
          'PROGRESS: ${business} Shows Frontier Growth',
        ],
      },
    ],
  },

  // ELECTION
  {
    eventType: 'election',
    category: 'politics',
    templates: [
      'ELECTION RESULTS: ${winner} Elected ${position} of ${location}',
      '${winner} WINS: New ${position} Promises Change',
      'VOTERS DECIDE: ${winner} Takes ${position}',
      '${location} ELECTS ${winner} as ${position}',
      'NEW LEADERSHIP: ${winner} Becomes ${position}',
    ],
    biasModifiers: [
      {
        bias: 'pro-military',
        alternativeTemplates: [
          'MILITARY-BACKED ${winner} Wins ${position}',
          'STRONG LEADER: ${winner} Elected ${position}',
          'ORDER CANDIDATE ${winner} Victorious',
        ],
      },
      {
        bias: 'pro-frontera',
        alternativeTemplates: [
          'PEOPLE\'S CHOICE: ${winner} Elected ${position}',
          'REFORM CANDIDATE ${winner} Wins ${position}',
          'CHANGE COMES: ${winner} Takes ${position}',
        ],
      },
    ],
  },

  // GANG ACTIVITY
  {
    eventType: 'gang-activity',
    category: 'crime',
    templates: [
      '${gang} STRIKES: ${crime} in ${location}',
      'GANG ACTIVITY: ${gang} Responsible for ${crime}',
      '${gang} TERRORIZES ${location}: ${crime} Reported',
      'OUTLAW GANG ${gang}: ${crime} Spree Continues',
      '${location} UNDER SIEGE: ${gang} Commits ${crime}',
    ],
    biasModifiers: [
      {
        bias: 'pro-law',
        alternativeTemplates: [
          'CRIMINAL GANG ${gang} MUST BE STOPPED: ${crime} Latest Outrage',
          'LAW ENFORCEMENT TARGETS ${gang} After ${crime}',
          'MARSHAL VOWS: ${gang} Will Face Justice for ${crime}',
        ],
      },
    ],
  },

  // ACHIEVEMENT UNLOCK
  {
    eventType: 'achievement-unlock',
    category: 'player-actions',
    templates: [
      'FRONTIER LEGEND: ${player} Earns "${achievement}"',
      '${player} ACHIEVES GREATNESS: "${achievement}" Unlocked',
      'REMARKABLE FEAT: ${player} Becomes "${achievement}"',
      '${player} MAKES HISTORY: "${achievement}" Earned',
      'LEGENDARY STATUS: ${player} Achieves "${achievement}"',
    ],
    biasModifiers: [
      {
        bias: 'sensationalist',
        alternativeTemplates: [
          'INCREDIBLE! ${player} Becomes "${achievement}"!',
          'WITNESS GREATNESS! ${player} Achieves IMPOSSIBLE "${achievement}"!',
          'FRONTIER IMMORTAL! ${player} Earns Legendary "${achievement}"!',
        ],
      },
    ],
  },

  // LAW CHANGE
  {
    eventType: 'law-change',
    category: 'politics',
    templates: [
      'NEW LAW: ${law} Takes Effect in ${location}',
      '${location} PASSES ${law}: Citizens React',
      'LEGAL CHANGE: ${law} Now in Force',
      'GOVERNMENT DECREE: ${law} Announced',
      '${law} ENACTED: What It Means for ${location}',
    ],
    biasModifiers: [
      {
        bias: 'pro-military',
        alternativeTemplates: [
          'NECESSARY LAW: ${law} Strengthens Order',
          'GOVERNMENT WISDOM: ${law} Improves Security',
          'DECISIVE ACTION: ${law} Brings Stability',
        ],
      },
      {
        bias: 'pro-frontera',
        alternativeTemplates: [
          'OPPRESSIVE LAW: ${law} Restricts Freedom',
          'UNJUST DECREE: ${law} Targets Innocent',
          'TYRANNY: ${law} Violates Rights',
        ],
      },
    ],
  },

  // PROPERTY SALE
  {
    eventType: 'property-sale',
    category: 'business',
    templates: [
      'PROPERTY SOLD: ${property} in ${location} for ${price}',
      'REAL ESTATE: ${buyer} Purchases ${property}',
      '${property} CHANGES HANDS: Sold for ${price}',
      'LAND DEAL: ${property} Sold to ${buyer}',
      '${location} PROPERTY: ${property} Fetches ${price}',
    ],
    biasModifiers: [],
  },

  // SOCIAL EVENT
  {
    eventType: 'social-event',
    category: 'society',
    templates: [
      'SOCIETY NEWS: ${event} Held in ${location}',
      '${event} DRAWS CROWD: ${location} Celebrates',
      'SOCIAL SEASON: ${event} Marks ${occasion}',
      '${location} GATHERS: ${event} Success',
      'FRONTIER SOCIETY: ${event} Delights Attendees',
    ],
    biasModifiers: [
      {
        bias: 'sensationalist',
        alternativeTemplates: [
          'SHOCKING SCANDAL at ${event}! Details Inside!',
          'DRAMATIC ${event} Features SURPRISING Revelations!',
          'SOCIETY SHAKEN! ${event} Ends in CONTROVERSY!',
        ],
      },
    ],
  },

  // MYSTERIOUS EVENT
  {
    eventType: 'mysterious-event',
    category: 'weird-west',
    templates: [
      'UNEXPLAINED: ${event} Baffles Authorities',
      'STRANGE OCCURRENCE: ${event} in ${location}',
      'FRONTIER MYSTERY: ${event} Defies Explanation',
      '${event}: What Really Happened?',
      'BIZARRE: ${event} Reported in ${location}',
    ],
    biasModifiers: [
      {
        bias: 'sensationalist',
        alternativeTemplates: [
          'TERRIFYING! ${event} Could Mean APOCALYPSE!',
          'SUPERNATURAL CONFIRMED! ${event} Proves We\'re NOT ALONE!',
          'SHOCKING ${event}! Scientists BAFFLED!',
          'BEYOND SCIENCE! ${event} Defies ALL LOGIC!',
        ],
      },
    ],
  },

  // FACTION WAR
  {
    eventType: 'faction-war',
    category: 'politics',
    templates: [
      'WAR DECLARED: ${faction1} vs ${faction2}',
      '${faction1} ATTACKS ${faction2}: Full-Scale War',
      'FRONTIER CONFLICT: ${faction1} and ${faction2} at War',
      'BATTLE LINES DRAWN: ${faction1} Opposes ${faction2}',
      'TERRITORIAL WAR: ${faction1} Clashes with ${faction2}',
    ],
    biasModifiers: [
      {
        bias: 'pro-military',
        alternativeTemplates: [
          'MILITARY READY: War Between ${faction1} and ${faction2}',
          'ARMY MOBILIZES: ${faction1} vs ${faction2} Conflict',
          'DEFENSE FORCES: Ready for ${faction1}-${faction2} War',
        ],
      },
      {
        bias: 'sensationalist',
        alternativeTemplates: [
          'ARMAGEDDON! ${faction1} and ${faction2} in TOTAL WAR!',
          'BLOODBATH BEGINS! ${faction1} vs ${faction2}!',
          'END TIMES! ${faction1} and ${faction2} DESTROY Each Other!',
        ],
      },
    ],
  },
];

export function getTemplatesForEvent(eventType: WorldEventType): HeadlineTemplate | undefined {
  return HEADLINE_TEMPLATES.find((t) => t.eventType === eventType);
}

export function getAllTemplates(): HeadlineTemplate[] {
  return HEADLINE_TEMPLATES;
}

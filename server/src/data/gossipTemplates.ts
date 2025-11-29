/**
 * Gossip Templates
 *
 * Templates for generating dynamic gossip and cross-reference dialogue
 * Part of Phase 3, Wave 3.1 - NPC Cross-references System
 */

import { GossipCategory, RelationshipType } from '@desperados/shared';

/**
 * Template variable markers:
 * {subject} - The NPC being talked about
 * {speaker} - The NPC speaking
 * {player} - The player character name
 * {action} - What happened
 * {location} - Where it happened
 * {time} - When it happened
 * {relationship} - Type of relationship
 * {detail} - Additional detail
 */

/**
 * Gossip templates by category
 */
export const GOSSIP_TEMPLATES = {
  [GossipCategory.PERSONAL]: [
    "Did you hear about {subject}? {action}",
    "I heard {subject} {action} the other day.",
    "Between you and me, {subject} {action}.",
    "Word is {subject} {action}. Can you believe it?",
    "People are saying {subject} {action}.",
    "{subject}? Oh, they {action}. Everyone knows.",
    "You know {subject}? Well, they {action} recently.",
    "I don't like to gossip, but {subject} {action}."
  ],

  [GossipCategory.CRIMINAL]: [
    "Keep your distance from {subject}. They {action}.",
    "I heard {subject} {action}. Sheriff's been asking questions.",
    "They say {subject} {action}. Wouldn't surprise me none.",
    "{subject}? Nothing but trouble. They {action}.",
    "Watch yourself around {subject}. Word is they {action}.",
    "The law's after {subject}. Heard they {action}.",
    "{subject} {action}. I'd stay clear if I were you.",
    "Criminal types, that {subject}. They {action} just last week."
  ],

  [GossipCategory.ROMANCE]: [
    "I saw {subject} with {detail}. Romance in the air!",
    "{subject} and {detail} have been seen together. Draw your own conclusions.",
    "Love blooms in strange places. {subject} {action}.",
    "Did you hear? {subject} {action}. Who would've thought?",
    "The heart wants what it wants. {subject} {action}.",
    "I heard {subject} {action}. Such scandal!",
    "{subject}'s been spending time with {detail}. If you know what I mean.",
    "Affairs of the heart: {subject} {action}."
  ],

  [GossipCategory.BUSINESS]: [
    "{subject}'s business is booming. They {action}.",
    "I heard {subject} {action}. Smart business move.",
    "Money talks: {subject} {action}.",
    "{subject} made a deal. They {action}.",
    "Business is business. {subject} {action}.",
    "Follow the money. {subject} {action} recently.",
    "{subject}'s been making moves. Word is they {action}.",
    "Profits and losses: {subject} {action}."
  ],

  [GossipCategory.CONFLICT]: [
    "There's bad blood between {subject} and {detail}. They {action}.",
    "{subject} {action}. Tensions are high.",
    "I'd stay out of it. {subject} and {detail} {action}.",
    "Feuds never end well. {subject} {action}.",
    "{subject} crossed {detail}. They {action}.",
    "Watch for trouble. {subject} {action}.",
    "They've been at it for weeks. {subject} {action}.",
    "{subject} won't let it go. They {action}."
  ],

  [GossipCategory.RUMOR]: [
    "I heard a rumor about {subject}. They say {action}.",
    "Don't know if it's true, but people say {subject} {action}.",
    "Rumor has it {subject} {action}.",
    "Can't say for certain, but {subject} might have {action}.",
    "The word on the street is {subject} {action}.",
    "I heard it from someone who heard it: {subject} {action}.",
    "Could be nothing, but {subject} {action}.",
    "Just a rumor, but {subject} {action}."
  ],

  [GossipCategory.NEWS]: [
    "Big news: {subject} {action}!",
    "Did you hear? {subject} {action}.",
    "Everyone's talking about how {subject} {action}.",
    "Latest news: {subject} {action}.",
    "{subject} {action}. It's the talk of the town.",
    "You won't believe it! {subject} {action}.",
    "Breaking news: {subject} {action}.",
    "Have you heard? {subject} {action}."
  ],

  [GossipCategory.POLITICAL]: [
    "{subject}'s making political moves. They {action}.",
    "Power shifts: {subject} {action}.",
    "Politics in this town... {subject} {action}.",
    "{subject} aligned with {detail}. They {action}.",
    "The balance of power: {subject} {action}.",
    "{subject}'s been politicking. Word is they {action}.",
    "Factions and alliances: {subject} {action}.",
    "Watch the power plays. {subject} {action}."
  ],

  [GossipCategory.SUPERNATURAL]: [
    "Strange things around {subject}. They say {action}.",
    "I don't believe in curses, but {subject} {action}.",
    "The spirits are restless. {subject} {action}.",
    "{subject}? Bad medicine. They {action}.",
    "Unnatural happenings: {subject} {action}.",
    "I'm not superstitious, but {subject} {action}.",
    "The old ways... {subject} {action}.",
    "Mark my words, {subject} {action}. It's a curse."
  ],

  [GossipCategory.SECRET]: [
    "I shouldn't say this, but {subject} {action}.",
    "Keep this between us: {subject} {action}.",
    "Don't tell anyone I told you, but {subject} {action}.",
    "This is confidential. {subject} {action}.",
    "You didn't hear it from me, but {subject} {action}.",
    "I trust you with this: {subject} {action}.",
    "Not many know this, but {subject} {action}.",
    "This stays between us. {subject} {action}."
  ]
};

/**
 * Cross-reference templates
 * Used when NPCs mention other NPCs in dialogue
 */
export const CROSS_REFERENCE_TEMPLATES = {
  mention: [
    "My {relationship} {subject} works at {location}.",
    "{subject} is my {relationship}. Good person.",
    "You should talk to {subject}. They can help with that.",
    "I know {subject}. We go way back.",
    "{subject}? Yeah, I know them.",
    "My {relationship} {subject} mentioned something about that.",
    "{subject} over at {location} knows more about this.",
    "If you need {detail}, see {subject}."
  ],

  opinion: [
    "You ask me about {subject}? {detail}",
    "{subject}? {detail}",
    "Ah, {subject}. {detail}",
    "Let me tell you about {subject}. {detail}",
    "{subject} is {detail}",
    "My opinion of {subject}? {detail}",
    "When it comes to {subject}, {detail}",
    "I'll be straight with you about {subject}. {detail}"
  ],

  warning: [
    "Watch out for {subject}. They {action}.",
    "Be careful around {subject}. {detail}",
    "{subject} is not to be trifled with. {detail}",
    "I'd steer clear of {subject}. {detail}",
    "Don't trust {subject}. {detail}",
    "{subject}? Keep your guard up. {detail}",
    "Word of advice: avoid {subject}. {detail}",
    "That {subject} is dangerous. {detail}"
  ],

  recommendation: [
    "You should meet {subject}. {detail}",
    "{subject} is good people. {detail}",
    "I can vouch for {subject}. {detail}",
    "If you need help, {subject} {detail}",
    "{subject} at {location} can help you with that.",
    "Trust me, see {subject}. {detail}",
    "Best person for that is {subject}. {detail}",
    "{subject} won't let you down. {detail}"
  ],

  gossip_sharing: [
    "Did you hear what happened with {subject}? {detail}",
    "I heard something about {subject}. {detail}",
    "Between us, {subject} {detail}",
    "You know {subject}? Well, {detail}",
    "This is just what I heard, but {subject} {detail}",
    "The word is {subject} {detail}",
    "People are saying {subject} {detail}",
    "I don't like to gossip, but {subject} {detail}"
  ]
};

/**
 * Relationship-specific dialogue templates
 */
export const RELATIONSHIP_DIALOGUE = {
  [RelationshipType.FAMILY]: [
    "{subject} is my {familyRelation}. Family is everything.",
    "My {familyRelation} {subject} and I, we stick together.",
    "Blood is thicker than water. {subject}'s my {familyRelation}.",
    "{subject}? That's my {familyRelation}. We look out for each other.",
    "Family matters. {subject} is my {familyRelation}."
  ],

  [RelationshipType.FRIEND]: [
    "{subject} is a good friend of mine.",
    "Me and {subject}? We're tight.",
    "{subject}'s one of the best people I know.",
    "I'd trust {subject} with my life.",
    "{subject} and I go way back."
  ],

  [RelationshipType.ENEMY]: [
    "{subject}? We have... history.",
    "I'd rather not talk about {subject}.",
    "That snake {subject}. Don't even get me started.",
    "{subject} and I don't see eye to eye.",
    "Stay away from {subject}. Bad news."
  ],

  [RelationshipType.RIVAL]: [
    "{subject} keeps me on my toes.",
    "Friendly competition between me and {subject}.",
    "{subject}? We push each other to be better.",
    "There's healthy rivalry between {subject} and me.",
    "{subject} is good, but I'm better."
  ],

  [RelationshipType.EMPLOYER]: [
    "{subject} works for me. Good employee.",
    "I run the shop. {subject} helps out.",
    "{subject} is on my payroll. Reliable worker.",
    "I employ {subject}. Fair day's work for fair pay.",
    "{subject}? They work for me. No complaints."
  ],

  [RelationshipType.EMPLOYEE]: [
    "I work for {subject}. Fair boss.",
    "{subject}'s my employer. Treats me right.",
    "I do work for {subject}. Pays on time.",
    "{subject} gave me this job. I'm grateful.",
    "Working for {subject} has its perks."
  ],

  [RelationshipType.BUSINESS_PARTNER]: [
    "{subject} and I are in business together.",
    "Me and {subject}, we have a partnership.",
    "{subject}? Business partner. It's profitable.",
    "My associate {subject} handles that side of things.",
    "{subject} and I split the profits. Good deal."
  ],

  [RelationshipType.CRIMINAL_ASSOCIATE]: [
    "{subject} and I have... worked together.",
    "I've done some jobs with {subject}. Reliable.",
    "{subject} knows how to keep their mouth shut.",
    "My associate {subject} can be trusted.",
    "Me and {subject} understand each other."
  ],

  [RelationshipType.MENTOR]: [
    "I taught {subject} everything they know.",
    "{subject} was my student. I'm proud of them.",
    "I mentored {subject}. They learned well.",
    "{subject} studied under me. Good pupil.",
    "I showed {subject} the ropes. They've done well."
  ],

  [RelationshipType.STUDENT]: [
    "{subject} taught me most of what I know.",
    "I learned from {subject}. Best teacher I ever had.",
    "{subject} was my mentor. Wise person.",
    "Everything I am, I owe to {subject}.",
    "{subject} took me under their wing."
  ],

  [RelationshipType.LOVER]: [
    "{subject} and I, we're... close.",
    "What {subject} and I have is special.",
    "{subject} means everything to me.",
    "I'd rather not discuss my relationship with {subject}.",
    "{subject}? That's personal."
  ]
};

/**
 * Opinion intensity templates
 */
export const OPINION_TEMPLATES = {
  stronglyPositive: [
    "one of the finest people I know",
    "absolutely trustworthy",
    "a true friend",
    "someone I'd trust with my life",
    "the best of the best"
  ],

  positive: [
    "a good person",
    "trustworthy enough",
    "alright in my book",
    "someone I respect",
    "decent folk"
  ],

  neutral: [
    "alright, I suppose",
    "neither here nor there",
    "nothing special",
    "just another person",
    "don't know them well enough"
  ],

  negative: [
    "not someone I trust",
    "questionable character",
    "I'd be careful around them",
    "someone to watch",
    "not my type of people"
  ],

  stronglyNegative: [
    "absolute scum",
    "not to be trusted",
    "dangerous and untrustworthy",
    "the worst kind",
    "someone I despise"
  ]
};

/**
 * Event-triggered gossip actions
 */
export const EVENT_GOSSIP_ACTIONS = {
  crime_committed: [
    "committed a crime",
    "broke the law",
    "got caught red-handed",
    "did something illegal",
    "crossed the line"
  ],

  player_arrested: [
    "got thrown in jail",
    "was arrested by the sheriff",
    "got caught",
    "ended up behind bars",
    "got what they deserved"
  ],

  gang_joined: [
    "joined up with a gang",
    "aligned with outlaws",
    "chose their side",
    "joined the gang",
    "became one of them"
  ],

  combat_won: [
    "won a fight",
    "beat someone in combat",
    "came out on top",
    "proved their worth",
    "showed their skill"
  ],

  high_reputation: [
    "made quite a name for themselves",
    "is well-known around here",
    "earned respect",
    "built a reputation",
    "is famous now"
  ]
};

/**
 * Time-based greetings that can reference other NPCs
 */
export const TIME_BASED_REFERENCES = {
  morning: [
    "Saw {subject} this morning at {location}.",
    "{subject} was here earlier looking for you.",
    "Morning! {subject} sends their regards."
  ],

  afternoon: [
    "{subject} was asking about you earlier.",
    "You just missed {subject}. They were here.",
    "{subject} mentioned they needed to talk to you."
  ],

  evening: [
    "{subject} usually comes by around now.",
    "Evening. {subject} said to expect you.",
    "{subject} was here earlier. Evening crowd, you know."
  ],

  night: [
    "Bit late. {subject} already left for the night.",
    "Night time. {subject}'s probably at {location}.",
    "You looking for {subject}? They don't come by this late."
  ]
};

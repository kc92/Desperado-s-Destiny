/**
 * Gossip Expansion Templates
 *
 * Procedural templates for generating dynamic gossip content.
 * Part of Phase D - Content Explosion System
 *
 * 50+ base templates that create thousands of unique gossip items
 * through variable substitution and truth degradation.
 */

import { GossipCategory } from '@desperados/shared';
import { SecureRNG } from '../services/base/SecureRNG';

// ============================================================================
// TYPES
// ============================================================================

export type GossipTone = 'scandal' | 'rumor' | 'news' | 'secret' | 'warning';

export interface GossipExpansionTemplate {
  id: string;
  category: GossipCategory;
  tone: GossipTone;
  template: string; // Template with {VARIABLES}
  variables: string[]; // Variables used in template
  spreadRate: number; // 1-10: How fast it spreads (10 = viral)
  truthValue: number; // 0-1: How true it is (1 = completely true)
  interestDecay: number; // Days until gossip becomes stale
  factionRelevance?: string[]; // Factions particularly interested
  locationRelevance?: string[]; // Locations where it spreads faster
  embellishments?: string[]; // Possible additions when spread
  degradations?: string[]; // Ways the truth degrades
  triggerEvents?: string[]; // Events that can spawn this gossip
}

// ============================================================================
// SCANDAL GOSSIP TEMPLATES (10)
// ============================================================================

export const SCANDAL_TEMPLATES: GossipExpansionTemplate[] = [
  {
    id: 'scandal_affair_1',
    category: GossipCategory.ROMANCE,
    tone: 'scandal',
    template:
      'Did you hear? {NPC1} was seen leaving {LOCATION} with {NPC2} last {TIME_PERIOD}. And {NPC1_SPOUSE} was nowhere to be found...',
    variables: ['NPC1', 'LOCATION', 'NPC2', 'TIME_PERIOD', 'NPC1_SPOUSE'],
    spreadRate: 9,
    truthValue: 0.7,
    interestDecay: 7,
    embellishments: [
      'They were holding hands.',
      'Someone saw them kissing.',
      'They left through the back door.',
      'They have been seen together three times this week.',
    ],
    degradations: [
      'Actually, it might have been {NPC3} instead of {NPC2}.',
      'Or was it {ALTERNATE_LOCATION}?',
      'Some say it was just a business meeting.',
    ],
  },
  {
    id: 'scandal_embezzlement_1',
    category: GossipCategory.BUSINESS,
    tone: 'scandal',
    template:
      '{NPC} has been skimming from the {BUSINESS_TYPE} accounts. Word is they have already stolen {AMOUNT} gold over the past {TIME_PERIOD}.',
    variables: ['NPC', 'BUSINESS_TYPE', 'AMOUNT', 'TIME_PERIOD'],
    spreadRate: 8,
    truthValue: 0.5,
    interestDecay: 14,
    factionRelevance: ['settlerAlliance'],
    embellishments: [
      'The owners have no idea.',
      'A clerk found the discrepancies in the books.',
      'They have been gambling it away.',
    ],
    degradations: [
      'The amount might be even higher.',
      'Some say it is a bookkeeping error.',
    ],
    triggerEvents: ['large_purchase', 'gambling_loss'],
  },
  {
    id: 'scandal_secret_child_1',
    category: GossipCategory.PERSONAL,
    tone: 'scandal',
    template:
      'They say {NPC} has a secret {CHILD_GENDER} living in {DISTANT_TOWN}. The mother is supposedly {NPC2}, from back when they lived in {ORIGIN}.',
    variables: ['NPC', 'CHILD_GENDER', 'DISTANT_TOWN', 'NPC2', 'ORIGIN'],
    spreadRate: 7,
    truthValue: 0.3,
    interestDecay: 30,
    embellishments: [
      'The child looks just like them.',
      'They send money every month.',
      'The family has been trying to keep it quiet for years.',
    ],
    degradations: [
      'Or was the mother someone else entirely?',
      'Some say it is just a nephew they support.',
    ],
  },
  {
    id: 'scandal_past_criminal_1',
    category: GossipCategory.CRIMINAL,
    tone: 'scandal',
    template:
      '{NPC} is not who they claim to be. Before coming to {TOWN}, they went by {ALIAS} and were wanted for {CRIME} in {ORIGIN}.',
    variables: ['NPC', 'TOWN', 'ALIAS', 'CRIME', 'ORIGIN'],
    spreadRate: 9,
    truthValue: 0.4,
    interestDecay: 21,
    factionRelevance: ['settlerAlliance', 'frontera'],
    embellishments: [
      'There is still a bounty on their head.',
      'A wanted poster is circulating.',
      'Someone from their past recognized them.',
    ],
    degradations: [
      'The crime might have been {ALTERNATE_CRIME} instead.',
      'They might have served their time already.',
    ],
    triggerEvents: ['stranger_arrives', 'bounty_posted'],
  },
  {
    id: 'scandal_corruption_1',
    category: GossipCategory.POLITICAL,
    tone: 'scandal',
    template:
      'The {OFFICIAL_TITLE} has been taking bribes from {FACTION}. {NPC} saw money change hands at {LOCATION} just last {TIME_PERIOD}.',
    variables: ['OFFICIAL_TITLE', 'FACTION', 'NPC', 'LOCATION', 'TIME_PERIOD'],
    spreadRate: 8,
    truthValue: 0.6,
    interestDecay: 14,
    factionRelevance: ['settlerAlliance', 'frontera'],
    embellishments: [
      'It has been going on for months.',
      'Half the town council is in on it.',
      'The marshal knows but looks the other way.',
    ],
    degradations: [
      'It might have been a legitimate business deal.',
      'The witness might have been drinking.',
    ],
  },
  {
    id: 'scandal_gambling_debt_1',
    category: GossipCategory.BUSINESS,
    tone: 'scandal',
    template:
      '{NPC} owes {CREDITOR} over {AMOUNT} gold from gambling debts. If they do not pay by {TIME_PERIOD}, there will be trouble.',
    variables: ['NPC', 'CREDITOR', 'AMOUNT', 'TIME_PERIOD'],
    spreadRate: 6,
    truthValue: 0.8,
    interestDecay: 7,
    embellishments: [
      '{CREDITOR} has already sent collectors.',
      'They tried to flee town last week.',
      'Their family does not know yet.',
    ],
    degradations: [
      'The amount might be exaggerated.',
      'They might have already worked out a deal.',
    ],
    triggerEvents: ['gambling_loss', 'debt_collection'],
  },
  {
    id: 'scandal_disease_1',
    category: GossipCategory.PERSONAL,
    tone: 'scandal',
    template:
      '{NPC} has been visiting Doc {DOCTOR_NAME} every week. People are saying it is {DISEASE}. They have been hiding it from everyone.',
    variables: ['NPC', 'DOCTOR_NAME', 'DISEASE'],
    spreadRate: 7,
    truthValue: 0.2,
    interestDecay: 14,
    embellishments: [
      'They have lost a lot of weight recently.',
      'Their skin has an unhealthy pallor.',
      'They have been making arrangements for their affairs.',
    ],
    degradations: [
      'It might just be a minor ailment.',
      'The visits could be for someone else in the family.',
    ],
  },
  {
    id: 'scandal_business_failing_1',
    category: GossipCategory.BUSINESS,
    tone: 'scandal',
    template:
      '{NPC}\'s {BUSINESS_TYPE} is on the verge of collapse. They cannot pay their suppliers, and {CREDITOR} is about to foreclose.',
    variables: ['NPC', 'BUSINESS_TYPE', 'CREDITOR'],
    spreadRate: 6,
    truthValue: 0.7,
    interestDecay: 21,
    embellishments: [
      'The employees have not been paid in weeks.',
      'They are secretly selling off inventory.',
      'A buyer from {DISTANT_TOWN} is interested.',
    ],
    degradations: [
      'They might have found an investor.',
      'Business has picked up recently.',
    ],
    triggerEvents: ['business_bankruptcy', 'employee_fired'],
  },
  {
    id: 'scandal_inheritance_1',
    category: GossipCategory.PERSONAL,
    tone: 'scandal',
    template:
      '{NPC} changed {DECEASED}\'s will right before they died. The original heirs are furious, and there is talk of a lawsuit.',
    variables: ['NPC', 'DECEASED'],
    spreadRate: 7,
    truthValue: 0.5,
    interestDecay: 30,
    embellishments: [
      'The signature looks forged.',
      '{DECEASED} was not in their right mind at the end.',
      'A lawyer from {DISTANT_TOWN} is investigating.',
    ],
    degradations: [
      '{DECEASED} may have changed it themselves.',
      'The original will was never properly filed.',
    ],
    triggerEvents: ['character_death', 'inheritance'],
  },
  {
    id: 'scandal_fake_identity_1',
    category: GossipCategory.SECRET,
    tone: 'scandal',
    template:
      'That {PROFESSION} {NPC} is a fraud. They never graduated from any {INSTITUTION}. Someone found out they bought their credentials in {ORIGIN}.',
    variables: ['PROFESSION', 'NPC', 'INSTITUTION', 'ORIGIN'],
    spreadRate: 8,
    truthValue: 0.4,
    interestDecay: 21,
    embellishments: [
      'Their real background is in {ALTERNATE_PROFESSION}.',
      'This is not the first town they have done this to.',
      'The real {PROFESSION} died under mysterious circumstances.',
    ],
    degradations: [
      'They might have trained informally.',
      'The credentials could be from another institution.',
    ],
  },
];

// ============================================================================
// RUMOR GOSSIP TEMPLATES (10)
// ============================================================================

export const RUMOR_TEMPLATES: GossipExpansionTemplate[] = [
  {
    id: 'rumor_gold_strike_1',
    category: GossipCategory.NEWS,
    tone: 'rumor',
    template:
      'Word is someone struck gold at {LOCATION}. {NPC} has been buying up mining equipment all week. Something big is about to happen.',
    variables: ['LOCATION', 'NPC'],
    spreadRate: 10,
    truthValue: 0.3,
    interestDecay: 7,
    locationRelevance: ['mines', 'general_store'],
    embellishments: [
      'The vein is twenty feet wide.',
      'It is the biggest strike since the \'49 rush.',
      'Prospectors are already heading out.',
    ],
    degradations: [
      'It might just be iron pyrite.',
      'The claim might already be staked.',
    ],
    triggerEvents: ['gold_found', 'mining_claim'],
  },
  {
    id: 'rumor_gang_planning_1',
    category: GossipCategory.CRIMINAL,
    tone: 'rumor',
    template:
      '{GANG} is planning something big at {LOCATION}. {NPC} overheard them talking at {MEETUP_LOCATION} about hitting it {TIME_PERIOD}.',
    variables: ['GANG', 'LOCATION', 'NPC', 'MEETUP_LOCATION', 'TIME_PERIOD'],
    spreadRate: 8,
    truthValue: 0.5,
    interestDecay: 3,
    factionRelevance: ['settlerAlliance', 'frontera'],
    embellishments: [
      'They have been casing the place for weeks.',
      'New gang members have been spotted in town.',
      'They have already bribed the night watchman.',
    ],
    degradations: [
      'It might be a different gang entirely.',
      'The target could be {ALTERNATE_LOCATION}.',
    ],
    triggerEvents: ['gang_spotted', 'robbery_planned'],
  },
  {
    id: 'rumor_railroad_coming_1',
    category: GossipCategory.NEWS,
    tone: 'rumor',
    template:
      'The railroad is coming through {TOWN}. {NPC} has inside information - surveyors will be here within {TIME_PERIOD}. Land prices are about to skyrocket.',
    variables: ['TOWN', 'NPC', 'TIME_PERIOD'],
    spreadRate: 9,
    truthValue: 0.6,
    interestDecay: 30,
    embellishments: [
      'The route was decided in Washington last week.',
      'Smart money is already buying up property.',
      'The station will be right where the old {BUILDING} stands.',
    ],
    degradations: [
      'The route might go through {ALTERNATE_TOWN} instead.',
      'The railroad company is still deciding.',
    ],
    triggerEvents: ['railroad_expansion', 'property_sale'],
  },
  {
    id: 'rumor_treasure_buried_1',
    category: GossipCategory.SECRET,
    tone: 'rumor',
    template:
      'Old {NPC} buried a fortune in {LOCATION} before they died. The map was split between their {NUMBER} children, and now everyone is searching.',
    variables: ['NPC', 'LOCATION', 'NUMBER'],
    spreadRate: 7,
    truthValue: 0.2,
    interestDecay: 60,
    embellishments: [
      'The treasure is worth over {AMOUNT} gold.',
      'Outlaws have already killed one of the heirs.',
      'Strange lights have been seen there at night.',
    ],
    degradations: [
      'The treasure might have already been found.',
      'It could be a hoax old {NPC} started themselves.',
    ],
    triggerEvents: ['character_death', 'treasure_hunt'],
  },
  {
    id: 'rumor_stranger_rich_1',
    category: GossipCategory.PERSONAL,
    tone: 'rumor',
    template:
      'That stranger who arrived last week is secretly rich. {NPC} says they saw {STRANGER} flash a roll of bills at {LOCATION} thick enough to choke a horse.',
    variables: ['NPC', 'STRANGER', 'LOCATION'],
    spreadRate: 6,
    truthValue: 0.4,
    interestDecay: 14,
    embellishments: [
      'They paid for a month at the hotel in cash.',
      'Their clothes are tailored - you can tell quality.',
      'They are here looking to invest.',
    ],
    degradations: [
      'The bills might have been counterfeit.',
      'They could be spending their last dollars.',
    ],
    triggerEvents: ['stranger_arrives', 'large_purchase'],
  },
  {
    id: 'rumor_indian_attack_1',
    category: GossipCategory.NEWS,
    tone: 'rumor',
    template:
      'The {TRIBE} are gathering at {LOCATION}. {NPC} rode past their camp and counted at least {NUMBER} warriors. Something is about to happen.',
    variables: ['TRIBE', 'LOCATION', 'NPC', 'NUMBER'],
    spreadRate: 9,
    truthValue: 0.3,
    interestDecay: 7,
    factionRelevance: ['settlerAlliance', 'nahiCoalition'],
    embellishments: [
      'They have been raiding homesteads to the {DIRECTION}.',
      'The army is being called in.',
      'Peace talks have broken down.',
    ],
    degradations: [
      'It was just a seasonal gathering.',
      'The numbers were exaggerated.',
    ],
    triggerEvents: ['tribal_gathering', 'conflict_brewing'],
  },
  {
    id: 'rumor_lawman_coming_1',
    category: GossipCategory.NEWS,
    tone: 'rumor',
    template:
      'A famous lawman is coming to clean up {TOWN}. {NPC} heard it is {FAMOUS_LAWMAN}. The outlaws are already getting nervous.',
    variables: ['TOWN', 'NPC', 'FAMOUS_LAWMAN'],
    spreadRate: 8,
    truthValue: 0.4,
    interestDecay: 14,
    factionRelevance: ['settlerAlliance'],
    embellishments: [
      'They have already sent scouts.',
      'Several wanted men have skipped town.',
      'The marshal was asked to step down.',
    ],
    degradations: [
      'It might be a different lawman.',
      'The visit might just be social.',
    ],
    triggerEvents: ['lawman_arrives', 'crime_wave'],
  },
  {
    id: 'rumor_drought_coming_1',
    category: GossipCategory.NEWS,
    tone: 'rumor',
    template:
      'The old-timers are saying a drought is coming. {NPC} noticed the {ANIMAL}s are all heading {DIRECTION}. It has not rained in {TIME_PERIOD}.',
    variables: ['NPC', 'ANIMAL', 'DIRECTION', 'TIME_PERIOD'],
    spreadRate: 5,
    truthValue: 0.6,
    interestDecay: 30,
    locationRelevance: ['ranch', 'farm'],
    embellishments: [
      'The wells are already running low.',
      'Ranchers are selling off cattle.',
      'Water rights are being contested.',
    ],
    degradations: [
      'It might just be a dry spell.',
      'The mountains got good snowfall this year.',
    ],
    triggerEvents: ['weather_change', 'drought'],
  },
  {
    id: 'rumor_haunted_location_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'rumor',
    template:
      '{LOCATION} is haunted. {NPC} spent the night there and heard {SPOOKY_SOUND}. The ghost of {DECEASED} still walks those halls.',
    variables: ['LOCATION', 'NPC', 'SPOOKY_SOUND', 'DECEASED'],
    spreadRate: 6,
    truthValue: 0.1,
    interestDecay: 60,
    embellishments: [
      'Three people have died there under mysterious circumstances.',
      'The {DECEASED} was murdered and never got justice.',
      'Animals refuse to go near the place.',
    ],
    degradations: [
      'It was probably just the wind.',
      '{NPC} had been drinking that night.',
    ],
    triggerEvents: ['character_death', 'supernatural_event'],
  },
  {
    id: 'rumor_medicine_show_1',
    category: GossipCategory.NEWS,
    tone: 'rumor',
    template:
      'That medicine show is not what it seems. {NPC} says the "doctor" is actually running {CRIMINAL_ACTIVITY}. The sheriff is looking into it.',
    variables: ['NPC', 'CRIMINAL_ACTIVITY'],
    spreadRate: 5,
    truthValue: 0.5,
    interestDecay: 7,
    embellishments: [
      'Several townspeople have gone missing.',
      'The elixir contains {DANGEROUS_SUBSTANCE}.',
      'They are recruiting for a gang.',
    ],
    degradations: [
      'The doctor might be legitimate.',
      '{NPC} has a grudge against traveling salesmen.',
    ],
    triggerEvents: ['medicine_show', 'stranger_arrives'],
  },
];

// ============================================================================
// NEWS GOSSIP TEMPLATES (10)
// ============================================================================

export const NEWS_TEMPLATES: GossipExpansionTemplate[] = [
  {
    id: 'news_crime_committed_1',
    category: GossipCategory.CRIMINAL,
    tone: 'news',
    template:
      '{PLAYER} robbed {VICTIM} right in front of {LOCATION}! They got away with {AMOUNT} gold. The sheriff is forming a posse as we speak.',
    variables: ['PLAYER', 'VICTIM', 'LOCATION', 'AMOUNT'],
    spreadRate: 9,
    truthValue: 0.9,
    interestDecay: 7,
    factionRelevance: ['settlerAlliance'],
    embellishments: [
      '{VICTIM} was left bleeding in the street.',
      'They threatened to come back.',
      'This is not their first crime.',
    ],
    degradations: [
      'The amount might be exaggerated.',
      '{VICTIM} may have provoked them.',
    ],
    triggerEvents: ['crime_committed', 'robbery'],
  },
  {
    id: 'news_duel_1',
    category: GossipCategory.CONFLICT,
    tone: 'news',
    template:
      '{PLAYER} faced down {NPC} at high noon in front of the {LOCATION}. {WINNER} walked away, and {LOSER} was carried off by the undertaker.',
    variables: ['PLAYER', 'NPC', 'LOCATION', 'WINNER', 'LOSER'],
    spreadRate: 10,
    truthValue: 1.0,
    interestDecay: 14,
    embellishments: [
      '{WINNER} did not even flinch.',
      'It was over in three seconds.',
      '{LOSER} drew first but missed.',
    ],
    degradations: [
      'Some say {WINNER} cheated.',
      '{LOSER} was drunk at the time.',
    ],
    triggerEvents: ['duel_completed', 'character_death'],
  },
  {
    id: 'news_gang_war_1',
    category: GossipCategory.CRIMINAL,
    tone: 'news',
    template:
      '{GANG1} and {GANG2} are at war. There was a shootout at {LOCATION} last night - {CASUALTY_COUNT} dead. This town is about to become a battlefield.',
    variables: ['GANG1', 'GANG2', 'LOCATION', 'CASUALTY_COUNT'],
    spreadRate: 10,
    truthValue: 0.8,
    interestDecay: 7,
    factionRelevance: ['frontera'],
    embellishments: [
      'The leaders have put bounties on each other.',
      'Innocent bystanders were caught in the crossfire.',
      'The army might be called in.',
    ],
    degradations: [
      'It might have been a misunderstanding.',
      'The casualty count varies by who you ask.',
    ],
    triggerEvents: ['gang_war', 'combat_completed'],
  },
  {
    id: 'news_business_opened_1',
    category: GossipCategory.BUSINESS,
    tone: 'news',
    template:
      '{NPC} just opened a new {BUSINESS_TYPE} at {LOCATION}. Grand opening was yesterday - {SPECIAL_OFFER}. Competition for {COMPETITOR} now.',
    variables: ['NPC', 'BUSINESS_TYPE', 'LOCATION', 'SPECIAL_OFFER', 'COMPETITOR'],
    spreadRate: 6,
    truthValue: 1.0,
    interestDecay: 7,
    embellishments: [
      'They brought in goods from {DISTANT_TOWN}.',
      'Prices are lower than {COMPETITOR}.',
      'The place is fancier than anything we have seen.',
    ],
    degradations: [],
    triggerEvents: ['business_opened', 'new_shop'],
  },
  {
    id: 'news_election_1',
    category: GossipCategory.POLITICAL,
    tone: 'news',
    template:
      'The election for {POSITION} is coming up. {NPC1} and {NPC2} are running against each other. It is getting ugly - {CONFLICT_DETAILS}.',
    variables: ['POSITION', 'NPC1', 'NPC2', 'CONFLICT_DETAILS'],
    spreadRate: 7,
    truthValue: 0.9,
    interestDecay: 14,
    embellishments: [
      '{NPC1} is spreading rumors about {NPC2}\'s past.',
      'Bribes are being offered for votes.',
      'The {FACTION} is backing {NPC1}.',
    ],
    degradations: [
      'The conflict might be staged for attention.',
    ],
    triggerEvents: ['election', 'political_event'],
  },
  {
    id: 'news_marriage_1',
    category: GossipCategory.ROMANCE,
    tone: 'news',
    template:
      '{NPC1} and {NPC2} are getting married! The ceremony will be at {LOCATION} in {TIME_PERIOD}. Half the town is invited.',
    variables: ['NPC1', 'NPC2', 'LOCATION', 'TIME_PERIOD'],
    spreadRate: 7,
    truthValue: 1.0,
    interestDecay: 30,
    embellishments: [
      'It is quite the match - their families have money.',
      'There is talk of a massive dowry.',
      '{NPC3} is heartbroken.',
    ],
    degradations: [],
    triggerEvents: ['marriage', 'engagement'],
  },
  {
    id: 'news_death_1',
    category: GossipCategory.NEWS,
    tone: 'news',
    template:
      '{NPC} passed away {TIME_PERIOD}. They found the body at {LOCATION}. Cause of death: {CAUSE_OF_DEATH}. The funeral is {FUNERAL_TIME}.',
    variables: ['NPC', 'TIME_PERIOD', 'LOCATION', 'CAUSE_OF_DEATH', 'FUNERAL_TIME'],
    spreadRate: 8,
    truthValue: 1.0,
    interestDecay: 14,
    embellishments: [
      'They left behind {NUMBER} children.',
      'The inheritance is being contested.',
      'Some say the death was not natural.',
    ],
    degradations: [
      'The cause of death might be different.',
    ],
    triggerEvents: ['character_death', 'funeral'],
  },
  {
    id: 'news_arrest_1',
    category: GossipCategory.CRIMINAL,
    tone: 'news',
    template:
      'The sheriff arrested {PLAYER} for {CRIME}. They are locked up in the town jail. Bail is set at {AMOUNT} gold.',
    variables: ['PLAYER', 'CRIME', 'AMOUNT'],
    spreadRate: 8,
    truthValue: 1.0,
    interestDecay: 7,
    factionRelevance: ['settlerAlliance'],
    embellishments: [
      'They resisted arrest and were beaten.',
      'This is their {NUMBER}th offense.',
      'The evidence is overwhelming.',
    ],
    degradations: [
      '{PLAYER} claims they were framed.',
      'The witness might be unreliable.',
    ],
    triggerEvents: ['player_arrested', 'jail'],
  },
  {
    id: 'news_property_sale_1',
    category: GossipCategory.BUSINESS,
    tone: 'news',
    template:
      '{NPC} just bought {PROPERTY} for {AMOUNT} gold. That is {COMPARISON} what it was worth. Something is going on.',
    variables: ['NPC', 'PROPERTY', 'AMOUNT', 'COMPARISON'],
    spreadRate: 5,
    truthValue: 0.9,
    interestDecay: 14,
    embellishments: [
      'They paid in cash, on the spot.',
      'Investors from {DISTANT_TOWN} were outbid.',
      'This is part of a larger plan.',
    ],
    degradations: [
      'The sale price might be wrong.',
    ],
    triggerEvents: ['property_purchase', 'land_sale'],
  },
  {
    id: 'news_contest_winner_1',
    category: GossipCategory.NEWS,
    tone: 'news',
    template:
      '{PLAYER} won the {CONTEST_TYPE} at {LOCATION}! They beat {COMPETITOR} and won {PRIZE}. Quite the show!',
    variables: ['PLAYER', 'CONTEST_TYPE', 'LOCATION', 'COMPETITOR', 'PRIZE'],
    spreadRate: 7,
    truthValue: 1.0,
    interestDecay: 7,
    embellishments: [
      'The crowd went wild.',
      '{COMPETITOR} demanded a rematch.',
      '{PLAYER} celebrated at the saloon afterward.',
    ],
    degradations: [],
    triggerEvents: ['contest_won', 'tournament'],
  },
];

// ============================================================================
// SECRET GOSSIP TEMPLATES (10)
// ============================================================================

export const SECRET_TEMPLATES: GossipExpansionTemplate[] = [
  {
    id: 'secret_hidden_gold_1',
    category: GossipCategory.SECRET,
    tone: 'secret',
    template:
      'Keep this between us - {NPC} has gold hidden at {LOCATION}. They do not trust the bank after what happened in {INCIDENT}.',
    variables: ['NPC', 'LOCATION', 'INCIDENT'],
    spreadRate: 4,
    truthValue: 0.6,
    interestDecay: 60,
    embellishments: [
      'It is buried under the {LANDMARK}.',
      'Only their {FAMILY_MEMBER} knows.',
      'The hiding spot has a coded lock.',
    ],
    degradations: [
      'The gold might have been moved.',
      'Someone else might have already found it.',
    ],
    triggerEvents: ['large_deposit', 'bank_robbery'],
  },
  {
    id: 'secret_informant_1',
    category: GossipCategory.SECRET,
    tone: 'secret',
    template:
      '{NPC} is an informant for {FACTION}. They have been passing information about {TARGET} for months. Do not let them know you know.',
    variables: ['NPC', 'FACTION', 'TARGET'],
    spreadRate: 3,
    truthValue: 0.5,
    interestDecay: 30,
    factionRelevance: ['settlerAlliance', 'frontera'],
    embellishments: [
      'They are being paid handsomely.',
      'Several arrests have been made because of them.',
      'Their cover is about to be blown.',
    ],
    degradations: [
      'They might be a double agent.',
      'The information is outdated.',
    ],
    triggerEvents: ['arrest', 'betrayal'],
  },
  {
    id: 'secret_tunnel_1',
    category: GossipCategory.SECRET,
    tone: 'secret',
    template:
      'There is a secret tunnel connecting {LOCATION1} and {LOCATION2}. {NPC} uses it for {PURPOSE}. The entrance is behind the {HIDDEN_ENTRANCE}.',
    variables: ['LOCATION1', 'LOCATION2', 'NPC', 'PURPOSE', 'HIDDEN_ENTRANCE'],
    spreadRate: 4,
    truthValue: 0.4,
    interestDecay: 90,
    embellishments: [
      'The tunnel was dug during the war.',
      'Outlaws use it to escape the law.',
      'It connects to the old mine system.',
    ],
    degradations: [
      'The tunnel might have collapsed.',
      'The entrance has been sealed.',
    ],
    triggerEvents: ['escape', 'smuggling'],
  },
  {
    id: 'secret_gang_member_1',
    category: GossipCategory.CRIMINAL,
    tone: 'secret',
    template:
      '{NPC} is secretly a member of {GANG}. They use their position as {ROLE} to gather information. Watch what you say around them.',
    variables: ['NPC', 'GANG', 'ROLE'],
    spreadRate: 5,
    truthValue: 0.4,
    interestDecay: 30,
    factionRelevance: ['settlerAlliance', 'frontera'],
    embellishments: [
      'They were recruited {TIME_PERIOD} ago.',
      'They helped plan the {CRIME}.',
      'Other members of the gang visit them at night.',
    ],
    degradations: [
      'They might just be sympathizers.',
      'The gang connection might be exaggerated.',
    ],
    triggerEvents: ['gang_activity', 'crime_wave'],
  },
  {
    id: 'secret_affair_ongoing_1',
    category: GossipCategory.ROMANCE,
    tone: 'secret',
    template:
      '{NPC1} and {NPC2} have been carrying on for {TIME_PERIOD}. {SPOUSE} has no idea. They meet at {LOCATION} when {ALIBI}.',
    variables: ['NPC1', 'NPC2', 'TIME_PERIOD', 'SPOUSE', 'LOCATION', 'ALIBI'],
    spreadRate: 6,
    truthValue: 0.7,
    interestDecay: 30,
    embellishments: [
      'They plan to run away together.',
      'A child may be involved.',
      'Someone is blackmailing them.',
    ],
    degradations: [
      'The affair might be over.',
      'They might just be close friends.',
    ],
    triggerEvents: ['suspicious_behavior', 'affair_discovered'],
  },
  {
    id: 'secret_escape_plan_1',
    category: GossipCategory.SECRET,
    tone: 'secret',
    template:
      '{NPC} is planning to skip town. They have tickets for the {TRANSPORT} to {DESTINATION} leaving {TIME_PERIOD}. They owe too many people money.',
    variables: ['NPC', 'TRANSPORT', 'DESTINATION', 'TIME_PERIOD'],
    spreadRate: 5,
    truthValue: 0.6,
    interestDecay: 7,
    embellishments: [
      'They sold their property in secret.',
      'They have already sent their valuables ahead.',
      'Creditors are watching them.',
    ],
    degradations: [
      'They might have changed their plans.',
      'The debts might have been paid.',
    ],
    triggerEvents: ['debt', 'travel_booked'],
  },
  {
    id: 'secret_land_deal_1',
    category: GossipCategory.BUSINESS,
    tone: 'secret',
    template:
      'There is a secret land deal happening at {LOCATION}. {NPC1} and {NPC2} are buying up all the properties because {REASON}. Prices will triple within {TIME_PERIOD}.',
    variables: ['LOCATION', 'NPC1', 'NPC2', 'REASON', 'TIME_PERIOD'],
    spreadRate: 6,
    truthValue: 0.5,
    interestDecay: 30,
    embellishments: [
      'Government contracts are involved.',
      'The railroad route was decided.',
      'Mining surveys found something valuable.',
    ],
    degradations: [
      'The deal might fall through.',
      'The information could be planted.',
    ],
    triggerEvents: ['property_sale', 'railroad_news'],
  },
  {
    id: 'secret_witch_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'secret',
    template:
      '{NPC} practices the dark arts. {WITNESS} saw them {RITUAL_ACTION} at {LOCATION} under the full moon. Strange things happen around them.',
    variables: ['NPC', 'WITNESS', 'RITUAL_ACTION', 'LOCATION'],
    spreadRate: 5,
    truthValue: 0.1,
    interestDecay: 60,
    embellishments: [
      'Livestock have been dying mysteriously.',
      'They can curse people who cross them.',
      'The preacher refuses to go near their home.',
    ],
    degradations: [
      'It might have been herbal medicine.',
      '{WITNESS} was probably drunk.',
    ],
    triggerEvents: ['supernatural_event', 'unexplained_death'],
  },
  {
    id: 'secret_lawman_corrupt_1',
    category: GossipCategory.POLITICAL,
    tone: 'secret',
    template:
      'The {LAWMAN_TITLE} is on {GANG}\'s payroll. {NPC} saw the payments happen at {LOCATION}. That is why no one from that gang ever gets arrested.',
    variables: ['LAWMAN_TITLE', 'GANG', 'NPC', 'LOCATION'],
    spreadRate: 6,
    truthValue: 0.4,
    interestDecay: 30,
    factionRelevance: ['settlerAlliance', 'frontera'],
    embellishments: [
      'Half the deputies are in on it.',
      'Evidence has been disappearing from the jail.',
      'Witnesses have been intimidated.',
    ],
    degradations: [
      'The payments might be legitimate.',
      '{NPC} has reasons to lie.',
    ],
    triggerEvents: ['escape', 'corrupt_official'],
  },
  {
    id: 'secret_true_identity_1',
    category: GossipCategory.SECRET,
    tone: 'secret',
    template:
      '{NPC} is actually {TRUE_IDENTITY}. They faked their death in {ORIGIN} {TIME_PERIOD} ago. {EVIDENCE} proves it.',
    variables: ['NPC', 'TRUE_IDENTITY', 'ORIGIN', 'TIME_PERIOD', 'EVIDENCE'],
    spreadRate: 4,
    truthValue: 0.3,
    interestDecay: 60,
    embellishments: [
      'There is a bounty still active.',
      'Family members are searching for them.',
      'They killed someone to fake the death.',
    ],
    degradations: [
      'It could be a case of mistaken identity.',
      'The evidence might be circumstantial.',
    ],
    triggerEvents: ['stranger_arrives', 'past_revealed'],
  },
];

// ============================================================================
// WARNING GOSSIP TEMPLATES (10)
// ============================================================================

export const WARNING_TEMPLATES: GossipExpansionTemplate[] = [
  {
    id: 'warning_outlaw_dangerous_1',
    category: GossipCategory.CRIMINAL,
    tone: 'warning',
    template:
      'Stay clear of {PLAYER}. They have killed {KILL_COUNT} men and have no qualms about adding to that number. The bounty on their head is {BOUNTY} gold.',
    variables: ['PLAYER', 'KILL_COUNT', 'BOUNTY'],
    spreadRate: 8,
    truthValue: 0.8,
    interestDecay: 14,
    factionRelevance: ['settlerAlliance'],
    embellishments: [
      'They do not give warnings.',
      'Even other outlaws avoid them.',
      'The last person who crossed them was found in pieces.',
    ],
    degradations: [
      'The kill count might be inflated.',
      'Some of those were in self-defense.',
    ],
    triggerEvents: ['combat_completed', 'wanted_poster'],
  },
  {
    id: 'warning_cheater_1',
    category: GossipCategory.PERSONAL,
    tone: 'warning',
    template:
      'Do not gamble with {NPC} - they cheat. {WITNESS} saw them {CHEATING_METHOD} at {LOCATION}. Anyone who calls them out ends up in trouble.',
    variables: ['NPC', 'WITNESS', 'CHEATING_METHOD', 'LOCATION'],
    spreadRate: 6,
    truthValue: 0.7,
    interestDecay: 30,
    embellishments: [
      'They have been doing it for years.',
      'The house is in on it.',
      'They carry a derringer up their sleeve.',
    ],
    degradations: [
      '{WITNESS} was just a sore loser.',
      'It might have been a one-time thing.',
    ],
    triggerEvents: ['gambling', 'cheating_caught'],
  },
  {
    id: 'warning_location_dangerous_1',
    category: GossipCategory.NEWS,
    tone: 'warning',
    template:
      'Do not go near {LOCATION} after dark. {DANGER_REASON}. {NPC} went there {TIME_PERIOD} ago and {BAD_OUTCOME}.',
    variables: ['LOCATION', 'DANGER_REASON', 'NPC', 'TIME_PERIOD', 'BAD_OUTCOME'],
    spreadRate: 7,
    truthValue: 0.6,
    interestDecay: 30,
    locationRelevance: ['wilderness', 'outskirts'],
    embellishments: [
      'The bodies are never found.',
      'Strange lights have been seen there.',
      'Even the animals avoid it.',
    ],
    degradations: [
      '{NPC} was probably just careless.',
      'It might just be old superstition.',
    ],
    triggerEvents: ['character_death', 'disappearance'],
  },
  {
    id: 'warning_gang_territory_1',
    category: GossipCategory.CRIMINAL,
    tone: 'warning',
    template:
      '{LOCATION} is {GANG} territory now. Anyone who goes there without their say-so does not come back. They control everything from {BOUNDARY1} to {BOUNDARY2}.',
    variables: ['LOCATION', 'GANG', 'BOUNDARY1', 'BOUNDARY2'],
    spreadRate: 7,
    truthValue: 0.9,
    interestDecay: 30,
    factionRelevance: ['frontera'],
    embellishments: [
      'They have watchers posted at every entrance.',
      'Locals pay them protection money.',
      'The law has given up on that area.',
    ],
    degradations: [
      'Their grip might be loosening.',
      'A rival gang is moving in.',
    ],
    triggerEvents: ['gang_territory', 'gang_war'],
  },
  {
    id: 'warning_disease_outbreak_1',
    category: GossipCategory.NEWS,
    tone: 'warning',
    template:
      'There is {DISEASE} going around. Stay away from {LOCATION} - {NUMBER} people have already caught it. Doc {DOCTOR} says it spreads through {TRANSMISSION}.',
    variables: ['DISEASE', 'LOCATION', 'NUMBER', 'DOCTOR', 'TRANSMISSION'],
    spreadRate: 9,
    truthValue: 0.8,
    interestDecay: 14,
    embellishments: [
      '{NUMBER} have already died.',
      'The quarantine is not holding.',
      'Medicine supplies are running low.',
    ],
    degradations: [
      'It might just be a bad cold.',
      'The numbers are exaggerated.',
    ],
    triggerEvents: ['disease_outbreak', 'multiple_deaths'],
  },
  {
    id: 'warning_flood_coming_1',
    category: GossipCategory.NEWS,
    tone: 'warning',
    template:
      'The {RIVER} is rising fast. {NPC} says the dam at {LOCATION} is showing cracks. Get to high ground if you are anywhere near {DANGER_ZONE}.',
    variables: ['RIVER', 'NPC', 'LOCATION', 'DANGER_ZONE'],
    spreadRate: 10,
    truthValue: 0.7,
    interestDecay: 3,
    embellishments: [
      'The last flood destroyed half the town.',
      'Evacuations have already started.',
      'It could break any moment.',
    ],
    degradations: [
      'Engineers say the dam is fine.',
      'The water levels are stabilizing.',
    ],
    triggerEvents: ['weather_event', 'disaster_imminent'],
  },
  {
    id: 'warning_scam_artist_1',
    category: GossipCategory.PERSONAL,
    tone: 'warning',
    template:
      'That {PROFESSION} {NPC} is running a scam. They did the same thing in {PREVIOUS_TOWN} - took people for {AMOUNT} gold before skipping town.',
    variables: ['PROFESSION', 'NPC', 'PREVIOUS_TOWN', 'AMOUNT'],
    spreadRate: 7,
    truthValue: 0.6,
    interestDecay: 14,
    embellishments: [
      'The law in {PREVIOUS_TOWN} is still looking for them.',
      'They use a different name everywhere they go.',
      'Someone here already fell for it.',
    ],
    degradations: [
      'It might be a case of mistaken identity.',
      'They might have reformed.',
    ],
    triggerEvents: ['stranger_arrives', 'fraud'],
  },
  {
    id: 'warning_vendetta_1',
    category: GossipCategory.CONFLICT,
    tone: 'warning',
    template:
      '{NPC1} has sworn to kill {NPC2}. It is over {REASON}. Anyone caught between them will regret it. The showdown is coming.',
    variables: ['NPC1', 'NPC2', 'REASON'],
    spreadRate: 8,
    truthValue: 0.9,
    interestDecay: 7,
    embellishments: [
      'Both are hiring backup.',
      'The whole family is getting involved.',
      'The marshal cannot stop it.',
    ],
    degradations: [
      'They might work it out.',
      'One of them is planning to leave town.',
    ],
    triggerEvents: ['conflict', 'duel_challenge'],
  },
  {
    id: 'warning_counterfeit_1',
    category: GossipCategory.CRIMINAL,
    tone: 'warning',
    template:
      'Counterfeit bills are circulating. {NPC} at {LOCATION} got stuck with {AMOUNT} in fake notes. Check your money carefully - look for {TELLTALE_SIGN}.',
    variables: ['NPC', 'LOCATION', 'AMOUNT', 'TELLTALE_SIGN'],
    spreadRate: 8,
    truthValue: 0.9,
    interestDecay: 14,
    embellishments: [
      'The fakes are almost perfect.',
      'Federal agents are investigating.',
      'Several businesses have already been hit.',
    ],
    degradations: [
      'The counterfeiter might have been caught.',
      'Only a small batch was circulated.',
    ],
    triggerEvents: ['counterfeiting', 'fraud'],
  },
  {
    id: 'warning_predator_1',
    category: GossipCategory.NEWS,
    tone: 'warning',
    template:
      'A {PREDATOR} has been spotted near {LOCATION}. It killed {VICTIM} already. Do not travel alone, and keep your animals locked up at night.',
    variables: ['PREDATOR', 'LOCATION', 'VICTIM'],
    spreadRate: 8,
    truthValue: 0.8,
    interestDecay: 14,
    locationRelevance: ['wilderness', 'ranch', 'farm'],
    embellishments: [
      'It is the biggest one anyone has ever seen.',
      'Hunters have been tracking it for weeks.',
      'There is a bounty on it.',
    ],
    degradations: [
      'It might have moved on.',
      'The sighting was probably a different animal.',
    ],
    triggerEvents: ['animal_attack', 'livestock_killed'],
  },
];

// ============================================================================
// SUPERNATURAL GOSSIP TEMPLATES (50+) - AAA COSMIC HORROR INTEGRATION
// Fallout New Vegas style - darkness woven naturally into the world
// ============================================================================

export const SUPERNATURAL_TEMPLATES: GossipExpansionTemplate[] = [
  // === GHOST SIGHTINGS (10) ===
  {
    id: 'supernatural_ghost_rider_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "The Ghost Riders were seen at Dead Man's Canyon again last {TIME_PERIOD}. {NPC} said the lead rider looked right at 'em with eyes like burnin' coals. Horses left no tracks come mornin'.",
    variables: ['TIME_PERIOD', 'NPC'],
    spreadRate: 7,
    truthValue: 0.9,
    interestDecay: 14,
    embellishments: [
      "They was wearin' Confederate gray, torn and bloodied.",
      "The horses was screamin' but made no sound.",
      "They vanished when the church bell struck midnight.",
    ],
    degradations: [
      "Might've been a dust devil playin' tricks.",
      "{NPC} had been drinkin' that night.",
    ],
    triggerEvents: ['supernatural_event', 'midnight_activity'],
  },
  {
    id: 'supernatural_ghost_woman_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'rumor',
    template:
      "There's a woman in white been seen walkin' the ridge near {LOCATION}. {NPC} swears it's the spirit of {DECEASED} who died there back in '62. She's searchin' for somethin'.",
    variables: ['LOCATION', 'NPC', 'DECEASED'],
    spreadRate: 6,
    truthValue: 0.4,
    interestDecay: 30,
    embellishments: [
      "She was cryin' tears of blood.",
      "Anyone who follows her disappears for three days.",
      "She only appears when someone's 'bout to die.",
    ],
    degradations: [
      "Probably just mist off the river.",
      "Could've been an owl in the moonlight.",
    ],
  },
  {
    id: 'supernatural_phantom_stage_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "The phantom stagecoach was spotted on the old road to {LOCATION}. {NPC} heard the horses and wheels but couldn't see nothin' - just felt the wind as it passed. Carries the souls of them murdered in the '58 massacre.",
    variables: ['LOCATION', 'NPC'],
    spreadRate: 5,
    truthValue: 0.3,
    interestDecay: 45,
    embellishments: [
      "If you hear it, don't look - your eyes'll burn out.",
      "The driver has no head.",
      "Gold coins fall from the wheels but turn to dust at dawn.",
    ],
    degradations: [
      "The road plays tricks with sound at night.",
    ],
  },
  {
    id: 'supernatural_mirror_ghost_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'secret',
    template:
      "The mirror in {LOCATION}'s back room shows things that ain't there. {NPC} looked into it and saw themselves dead - hangin' from a tree. Week later, {RELATED_NPC} found 'em the same way.",
    variables: ['LOCATION', 'NPC', 'RELATED_NPC'],
    spreadRate: 8,
    truthValue: 0.2,
    interestDecay: 60,
    embellishments: [
      "The mirror came from a witch's estate.",
      "It shows how you'll die.",
      "They covered it but the cloth keeps fallin' off by itself.",
    ],
    degradations: [
      "Probably just a warped reflection.",
      "Coincidence and superstition.",
    ],
  },
  {
    id: 'supernatural_cold_spot_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'rumor',
    template:
      "There's a spot behind {LOCATION} where it's always cold, even in summer. Dogs won't go near it. {NPC} says that's where they buried the bodies after the {EVENT}.",
    variables: ['LOCATION', 'NPC', 'EVENT'],
    spreadRate: 5,
    truthValue: 0.6,
    interestDecay: 90,
    embellishments: [
      "Flowers won't grow there.",
      "You can hear whisperin' if you stand still.",
      "Ground's always wet like blood that won't dry.",
    ],
    degradations: [
      "Might just be underground water.",
    ],
  },
  {
    id: 'supernatural_death_omen_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "{NPC} saw a black dog with glowin' eyes outside {PERSON}'s house three nights runnin'. That's the death omen - someone in that house ain't long for this world.",
    variables: ['NPC', 'PERSON'],
    spreadRate: 6,
    truthValue: 0.2,
    interestDecay: 7,
    embellishments: [
      "Same dog was seen before {DECEASED} died.",
      "It don't leave tracks.",
      "Bullets pass right through it.",
    ],
    degradations: [
      "Just a stray from the Kaiowa lands.",
      "Seen a lot of black dogs lately.",
    ],
  },
  {
    id: 'supernatural_hanged_man_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'scandal',
    template:
      "The ghost of {EXECUTED} still swings from the hangin' tree at {LOCATION}. {NPC} saw him clear as day - rope around his neck, face all purple, mouthin' the name of whoever really done the crime.",
    variables: ['EXECUTED', 'LOCATION', 'NPC'],
    spreadRate: 7,
    truthValue: 0.4,
    interestDecay: 60,
    embellishments: [
      "He points at someone different each night.",
      "The rope's still there even though they cut it down.",
      "He was innocent - hanged an innocent man.",
    ],
    degradations: [
      "Wind makes strange shapes at night.",
    ],
  },
  {
    id: 'supernatural_crying_baby_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "If you hear a baby cryin' out in the desert near {LOCATION}, don't follow the sound. It's La Llorona - the weeping woman. {NPC}'s cousin followed it once and was found three days later, drowned in two inches of water.",
    variables: ['LOCATION', 'NPC'],
    spreadRate: 8,
    truthValue: 0.3,
    interestDecay: 45,
    factionRelevance: ['frontera'],
    embellishments: [
      "She's searchin' for her own children she killed.",
      "She wears all white and floats above the ground.",
      "If she catches you, she drowns you in your own tears.",
    ],
    degradations: [
      "Just coyotes - sound like babies at night.",
    ],
  },
  {
    id: 'supernatural_piano_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'rumor',
    template:
      "The piano at {LOCATION} plays by itself at 3 AM. Same song every night - a waltz {DECEASED} used to play before they was murdered. {NPC} heard it clear as day.",
    variables: ['LOCATION', 'DECEASED', 'NPC'],
    spreadRate: 5,
    truthValue: 0.3,
    interestDecay: 30,
    embellishments: [
      "The keys move but nobody's there.",
      "It stops the second you open the door.",
      "Sometimes you hear a woman singin' along.",
    ],
    degradations: [
      "Old building settlin'.",
      "Mice on the keys.",
    ],
  },
  {
    id: 'supernatural_burial_ground_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "{LOCATION} was built on an old burial ground. The Kaiowa warned 'em, but they built anyway. Now the dead walk at night - {NPC} seen 'em, shadows with no faces diggin' at the earth.",
    variables: ['LOCATION', 'NPC'],
    spreadRate: 6,
    truthValue: 0.5,
    interestDecay: 90,
    factionRelevance: ['kaiowa'],
    embellishments: [
      "Animals won't go near it after dark.",
      "Plants grow twisted and wrong.",
      "Strange voices come up from the ground.",
    ],
    degradations: [
      "Just old wives' tales.",
    ],
  },

  // === COSMIC HORROR (15) ===
  {
    id: 'supernatural_whispering_dark_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'secret',
    template:
      "There's somethin' in the old mine at {LOCATION}. {NPC} went down there to prospect and came back different. Won't say what they saw, but they stopped sleepin'. Draws strange symbols now. Whispers about 'the hunger below.'",
    variables: ['LOCATION', 'NPC'],
    spreadRate: 4,
    truthValue: 0.7,
    interestDecay: 60,
    embellishments: [
      "The symbols match Aztec death glyphs.",
      "Three others who went down never came back.",
      "You can hear somethin' breathin' at the tunnel mouth.",
    ],
    degradations: [
      "Mine gas makes people see things.",
    ],
    triggerEvents: ['mine_exploration', 'madness'],
  },
  {
    id: 'supernatural_stars_wrong_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "The stars ain't right tonight. {NPC} says there's a constellation that wasn't there last month - looks like a hand reachin' down. Old {ELDER} won't come out of their cabin. Says somethin's wakin' up.",
    variables: ['NPC', 'ELDER'],
    spreadRate: 3,
    truthValue: 0.1,
    interestDecay: 7,
    embellishments: [
      "Animals are actin' strange all over town.",
      "The well water tastes like copper.",
      "People been havin' the same nightmare.",
    ],
    degradations: [
      "Just seasonal changes.",
    ],
  },
  {
    id: 'supernatural_mass_nightmare_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "Half the town had the same dream last night. A city made of black stone under the desert. Somethin' with too many eyes askin' questions in a language that hurts to hear. {NPC} woke up with their nose bleedin'.",
    variables: ['NPC'],
    spreadRate: 9,
    truthValue: 0.8,
    interestDecay: 3,
    embellishments: [
      "The preacher says it's the Devil's work.",
      "Children are the worst affected.",
      "Some folks are afraid to sleep now.",
    ],
    degradations: [
      "Shared hysteria from bad water.",
    ],
    triggerEvents: ['supernatural_event', 'cosmic_horror'],
  },
  {
    id: 'supernatural_time_slip_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'rumor',
    template:
      "{NPC} went into {LOCATION} for ten minutes and came out three days later. Aged ten years. Won't talk about where they was. Just says 'it's bigger inside' over and over.",
    variables: ['NPC', 'LOCATION'],
    spreadRate: 4,
    truthValue: 0.2,
    interestDecay: 30,
    embellishments: [
      "Their hair turned white overnight.",
      "They can see things now - things we can't.",
      "Clocks stop working when they're nearby.",
    ],
    degradations: [
      "Probably just got lost and confused.",
    ],
  },
  {
    id: 'supernatural_skin_walker_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "The Kaiowa say a yee naaldlooshii is near {LOCATION}. {NPC} saw what looked like {PERSON} walkin' in the desert at midnight - but {PERSON} was asleep in their bed. Don't look at it. Don't say its name.",
    variables: ['LOCATION', 'NPC', 'PERSON'],
    spreadRate: 7,
    truthValue: 0.4,
    interestDecay: 14,
    factionRelevance: ['kaiowa'],
    embellishments: [
      "It can wear any face it wants.",
      "If it learns your name, you're marked.",
      "Only silver and turquoise can hurt it.",
    ],
    degradations: [
      "Just someone's twin or relative.",
    ],
    triggerEvents: ['supernatural_event', 'skinwalker'],
  },
  {
    id: 'supernatural_ancient_language_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'secret',
    template:
      "{NPC} found markings in the cave near {LOCATION}. Not Kaiowa, not Spanish, not nothin' human. Took rubbings of 'em. Now they talk in their sleep - in a language nobody knows - and their eyes bleed in the mornin'.",
    variables: ['NPC', 'LOCATION'],
    spreadRate: 4,
    truthValue: 0.3,
    interestDecay: 45,
    embellishments: [
      "The markings glow when there's no moon.",
      "Doc says their brain is changin'.",
      "They know things they shouldn't - secrets.",
    ],
    degradations: [
      "Probably just old miner's marks.",
    ],
  },
  {
    id: 'supernatural_thing_below_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "Somethin' lives under {LOCATION}. The ground shakes at night - not earthquakes, too regular. Like breathin'. {NPC} put their ear to the dirt and heard a heartbeat. Old as the hills. Hungry.",
    variables: ['LOCATION', 'NPC'],
    spreadRate: 5,
    truthValue: 0.2,
    interestDecay: 60,
    embellishments: [
      "The Kaiowa knew about it - that's why they never built there.",
      "It's been asleep for thousands of years.",
      "Somethin's tryin' to wake it up.",
    ],
    degradations: [
      "Underground river makes strange sounds.",
    ],
  },
  {
    id: 'supernatural_blood_moon_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "There's gonna be a blood moon in {TIME_PERIOD}. {NPC} says last time that happened, folks went mad. Three murders in one night. People doin' things they don't remember. Stay inside that night.",
    variables: ['TIME_PERIOD', 'NPC'],
    spreadRate: 8,
    truthValue: 0.7,
    interestDecay: 7,
    embellishments: [
      "The veil between worlds gets thin.",
      "The dead can walk free that night.",
      "Whatever you dream that night comes true.",
    ],
    degradations: [
      "Just superstition.",
    ],
  },
  {
    id: 'supernatural_possessed_preacher_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'scandal',
    template:
      "Something's wrong with {PREACHER}. Started speakin' in tongues during service - but it weren't the Holy Spirit. {NPC} recognized some words - ancient Kaiowa curses. The cross burned their hands.",
    variables: ['PREACHER', 'NPC'],
    spreadRate: 9,
    truthValue: 0.3,
    interestDecay: 14,
    embellishments: [
      "Their eyes turned black during the sermon.",
      "The church dog won't go near 'em.",
      "They know everyone's sins without confessin'.",
    ],
    degradations: [
      "Just exhaustion and fever.",
    ],
  },
  {
    id: 'supernatural_not_alone_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'secret',
    template:
      "We ain't alone out here. {NPC} found tracks in the desert - humanlike but wrong. Too many toes. Walks on all fours sometimes. The old-timers call 'em the First People. They was here before us. They're still here.",
    variables: ['NPC'],
    spreadRate: 4,
    truthValue: 0.2,
    interestDecay: 90,
    embellishments: [
      "They live in the deep caves.",
      "They watch from the shadows at night.",
      "They're waitin' for us to leave.",
    ],
    degradations: [
      "Just bear tracks distorted by rain.",
    ],
  },
  {
    id: 'supernatural_doorway_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'secret',
    template:
      "There's a doorway carved into the rock at {LOCATION}. Goes nowhere - just solid stone behind it. But {NPC} swears on their mother's grave they saw it open once. Saw what was on the other side. Won't say what.",
    variables: ['LOCATION', 'NPC'],
    spreadRate: 3,
    truthValue: 0.2,
    interestDecay: 90,
    embellishments: [
      "The carvin's older than the Kaiowa.",
      "There's dried blood in the grooves.",
      "At certain times, you can hear the other side.",
    ],
    degradations: [
      "Old Spanish missionary decoration.",
    ],
  },
  {
    id: 'supernatural_doppelganger_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "If you see yourself walkin' toward you, run. Don't talk to it. {NPC} saw their own self comin' down the road, smiled at 'em. Was dead within the week. The thing wearin' their face is still out there.",
    variables: ['NPC'],
    spreadRate: 6,
    truthValue: 0.1,
    interestDecay: 30,
    embellishments: [
      "It's lookin' for the next face to wear.",
      "It knows everything you know.",
      "The only way to kill it is to die yourself.",
    ],
    degradations: [
      "Heatstroke makes you see double.",
    ],
  },
  {
    id: 'supernatural_well_whispers_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'rumor',
    template:
      "Don't drink from the well at {LOCATION}. {NPC} heard voices comin' up from it - offerin' things. Power. Gold. Answers. All you gotta do is climb down. Three people have. None came back up.",
    variables: ['LOCATION', 'NPC'],
    spreadRate: 5,
    truthValue: 0.4,
    interestDecay: 60,
    embellishments: [
      "The water tastes like honey.",
      "You can see faces in the reflection.",
      "It's deeper than any well should be.",
    ],
    degradations: [
      "Echo playin' tricks.",
    ],
  },
  {
    id: 'supernatural_changed_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "{NPC} came back from {LOCATION} different. Same face, same voice, but somethin' behind the eyes ain't {NPC} no more. Knows things they shouldn't. Don't sleep. Don't blink. {WITNESS} says they ain't human no more.",
    variables: ['NPC', 'LOCATION', 'WITNESS'],
    spreadRate: 7,
    truthValue: 0.3,
    interestDecay: 21,
    embellishments: [
      "Their shadow moves wrong.",
      "Dogs howl when they walk by.",
      "Mirrors crack when they look in 'em.",
    ],
    degradations: [
      "Traumatic experience changed 'em is all.",
    ],
    triggerEvents: ['supernatural_event', 'possession'],
  },
  {
    id: 'supernatural_ritual_site_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'secret',
    template:
      "{NPC} found a clearing at {LOCATION} with stones arranged in a circle. Fresh blood on 'em. Symbols carved that hurt to look at. Someone's been worshippin' somethin' out there. Somethin' that answers.",
    variables: ['NPC', 'LOCATION'],
    spreadRate: 6,
    truthValue: 0.7,
    interestDecay: 30,
    embellishments: [
      "Bones was found nearby - human and animal mixed.",
      "The grass won't grow in the circle.",
      "Whoever's doin' it wears the town's face by day.",
    ],
    degradations: [
      "Outlaws leavin' false trails.",
    ],
    triggerEvents: ['ritual_discovery', 'cult_activity'],
  },

  // === CURSED OBJECTS & PLACES (10) ===
  {
    id: 'supernatural_cursed_gold_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "Don't touch the gold from {LOCATION}. It's cursed - everyone who's spent it has died within a month. {NPC} bought a horse with some of it. Horse went mad. {NPC}'s in the ground now.",
    variables: ['LOCATION', 'NPC'],
    spreadRate: 7,
    truthValue: 0.4,
    interestDecay: 45,
    embellishments: [
      "The gold was stolen from a temple.",
      "It belongs to somethin' that wants it back.",
      "You can hear it callin' to be spent.",
    ],
    degradations: [
      "Coincidence is all.",
    ],
  },
  {
    id: 'supernatural_haunted_gun_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'rumor',
    template:
      "The gun that killed {DECEASED} is cursed. {CURRENT_OWNER} has it now and they've killed {NUMBER} men since - can't seem to miss. But {NPC} says the gun's pullin' the trigger, not them. Wants more blood.",
    variables: ['DECEASED', 'CURRENT_OWNER', 'NUMBER', 'NPC'],
    spreadRate: 6,
    truthValue: 0.2,
    interestDecay: 30,
    embellishments: [
      "It fires even when it's empty.",
      "The barrel always points at someone.",
      "Previous owners all died holdin' it.",
    ],
    degradations: [
      "Just a skilled shooter.",
    ],
  },
  {
    id: 'supernatural_cursed_land_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "That plot of land outside {LOCATION} is cursed. Four families have tried to settle it - all dead within a year. Different causes, but all dead. {NPC} says the Kaiowa wouldn't even hunt there.",
    variables: ['LOCATION', 'NPC'],
    spreadRate: 5,
    truthValue: 0.6,
    interestDecay: 90,
    factionRelevance: ['kaiowa', 'settlerAlliance'],
    embellishments: [
      "Crops grow but they're poison.",
      "At night, you can hear diggin'.",
      "Somethin's buried there that don't want company.",
    ],
    degradations: [
      "Bad soil, bad luck.",
    ],
  },
  {
    id: 'supernatural_dead_mans_hand_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "{NPC} drew the Dead Man's Hand at {LOCATION} last night - aces and eights. Same hand Wild Bill was holdin' when he died. {WITNESS} says their face went white. Death comes in threes now.",
    variables: ['NPC', 'LOCATION', 'WITNESS'],
    spreadRate: 8,
    truthValue: 0.3,
    interestDecay: 7,
    embellishments: [
      "A cold wind blew through the room.",
      "The cards were ice cold to touch.",
      "They saw Bill's ghost behind them in the mirror.",
    ],
    degradations: [
      "Just bad luck at cards.",
    ],
  },
  {
    id: 'supernatural_music_box_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'secret',
    template:
      "{NPC} bought an old music box from a dead woman's estate. Plays by itself at night - a lullaby no one recognizes. Their child started seein' a woman in their room. Singin' along.",
    variables: ['NPC'],
    spreadRate: 5,
    truthValue: 0.3,
    interestDecay: 30,
    embellishments: [
      "The dead woman had no children.",
      "The box was made for someone specific.",
      "It's lookin' for the child it was meant for.",
    ],
    degradations: [
      "Children have active imaginations.",
    ],
  },
  {
    id: 'supernatural_medicine_bundle_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "A soldier stole a medicine bundle from a Kaiowa shaman. Within a week, everyone in his unit was dead - sickness, accidents, their own guns misfirin'. The bundle was never returned. Now it's at {LOCATION}. Bad things follow it.",
    variables: ['LOCATION'],
    spreadRate: 6,
    truthValue: 0.5,
    interestDecay: 60,
    factionRelevance: ['kaiowa'],
    embellishments: [
      "The bundle hums at night.",
      "Touch it and your skin blackens.",
      "Only a shaman can safely destroy it.",
    ],
    degradations: [
      "Coincidental deaths.",
    ],
  },
  {
    id: 'supernatural_portrait_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'rumor',
    template:
      "The portrait at {LOCATION} - the one of {DECEASED} - its eyes follow you. {NPC} swears they saw it smile when {RELATIVE} walked in. Same smile {DECEASED} had before they killed their family.",
    variables: ['LOCATION', 'DECEASED', 'NPC', 'RELATIVE'],
    spreadRate: 5,
    truthValue: 0.2,
    interestDecay: 45,
    embellishments: [
      "The portrait bleeds on the anniversary.",
      "Anyone who owns it dies like {DECEASED} died.",
      "You can hear whispers comin' from it.",
    ],
    degradations: [
      "Just a trick of the light.",
    ],
  },
  {
    id: 'supernatural_compass_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'secret',
    template:
      "{NPC} has a compass that don't point north. Points to somethin' else - somethin' it wants 'em to find. They followed it once to {LOCATION}. Found bones. Human bones. The compass was happy.",
    variables: ['NPC', 'LOCATION'],
    spreadRate: 3,
    truthValue: 0.2,
    interestDecay: 60,
    embellishments: [
      "The bones arranged themselves into words.",
      "The compass belonged to a killer.",
      "It's leadin' to more bodies.",
    ],
    degradations: [
      "Broken compass is all.",
    ],
  },
  {
    id: 'supernatural_rope_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "That hangin' rope they used on {EXECUTED} - it weren't thrown out. It's at {LOCATION} now. {NPC} says they saw it movin' by itself. Coilin'. Waitin'. Wants to hang someone else.",
    variables: ['EXECUTED', 'LOCATION', 'NPC'],
    spreadRate: 6,
    truthValue: 0.1,
    interestDecay: 30,
    embellishments: [
      "It's already killed two more.",
      "The knot ties itself.",
      "You can hear the executed man's last words near it.",
    ],
    degradations: [
      "Rope don't move on its own.",
    ],
  },
  {
    id: 'supernatural_chair_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'rumor',
    template:
      "Don't sit in the chair by the window at {LOCATION}. {DECEASED} died in it - just stopped breathin'. Now {NPC} says anyone who sits there gets dizzy. Sees {DECEASED}'s memories. Feels their last moments.",
    variables: ['LOCATION', 'DECEASED', 'NPC'],
    spreadRate: 4,
    truthValue: 0.2,
    interestDecay: 45,
    embellishments: [
      "{DECEASED} was murdered in that chair.",
      "The cushion's always warm.",
      "People have left their own memories in it.",
    ],
    degradations: [
      "Old chair, bad ventilation.",
    ],
  },

  // === CREATURES & MONSTERS (10) ===
  {
    id: 'supernatural_wendigo_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "The Wendigo's been spotted near {LOCATION}. {NPC} found what was left of some travelers - eaten, but not by any animal. The bites was human. The hunger drives men mad, turns 'em into somethin' else.",
    variables: ['LOCATION', 'NPC'],
    spreadRate: 8,
    truthValue: 0.4,
    interestDecay: 21,
    factionRelevance: ['kaiowa'],
    embellishments: [
      "It used to be human before the hunger took it.",
      "It can mimic voices.",
      "Fire's the only thing that stops it.",
    ],
    degradations: [
      "Mountain lion attack.",
    ],
    triggerEvents: ['animal_attack', 'missing_persons'],
  },
  {
    id: 'supernatural_thunderbird_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'rumor',
    template:
      "A bird big as a house flew over {LOCATION} durin' the storm. {NPC} saw its shadow blot out the lightnin'. The Kaiowa call it Thunderbird - a spirit that only appears when great change is comin'.",
    variables: ['LOCATION', 'NPC'],
    spreadRate: 5,
    truthValue: 0.2,
    interestDecay: 30,
    factionRelevance: ['kaiowa'],
    embellishments: [
      "Its feathers are pure silver.",
      "Where it lands, lightning strikes.",
      "It carries messages from the spirit world.",
    ],
    degradations: [
      "Condor, maybe, distorted by the storm.",
    ],
  },
  {
    id: 'supernatural_pale_horse_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "There's a pale horse been seen ridin' the range - no rider, white as death, eyes like red stars. {NPC} tried to catch it. Horse outran the fastest mount in the territory. They say it's Death's horse, lookin' for passengers.",
    variables: ['NPC'],
    spreadRate: 6,
    truthValue: 0.3,
    interestDecay: 45,
    embellishments: [
      "Anyone who rides it don't come back.",
      "It only appears before someone important dies.",
      "Its hoofprints smoke.",
    ],
    degradations: [
      "Albino mustang, rare but real.",
    ],
  },
  {
    id: 'supernatural_lake_monster_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'rumor',
    template:
      "Somethin' lives in the lake at {LOCATION}. {NPC} was fishin' and saw it - serpent-like, long as three wagons, scales that glinted like copper. It looked at 'em. Intelligent-like. Then it sank back down.",
    variables: ['LOCATION', 'NPC'],
    spreadRate: 5,
    truthValue: 0.2,
    interestDecay: 60,
    embellishments: [
      "The Kaiowa leave offerings for it.",
      "It protects treasure at the bottom.",
      "Fishermen who anger it disappear.",
    ],
    degradations: [
      "Large catfish, nothin' more.",
    ],
  },
  {
    id: 'supernatural_night_crawler_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "Stay off the roads at night near {LOCATION}. {NPC} saw somethin' crossin' - walked like a man but bent wrong, too many joints. Turned its head all the way around when it heard 'em. They rode like hell and didn't look back.",
    variables: ['LOCATION', 'NPC'],
    spreadRate: 6,
    truthValue: 0.2,
    interestDecay: 21,
    embellishments: [
      "It wears human skin.",
      "Its eyes reflect like a cat's.",
      "It's been followin' travelers for weeks.",
    ],
    degradations: [
      "Drunk seein' things.",
    ],
  },
  {
    id: 'supernatural_shadow_people_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'secret',
    template:
      "The shadow people are real. {NPC} sees 'em every night now - shapes movin' in the corner of their eye. They don't have faces. They're watchin'. Waitin'. {NPC} says they're gonna come for 'em soon.",
    variables: ['NPC'],
    spreadRate: 4,
    truthValue: 0.1,
    interestDecay: 30,
    embellishments: [
      "They come closer every night.",
      "They whisper things that make sense.",
      "Mirrors show 'em clear.",
    ],
    degradations: [
      "Lack of sleep makes the mind play tricks.",
    ],
  },
  {
    id: 'supernatural_demon_dog_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "That ain't no ordinary dog been killin' livestock near {LOCATION}. {NPC} shot it three times - it just looked at 'em and walked away. Black as midnight, eyes like fire. Hellhound, mark my words.",
    variables: ['LOCATION', 'NPC'],
    spreadRate: 7,
    truthValue: 0.3,
    interestDecay: 14,
    embellishments: [
      "Bullets pass through it.",
      "It leaves sulfur smell behind.",
      "It's huntin' someone specific.",
    ],
    degradations: [
      "Wild dog with mange.",
    ],
  },
  {
    id: 'supernatural_faceless_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "{NPC} saw a man standin' at the edge of town at midnight. Normal lookin' from behind. But when he turned around... no face. Just smooth skin where the features should be. Then he pointed at {NPC}. Hasn't spoken since.",
    variables: ['NPC'],
    spreadRate: 5,
    truthValue: 0.1,
    interestDecay: 14,
    embellishments: [
      "Whoever it points at disappears.",
      "It's lookin' for someone who stole its face.",
      "Only sinners can see it.",
    ],
    degradations: [
      "Terror makes the mind see things wrong.",
    ],
  },
  {
    id: 'supernatural_desert_siren_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "Travelers near {LOCATION} have been hearin' the most beautiful singin' - comin' from nowhere. {NPC} almost followed it into a ravine. Somethin' in the desert calls to lost souls. Feeds on 'em.",
    variables: ['LOCATION', 'NPC'],
    spreadRate: 6,
    truthValue: 0.3,
    interestDecay: 30,
    embellishments: [
      "Bones line the bottom of that ravine.",
      "The singin' knows your name.",
      "Those who follow never return.",
    ],
    degradations: [
      "Wind through the rocks sounds strange.",
    ],
  },
  {
    id: 'supernatural_child_lure_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "Don't let your children play near {LOCATION} at dusk. {NPC}'s boy saw another child there - pale, dressed old-fashioned. Asked him to play. {NPC} screamed at him to run. That child's been dead fifty years.",
    variables: ['LOCATION', 'NPC'],
    spreadRate: 8,
    truthValue: 0.3,
    interestDecay: 21,
    embellishments: [
      "It's lonely. Wants playmates that never leave.",
      "Children who follow don't grow up.",
      "You can hear children laughin' from the empty field.",
    ],
    degradations: [
      "Children make up stories.",
    ],
  },

  // === PROPHECY & WARNINGS (5) ===
  {
    id: 'supernatural_prophecy_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "The Kaiowa medicine woman had a vision. A black wind's comin' - gonna sweep across the territory, bringin' death. She says {TIME_PERIOD} will decide whether we all live or die. The choice falls on someone nobody expects.",
    variables: ['TIME_PERIOD'],
    spreadRate: 6,
    truthValue: 0.5,
    interestDecay: 30,
    factionRelevance: ['kaiowa'],
    embellishments: [
      "The animals know - they're leavin'.",
      "The vision showed a specific person.",
      "There's a way to stop it, but at terrible cost.",
    ],
    degradations: [
      "Prophets have been wrong before.",
    ],
  },
  {
    id: 'supernatural_end_times_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "The signs are all there. Rivers runnin' backward at {LOCATION}. Cattle born with extra legs. The sun went red for an hour last week. {NPC} says the end times are upon us. The veil between worlds is thinnin'.",
    variables: ['LOCATION', 'NPC'],
    spreadRate: 7,
    truthValue: 0.2,
    interestDecay: 14,
    embellishments: [
      "The preacher's been prayin' non-stop.",
      "More people seein' their dead relatives.",
      "The old gods are wakin' up.",
    ],
    degradations: [
      "Coincidence and fear.",
    ],
  },
  {
    id: 'supernatural_seventh_son_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'secret',
    template:
      "{NPC}'s the seventh son of a seventh son. Born with the sight. They know things before they happen. Been real quiet lately - scared. Says somethin' big is comin'. Won't say what. Just keeps apologizin' in advance.",
    variables: ['NPC'],
    spreadRate: 4,
    truthValue: 0.4,
    interestDecay: 30,
    embellishments: [
      "They predicted the last three deaths in town.",
      "They see the dead walk among us.",
      "They know when someone's lyin'.",
    ],
    degradations: [
      "Cold readin' and lucky guesses.",
    ],
  },
  {
    id: 'supernatural_comet_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'warning',
    template:
      "That streak in the sky ain't no shootin' star. {NPC} says it's gettin' bigger every night. The last time a comet like that appeared, the war started. The time before that, the plague. Somethin's about to change everything.",
    variables: ['NPC'],
    spreadRate: 6,
    truthValue: 0.7,
    interestDecay: 14,
    embellishments: [
      "It's been predicted in old texts.",
      "When it reaches peak brightness, IT happens.",
      "Some say it's a message from God. Others say worse.",
    ],
    degradations: [
      "Just another comet.",
    ],
  },
  {
    id: 'supernatural_dream_walker_1',
    category: GossipCategory.SUPERNATURAL,
    tone: 'secret',
    template:
      "{NPC} is a dream walker - can enter other people's dreams. They've seen things inside folks' heads. Secrets. Fears. Future. They're worried now. Says they saw the same nightmare in dozens of people. Somethin' puttin' it there. Spreadin' like a plague.",
    variables: ['NPC'],
    spreadRate: 3,
    truthValue: 0.2,
    interestDecay: 45,
    embellishments: [
      "They can show you your own death.",
      "The nightmare's gettin' stronger.",
      "Whatever's sendin' it is lookin' for somethin'.",
    ],
    degradations: [
      "Charlatans claim all sorts of powers.",
    ],
  },
];

// ============================================================================
// CONSOLIDATED TEMPLATES EXPORT
// ============================================================================

export const ALL_GOSSIP_TEMPLATES: GossipExpansionTemplate[] = [
  ...SCANDAL_TEMPLATES,
  ...RUMOR_TEMPLATES,
  ...NEWS_TEMPLATES,
  ...SECRET_TEMPLATES,
  ...WARNING_TEMPLATES,
  ...SUPERNATURAL_TEMPLATES,
];

// ============================================================================
// VARIABLE POOLS FOR GOSSIP EXPANSION
// ============================================================================

export const GOSSIP_VARIABLE_POOLS = {
  NPC: [
    'Mayor Thompson', 'Sheriff Cole', 'Banker Whitfield', 'Doc Morrison',
    'Reverend Black', 'Widow Jenkins', 'Madame Rose', 'Judge Parker',
    'Bartender McGraw', 'Blacksmith Gruff', 'Rancher Calhoun', 'Merchant Wang',
    'Prospector Pete', 'Gambler LaFontaine', 'Schoolmarm Ellen', 'Undertaker Grimm',
    'Stable Master Jenkins', 'Newspaper Man Hensley', 'Telegraph Operator Mills',
    'Hotel Owner Davis',
  ],
  NPC1: ['the mayor', 'the banker', 'the sheriff\'s wife', 'the saloon owner', 'the preacher'],
  NPC2: ['the schoolteacher', 'the widow', 'a stranger', 'the deputy', 'a traveling salesman'],
  LOCATION: [
    'the saloon', 'the hotel', 'the church', 'the livery stable', 'behind the general store',
    'the abandoned mine', 'the old mill', 'the railroad depot', 'the cemetery',
    'the bathhouse', 'the gambling hall', 'the bank', 'the sheriff\'s office',
  ],
  TIME_PERIOD: [
    'last night', 'two days ago', 'last week', 'a month ago', 'yesterday',
    'Saturday evening', 'during the festival', 'after the funeral',
  ],
  GANG: [
    'the Desperados', 'the Red River Gang', 'the Comancheros', 'Black Jack\'s Boys',
    'the Hole-in-the-Wall Gang', 'the Rustlers', 'the Night Riders',
  ],
  FACTION: [
    'the Settler Alliance', 'the Frontera', 'the Nahi Coalition', 'the railroad company',
    'the mining consortium', 'the cattle barons', 'the Chinese tongs',
  ],
  DISTANT_TOWN: [
    'San Francisco', 'Denver', 'St. Louis', 'New Orleans', 'Chicago',
    'Kansas City', 'Santa Fe', 'Dodge City', 'Tombstone', 'Deadwood',
  ],
  CRIME: [
    'murder', 'bank robbery', 'horse theft', 'train robbery', 'cattle rustling',
    'counterfeiting', 'fraud', 'arson', 'assault', 'kidnapping',
  ],
  DISEASE: [
    'cholera', 'typhoid', 'influenza', 'scarlet fever', 'smallpox', 'consumption',
  ],
  BUSINESS_TYPE: [
    'general store', 'saloon', 'hotel', 'bank', 'livery stable', 'blacksmith shop',
    'restaurant', 'laundry', 'barbershop', 'pharmacy',
  ],
  SPOOKY_SOUND: [
    'chains rattling', 'a woman weeping', 'footsteps on the stairs', 'whispered voices',
    'something scratching at the walls', 'a gunshot that never ends',
  ],
  PREDATOR: [
    'mountain lion', 'pack of wolves', 'rogue bear', 'wild boar', 'giant rattlesnake',
  ],
  OFFICIAL_TITLE: [
    'sheriff', 'mayor', 'judge', 'tax collector', 'land agent', 'postmaster',
  ],
  PROFESSION: [
    'doctor', 'lawyer', 'engineer', 'surveyor', 'dentist', 'veterinarian',
  ],
  INSTITUTION: [
    'medical school', 'law school', 'university', 'military academy', 'seminary',
  ],
  TRANSPORT: [
    'stagecoach', 'train', 'steamboat', 'wagon train', 'private carriage',
  ],
  RITUAL_ACTION: [
    'drawing symbols in blood', 'chanting in a strange tongue', 'burning herbs',
    'dancing around a fire', 'communing with spirits',
  ],
  CHEATING_METHOD: [
    'dealing from the bottom', 'using marked cards', 'switching dice',
    'signaling to a partner', 'hiding cards up their sleeve',
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get templates by category
 */
export function getGossipTemplatesByCategory(
  category: GossipCategory
): GossipExpansionTemplate[] {
  return ALL_GOSSIP_TEMPLATES.filter((t) => t.category === category);
}

/**
 * Get templates by tone
 */
export function getGossipTemplatesByTone(tone: GossipTone): GossipExpansionTemplate[] {
  return ALL_GOSSIP_TEMPLATES.filter((t) => t.tone === tone);
}

/**
 * Get high-spread templates (viral gossip)
 */
export function getViralGossipTemplates(minSpreadRate: number = 8): GossipExpansionTemplate[] {
  return ALL_GOSSIP_TEMPLATES.filter((t) => t.spreadRate >= minSpreadRate);
}

/**
 * Get templates triggered by a specific event
 */
export function getGossipTemplatesByEvent(eventType: string): GossipExpansionTemplate[] {
  return ALL_GOSSIP_TEMPLATES.filter(
    (t) => t.triggerEvents && t.triggerEvents.includes(eventType)
  );
}

/**
 * Get random item from a gossip variable pool
 */
export function getRandomGossipVariable(
  poolName: keyof typeof GOSSIP_VARIABLE_POOLS
): string {
  const pool = GOSSIP_VARIABLE_POOLS[poolName];
  return SecureRNG.select(pool);
}

/**
 * Get random embellishment for a template
 */
export function getRandomEmbellishment(template: GossipExpansionTemplate): string | null {
  if (!template.embellishments || template.embellishments.length === 0) {
    return null;
  }
  return SecureRNG.select(template.embellishments);
}

/**
 * Get random degradation for a template (used when gossip spreads)
 */
export function getRandomDegradation(template: GossipExpansionTemplate): string | null {
  if (!template.degradations || template.degradations.length === 0) {
    return null;
  }
  return SecureRNG.select(template.degradations);
}

/**
 * Degrade truth value based on spread
 */
export function degradeTruthValue(
  currentTruth: number,
  spreadCount: number,
  template: GossipExpansionTemplate
): number {
  // Each spread reduces truth by a percentage
  const degradationPerSpread = 0.1; // 10% per spread
  const newTruth = currentTruth * Math.pow(1 - degradationPerSpread, spreadCount);
  return Math.max(0, Math.min(1, newTruth));
}

/**
 * Calculate total gossip combinations
 */
export function calculateGossipCombinations(): number {
  let total = 0;

  for (const template of ALL_GOSSIP_TEMPLATES) {
    let combinations = 1;
    for (const variable of template.variables) {
      const poolName = variable as keyof typeof GOSSIP_VARIABLE_POOLS;
      if (GOSSIP_VARIABLE_POOLS[poolName]) {
        combinations *= GOSSIP_VARIABLE_POOLS[poolName].length;
      } else {
        // Default for non-pooled variables
        combinations *= 10;
      }
    }
    // Add embellishment variations
    if (template.embellishments) {
      combinations *= template.embellishments.length + 1; // +1 for no embellishment
    }
    total += combinations;
  }

  return total;
}

// Export count for documentation
export const TOTAL_GOSSIP_COMBINATIONS = calculateGossipCombinations();

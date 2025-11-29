/**
 * NPC Dialogue Templates
 *
 * Mood-aware procedural dialogue templates for dynamic NPC interactions.
 * Part of Phase D - Content Explosion System
 *
 * 10 roles x 5 moods x 4 contexts = 200 base templates
 * Each template set contains multiple variations for natural conversation.
 */

import { MoodType } from '@desperados/shared';

// ============================================================================
// TYPES
// ============================================================================

export type NPCRole =
  | 'bartender'
  | 'sheriff'
  | 'merchant'
  | 'blacksmith'
  | 'doctor'
  | 'banker'
  | 'saloon_girl'
  | 'rancher'
  | 'outlaw'
  | 'preacher';

export type DialogueMood = 'friendly' | 'neutral' | 'hostile' | 'fearful' | 'drunk';

export type DialogueContext = 'greeting' | 'trade' | 'quest' | 'gossip';

export interface DialogueTemplate {
  npcRole: NPCRole;
  mood: DialogueMood;
  context: DialogueContext;
  templates: string[]; // Array of template variations
  variables?: string[]; // Variables used across templates
  responseOptions?: ResponseOption[];
}

export interface ResponseOption {
  text: string;
  effect?: 'positive' | 'negative' | 'neutral';
  trustChange?: number;
  nextContext?: DialogueContext;
}

// ============================================================================
// HELPER: Map MoodType to DialogueMood
// ============================================================================

export function mapMoodToDialogueMood(mood: MoodType): DialogueMood {
  switch (mood) {
    case MoodType.HAPPY:
    case MoodType.CONTENT:
    case MoodType.EXCITED:
    case MoodType.GRATEFUL:
      return 'friendly';
    case MoodType.NEUTRAL:
    case MoodType.SUSPICIOUS:
      return 'neutral';
    case MoodType.ANGRY:
    case MoodType.ANNOYED:
      return 'hostile';
    case MoodType.FEARFUL:
    case MoodType.SAD:
      return 'fearful';
    case MoodType.DRUNK:
      return 'drunk';
    default:
      return 'neutral';
  }
}

// ============================================================================
// BARTENDER DIALOGUE TEMPLATES (5 moods x 4 contexts = 20)
// ============================================================================

export const BARTENDER_TEMPLATES: DialogueTemplate[] = [
  // GREETING
  {
    npcRole: 'bartender',
    mood: 'friendly',
    context: 'greeting',
    templates: [
      "Well if it ain't {PLAYER}! Your usual, or something stronger today?",
      "Welcome back, friend! What's your poison?",
      "Good to see you, {PLAYER}. Heard you've been busy at {RECENT_LOCATION}.",
      "Hey there, partner! Pull up a stool. First one's on the house.",
      "{PLAYER}! Just the face I wanted to see. Got some news for you.",
    ],
    variables: ['PLAYER', 'RECENT_LOCATION'],
  },
  {
    npcRole: 'bartender',
    mood: 'neutral',
    context: 'greeting',
    templates: [
      "What'll it be?",
      "Another customer. What can I get you?",
      "You drinking or just looking?",
      "Take a seat anywhere. I'll be with you in a minute.",
      "Menu's on the wall. Holler when you're ready.",
    ],
    variables: ['PLAYER'],
  },
  {
    npcRole: 'bartender',
    mood: 'hostile',
    context: 'greeting',
    templates: [
      "You again. Make it quick.",
      "Money up front. I don't trust your kind.",
      "Heard what you did at {LOCATION}. Watch yourself in here.",
      "Keep your hands where I can see them. What do you want?",
      "We don't serve your type. Well... maybe if the money's good.",
    ],
    variables: ['PLAYER', 'LOCATION'],
  },
  {
    npcRole: 'bartender',
    mood: 'fearful',
    context: 'greeting',
    templates: [
      "Oh... it's you. Please, I don't want any trouble.",
      "Y-yes? What can I do for you, {PLAYER}?",
      "The drink is on the house! Just... please don't hurt anyone.",
      "I heard about the bounty. Please, I've got a family.",
      "Whatever you want. Just take it easy, alright?",
    ],
    variables: ['PLAYER'],
  },
  {
    npcRole: 'bartender',
    mood: 'drunk',
    context: 'greeting',
    templates: [
      "*hic* Well lookee here! It's my besht friend... what's yer name again?",
      "Heyyy! Have a drink with me! I'm celebratin'... somethin'...",
      "You're the prettiest customer I've sheen all day! *hic*",
      "Shhhh... don't tell nobody, but I've been samplin' the merchandise!",
      "Welcome to my... my establ... establ... my bar! *hic*",
    ],
    variables: ['PLAYER'],
  },
  // TRADE
  {
    npcRole: 'bartender',
    mood: 'friendly',
    context: 'trade',
    templates: [
      "Here's what we got today. Fair prices for fair folk.",
      "Looking to stock up? I'll give you the regular's discount.",
      "Got some special stuff under the counter, if you're interested.",
      "Whiskey's fresh from {ORIGIN_TOWN}. Best in the territory.",
      "I can throw in some food too if you're hungry. On me.",
    ],
    variables: ['ORIGIN_TOWN'],
  },
  {
    npcRole: 'bartender',
    mood: 'neutral',
    context: 'trade',
    templates: [
      "Prices are on the board. Take it or leave it.",
      "Standard rates. No haggling.",
      "Here's what's available. Cash only.",
      "Drinks are this much. Food's extra.",
      "You buying or window shopping?",
    ],
    variables: [],
  },
  {
    npcRole: 'bartender',
    mood: 'hostile',
    context: 'trade',
    templates: [
      "Prices just went up for you. Special tax.",
      "You want something? Pay double. Consider it a convenience fee.",
      "I don't have to sell to you at all. Take my offer or get out.",
      "Cash up front. And don't even think about running a tab.",
      "Fine. But if anything goes missing, I'm coming for you first.",
    ],
    variables: [],
  },
  {
    npcRole: 'bartender',
    mood: 'fearful',
    context: 'trade',
    templates: [
      "Take whatever you want. Please, just pay something...",
      "I'll give you a discount! Half price! Just... be gentle with the place.",
      "Here, here! The best stuff. On the house. Just please...",
      "You can have the back room special. Just don't tell anyone I gave it to you.",
      "Whatever price you think is fair. I won't argue.",
    ],
    variables: [],
  },
  {
    npcRole: 'bartender',
    mood: 'drunk',
    context: 'trade',
    templates: [
      "Thish round's on me! Wait... or is it on you? *hic*",
      "Everyting's free tonight! No wait... don't tell my wife I said that...",
      "I'll give you... *counts fingers* ... a million percent off!",
      "Here, have this bottle. I can't feel my face anyway!",
      "The prices are... they're written shomewhere... *squints*",
    ],
    variables: [],
  },
  // QUEST
  {
    npcRole: 'bartender',
    mood: 'friendly',
    context: 'quest',
    templates: [
      "Say, I could use some help. {NPC} owes me money and won't pay up.",
      "There's trouble brewing with {GANG}. Someone needs to handle it.",
      "I've got a delivery to {LOCATION} that needs a reliable escort.",
      "Between you and me, {NPC} has been causing problems. Care to persuade them?",
      "Looking for work? I hear {NPC} needs someone trustworthy for a job.",
    ],
    variables: ['NPC', 'GANG', 'LOCATION'],
  },
  {
    npcRole: 'bartender',
    mood: 'neutral',
    context: 'quest',
    templates: [
      "There might be work available. Interested?",
      "I've heard things. Information costs, though.",
      "Someone was asking about hired help. Could put in a word.",
      "Jobs come through here sometimes. Keep your ears open.",
      "Check the board. Might be something that pays.",
    ],
    variables: [],
  },
  {
    npcRole: 'bartender',
    mood: 'hostile',
    context: 'quest',
    templates: [
      "Work? For you? Ha. Maybe if you prove you're not completely useless.",
      "I don't trust you with anything important.",
      "Want to make amends? {NPC} needs something done. Dangerous work.",
      "There's a job no one else will take. Probably suicide. Perfect for you.",
      "Prove yourself first. Then maybe we'll talk.",
    ],
    variables: ['NPC'],
  },
  {
    npcRole: 'bartender',
    mood: 'fearful',
    context: 'quest',
    templates: [
      "Please... {GANG} has been threatening me. Could you... help?",
      "There's something at {LOCATION}... I'm too scared to go myself.",
      "I'll pay anything if you can make {NPC} leave me alone.",
      "The sheriff won't help. You're my only hope.",
      "If you do this for me, I'll owe you forever. Please...",
    ],
    variables: ['GANG', 'LOCATION', 'NPC'],
  },
  {
    npcRole: 'bartender',
    mood: 'drunk',
    context: 'quest',
    templates: [
      "I need you to... *hic* ... what was it? Oh! Get me more whiskey!",
      "There's a... a thing... at the place... you know what I mean!",
      "My besht friend needsh help! That's you! Help me find my keys!",
      "Shomebody stole my... my favorite... thing! Get it back!",
      "I'll pay you *hic* a thousand gold if you bring me a pickle!",
    ],
    variables: [],
  },
  // GOSSIP
  {
    npcRole: 'bartender',
    mood: 'friendly',
    context: 'gossip',
    templates: [
      "You didn't hear this from me, but... {GOSSIP}",
      "Interesting folk came through yesterday. {GOSSIP}",
      "Word around the bar is... {GOSSIP}",
      "Keep this between us: {GOSSIP}",
      "I trust you, so I'll share this: {GOSSIP}",
    ],
    variables: ['GOSSIP'],
  },
  {
    npcRole: 'bartender',
    mood: 'neutral',
    context: 'gossip',
    templates: [
      "I hear things. Maybe I'll share. Buy a drink first.",
      "Information isn't free, friend.",
      "People talk. Some of it's even true.",
      "Could tell you what I know. What's in it for me?",
      "Loose lips sink ships. Mine stay tight unless...",
    ],
    variables: [],
  },
  {
    npcRole: 'bartender',
    mood: 'hostile',
    context: 'gossip',
    templates: [
      "Why would I tell you anything?",
      "You want gossip? Try the washerwomen.",
      "I don't talk to people I don't trust.",
      "Maybe I know something. Maybe I don't. Either way, not telling you.",
      "Information has a price. You can't afford it.",
    ],
    variables: [],
  },
  {
    npcRole: 'bartender',
    mood: 'fearful',
    context: 'gossip',
    templates: [
      "I... I shouldn't say anything... but... {GOSSIP}",
      "Please don't tell anyone I told you: {GOSSIP}",
      "If this gets back to me, I'm dead. But... {GOSSIP}",
      "Okay, okay! I'll tell you everything! {GOSSIP}",
      "You didn't hear this from me. I was never here. {GOSSIP}",
    ],
    variables: ['GOSSIP'],
  },
  {
    npcRole: 'bartender',
    mood: 'drunk',
    context: 'gossip',
    templates: [
      "Ohhhh I know secretsh! *hic* {GOSSIP} ... don't tell nobody!",
      "You wanna know shomething? Lean in... *whispers loudly* {GOSSIP}",
      "I shhouldn't shay thish but... {GOSSIP} ... woops!",
      "EVERYBODY! LISTEN UP! {GOSSIP} ... wait that was a secret...",
      "My best friend {NPC} told me... *hic* ... {GOSSIP}",
    ],
    variables: ['GOSSIP', 'NPC'],
  },
];

// ============================================================================
// SHERIFF DIALOGUE TEMPLATES (5 moods x 4 contexts = 20)
// ============================================================================

export const SHERIFF_TEMPLATES: DialogueTemplate[] = [
  // GREETING
  {
    npcRole: 'sheriff',
    mood: 'friendly',
    context: 'greeting',
    templates: [
      "Afternoon, {PLAYER}. Keeping out of trouble, I hope?",
      "Good to see a friendly face. What brings you to my office?",
      "I've heard good things about you, {PLAYER}. Keep it up.",
      "Welcome. Always glad to see law-abiding citizens.",
      "Ah, {PLAYER}. I could use someone like you around here.",
    ],
    variables: ['PLAYER'],
  },
  {
    npcRole: 'sheriff',
    mood: 'neutral',
    context: 'greeting',
    templates: [
      "State your business.",
      "What do you need?",
      "I'm busy. Make it quick.",
      "Something I can help you with?",
      "Yes? What is it?",
    ],
    variables: ['PLAYER'],
  },
  {
    npcRole: 'sheriff',
    mood: 'hostile',
    context: 'greeting',
    templates: [
      "You've got nerve showing your face here after {CRIME}.",
      "I'm watching you, {PLAYER}. One wrong move...",
      "The bounty on your head is looking mighty tempting.",
      "Get out of my office before I throw you in a cell.",
      "I know what you are. Don't think that badge of yours fools me.",
    ],
    variables: ['PLAYER', 'CRIME'],
  },
  {
    npcRole: 'sheriff',
    mood: 'fearful',
    context: 'greeting',
    templates: [
      "Oh... {PLAYER}. What... what do you want?",
      "Please, I have a family. Whatever you want...",
      "The cell keys are on the desk. Just... don't hurt anyone.",
      "I-I didn't see anything at {LOCATION}. I swear!",
      "Look, I'm just doing my job. We don't have to be enemies.",
    ],
    variables: ['PLAYER', 'LOCATION'],
  },
  {
    npcRole: 'sheriff',
    mood: 'drunk',
    context: 'greeting',
    templates: [
      "*hic* You're under arresht! No wait... what'd you do again?",
      "I AM THE LAW! *falls off chair* ... I meant to do that.",
      "Hey! You! Yer... yer alright, you know that? *hic*",
      "Don't tell nobody you shaw me like thish...",
      "The badge ish heavy... so heavy... *sobs*",
    ],
    variables: ['PLAYER'],
  },
  // TRADE
  {
    npcRole: 'sheriff',
    mood: 'friendly',
    context: 'trade',
    templates: [
      "Looking to turn in a bounty? Let me see what you've got.",
      "We've got some confiscated goods. Legal to sell now.",
      "Need ammunition? I can spare some at cost.",
      "The bounty board's over there. Good money for good work.",
      "I've got some deputy supplies I can let go of. Interested?",
    ],
    variables: [],
  },
  {
    npcRole: 'sheriff',
    mood: 'neutral',
    context: 'trade',
    templates: [
      "Bounties pay standard rates. No negotiation.",
      "Check the board. Prices are set by the territory.",
      "I don't run a shop. Take your business elsewhere.",
      "Confiscated items are auctioned. Come back next week.",
      "Official business only. I'm not a merchant.",
    ],
    variables: [],
  },
  {
    npcRole: 'sheriff',
    mood: 'hostile',
    context: 'trade',
    templates: [
      "The only thing I'm trading you is lead for trouble.",
      "You want to trade? Turn yourself in. That's the deal.",
      "I don't do business with criminals.",
      "Every bounty you bring in, I'll be checking if you killed them yourself.",
      "Get out. Your money's no good here.",
    ],
    variables: [],
  },
  {
    npcRole: 'sheriff',
    mood: 'fearful',
    context: 'trade',
    templates: [
      "T-take whatever you want from the evidence locker...",
      "The bounty money... it's in the safe. I'll open it.",
      "Here, take my badge. It's worth something, right?",
      "I can get you anything you need. Just name it.",
      "Please... the town treasury is at the bank. I can get you access.",
    ],
    variables: [],
  },
  {
    npcRole: 'sheriff',
    mood: 'drunk',
    context: 'trade',
    templates: [
      "I'll give you... *hic* ... my horse for another bottle!",
      "Trade? Sure! Here'sh my gun! ... wait, I need that...",
      "The bounties are worth... *counts fingers* ... many money!",
      "Wanna buy the jail? It's mine to shell! *hic*",
      "Everything's negotiable when yer thish drunk!",
    ],
    variables: [],
  },
  // QUEST
  {
    npcRole: 'sheriff',
    mood: 'friendly',
    context: 'quest',
    templates: [
      "I could use a deputy. {GANG} has been causing trouble at {LOCATION}.",
      "{NPC} went missing near {LOCATION}. Help me find them.",
      "There's a bounty that needs collecting. Interested?",
      "The town needs protection while I investigate {CRIME}.",
      "I've got a lead on {GANG}. Need backup to follow it.",
    ],
    variables: ['GANG', 'LOCATION', 'NPC', 'CRIME'],
  },
  {
    npcRole: 'sheriff',
    mood: 'neutral',
    context: 'quest',
    templates: [
      "Bounty board's there. Standard rates.",
      "If you want work, check the postings.",
      "There's always trouble needs handling. Pay's fair.",
      "I don't have time to explain. Read the wanted posters.",
      "Work's available. Whether you're up to it is another question.",
    ],
    variables: [],
  },
  {
    npcRole: 'sheriff',
    mood: 'hostile',
    context: 'quest',
    templates: [
      "You want redemption? Bring me {GANG}'s leader. Dead or alive.",
      "Prove you're not worthless. Handle {NPC} at {LOCATION}.",
      "Do this job, and maybe I'll forget about {CRIME}. Maybe.",
      "There's a suicide mission. Perfect for someone like you.",
      "Clear the road to {LOCATION}. Don't come back until it's done.",
    ],
    variables: ['GANG', 'NPC', 'LOCATION', 'CRIME'],
  },
  {
    npcRole: 'sheriff',
    mood: 'fearful',
    context: 'quest',
    templates: [
      "Please... {GANG} threatened my family. You have to stop them!",
      "I'll pay anything. Just get rid of {NPC}.",
      "The mayor's been taken to {LOCATION}. I can't do this alone.",
      "They said they'd burn the town if I don't... Please help.",
      "I'm in over my head. {GANG} runs everything now.",
    ],
    variables: ['GANG', 'NPC', 'LOCATION'],
  },
  {
    npcRole: 'sheriff',
    mood: 'drunk',
    context: 'quest',
    templates: [
      "Shomebody shtole my horsh! Find it and I'll make you... *hic* ... king!",
      "There'sh a dragon at {LOCATION}! Probably! Go check!",
      "I need you to tell my wife I love her... wait, I'm not married...",
      "Bring me the head of... *falls asleep* ... *snores* ...",
      "Yer hired! As... ash... what job wash this again?",
    ],
    variables: ['LOCATION'],
  },
  // GOSSIP
  {
    npcRole: 'sheriff',
    mood: 'friendly',
    context: 'gossip',
    templates: [
      "Between us lawmen... {GOSSIP}",
      "I've been investigating. Turns out {GOSSIP}",
      "Keep this quiet, but {GOSSIP}",
      "My deputies found out that {GOSSIP}",
      "As someone I trust, you should know: {GOSSIP}",
    ],
    variables: ['GOSSIP'],
  },
  {
    npcRole: 'sheriff',
    mood: 'neutral',
    context: 'gossip',
    templates: [
      "I deal in facts, not gossip.",
      "If you have information about a crime, file a report.",
      "Rumors don't interest me. Evidence does.",
      "Talk is cheap. Proof is what matters.",
      "I've heard things. Can't confirm or deny.",
    ],
    variables: [],
  },
  {
    npcRole: 'sheriff',
    mood: 'hostile',
    context: 'gossip',
    templates: [
      "Why would I share anything with you?",
      "The only thing I'll share is your wanted poster.",
      "You want information? Turn yourself in first.",
      "I don't gossip with criminals.",
      "Anything I know about you will be used against you.",
    ],
    variables: [],
  },
  {
    npcRole: 'sheriff',
    mood: 'fearful',
    context: 'gossip',
    templates: [
      "I'll tell you everything! {GOSSIP}",
      "They made me keep quiet, but... {GOSSIP}",
      "If {GANG} finds out I told you... but you need to know: {GOSSIP}",
      "I've been too scared to act on this: {GOSSIP}",
      "Please protect me after I say this: {GOSSIP}",
    ],
    variables: ['GOSSIP', 'GANG'],
  },
  {
    npcRole: 'sheriff',
    mood: 'drunk',
    context: 'gossip',
    templates: [
      "You wanna know the REAL criminalsh? *hic* {GOSSIP}",
      "I've sheen thingsh... terrible thingsh... {GOSSIP}",
      "The mayor? HA! Let me tell you about the mayor... {GOSSIP}",
      "Shhhh... come closher... *whispers* {GOSSIP}",
      "I could get fired for shaying thish but... {GOSSIP}",
    ],
    variables: ['GOSSIP'],
  },
];

// ============================================================================
// MERCHANT DIALOGUE TEMPLATES (5 moods x 4 contexts = 20)
// ============================================================================

export const MERCHANT_TEMPLATES: DialogueTemplate[] = [
  // GREETING
  {
    npcRole: 'merchant',
    mood: 'friendly',
    context: 'greeting',
    templates: [
      "Welcome, welcome! {PLAYER}, always a pleasure!",
      "My favorite customer! Come in, come in!",
      "Ah, {PLAYER}! I set aside something special for you!",
      "Good day, friend! Business is good thanks to folks like you!",
      "What a delight! Let me show you the new arrivals!",
    ],
    variables: ['PLAYER'],
  },
  {
    npcRole: 'merchant',
    mood: 'neutral',
    context: 'greeting',
    templates: [
      "Welcome. Looking for anything specific?",
      "Good day. Merchandise is on the shelves.",
      "Hello. Let me know if you need assistance.",
      "Customer. Right. How can I help?",
      "Welcome to my shop. Don't touch what you can't afford.",
    ],
    variables: ['PLAYER'],
  },
  {
    npcRole: 'merchant',
    mood: 'hostile',
    context: 'greeting',
    templates: [
      "You again. You break it, you buy it.",
      "I know your type. Cash only, no credit.",
      "Make it quick. I've got real customers waiting.",
      "The door's right behind you if you're just browsing.",
      "I've heard about you. No discounts, no returns.",
    ],
    variables: ['PLAYER'],
  },
  {
    npcRole: 'merchant',
    mood: 'fearful',
    context: 'greeting',
    templates: [
      "Oh! It's you! Please, take whatever you need...",
      "I have a family... the register's right there...",
      "N-no trouble today, I hope? Special discount for you!",
      "Welcome... I mean that sincerely... please don't...",
      "The protection money is in the back! Wait, you're not them...",
    ],
    variables: ['PLAYER'],
  },
  {
    npcRole: 'merchant',
    mood: 'drunk',
    context: 'greeting',
    templates: [
      "CUSHTOMER! *hic* Everything'sh free! No wait... half off!",
      "Welcome to my... *looks around* ... wherever thish is!",
      "You're sho pretty! Buy shomething! Or don't! I don't care!",
      "I love you, man! You know that? *hic* I really do!",
      "Closed! We're closed! ... are we? What day ish it?",
    ],
    variables: ['PLAYER'],
  },
  // TRADE
  {
    npcRole: 'merchant',
    mood: 'friendly',
    context: 'trade',
    templates: [
      "For you, special price! Friends don't pay full markup!",
      "Here's what I've got. Best quality in {TOWN}!",
      "I just got a shipment from {ORIGIN_TOWN}. First pick for you!",
      "Name your price! Well, within reason. Business is business.",
      "I'll throw in something extra. You're my best customer!",
    ],
    variables: ['TOWN', 'ORIGIN_TOWN'],
  },
  {
    npcRole: 'merchant',
    mood: 'neutral',
    context: 'trade',
    templates: [
      "Prices are marked. No haggling.",
      "Standard rates. Take it or leave it.",
      "Here's the inventory. Cash only.",
      "Quality goods at fair prices. What do you need?",
      "I can order special items. Costs extra.",
    ],
    variables: [],
  },
  {
    npcRole: 'merchant',
    mood: 'hostile',
    context: 'trade',
    templates: [
      "Double price for you. Don't like it? Leave.",
      "Pay up front. I don't trust you.",
      "Limited selection for your kind. These only.",
      "Final price. No negotiation. Count your coins.",
      "Buy something or get out. I'm not running a museum.",
    ],
    variables: [],
  },
  {
    npcRole: 'merchant',
    mood: 'fearful',
    context: 'trade',
    templates: [
      "Name your price! Anything! It's yours!",
      "Please, take the best items! No charge!",
      "I'll give you everything in the back room!",
      "The safe combination is... please, just take it...",
      "Special customer discount! 90% off! Just please...",
    ],
    variables: [],
  },
  {
    npcRole: 'merchant',
    mood: 'drunk',
    context: 'trade',
    templates: [
      "Thish? Thish is worth... *squints* ... one million dollars!",
      "Everything's on shale! Or... wait... for shale? *hic*",
      "You give me... that thing... I give you... this thing! Deal!",
      "I have no idea what anything cosht anymore! Shurprise me!",
      "Free shample! Free shample for everyone! *knocks over display*",
    ],
    variables: [],
  },
  // QUEST
  {
    npcRole: 'merchant',
    mood: 'friendly',
    context: 'quest',
    templates: [
      "I need a reliable courier to {LOCATION}. Good pay!",
      "My shipment got stolen by {GANG}. Get it back, I'll make it worth your while.",
      "{NPC} owes me money. Collect it, keep 10%.",
      "There's a rare {ITEM} at {LOCATION}. Bring it to me!",
      "Competition is trying to sabotage me. Handle it, get store credit.",
    ],
    variables: ['LOCATION', 'GANG', 'NPC', 'ITEM'],
  },
  {
    npcRole: 'merchant',
    mood: 'neutral',
    context: 'quest',
    templates: [
      "There might be work. Depends on what you can offer.",
      "I need things done. Standard rates apply.",
      "Fetch and carry. Nothing complicated. Interested?",
      "Job's available. Won't be easy. Won't be fun. Pays well.",
      "Talk to me after you've proven you can be trusted.",
    ],
    variables: [],
  },
  {
    npcRole: 'merchant',
    mood: 'hostile',
    context: 'quest',
    templates: [
      "Work for you? You'd have to pay ME.",
      "I wouldn't trust you to fetch water.",
      "Maybe if you clear your debt first. Then we'll talk.",
      "Want work? Clean the stables. That's all you're good for.",
      "The only job I have for you is getting out of my shop.",
    ],
    variables: [],
  },
  {
    npcRole: 'merchant',
    mood: 'fearful',
    context: 'quest',
    templates: [
      "Please! {GANG} has been extorting me! Make them stop!",
      "I'll give you anything if you protect my shipment!",
      "Someone's threatening to burn my shop! Help me!",
      "My family... they took my family to {LOCATION}... please...",
      "I'll be ruined unless you help! Name your price!",
    ],
    variables: ['GANG', 'LOCATION'],
  },
  {
    npcRole: 'merchant',
    mood: 'drunk',
    context: 'quest',
    templates: [
      "I need you to find my... my... what wash I shelling?",
      "Bring me the moonsh... I mean... *hic* ... moon rocks!",
      "There'sh a treasure! At the place! With the thingsh! Go!",
      "My arch-nemeshis... that guy... get him! Or her? *shrugs*",
      "I'll pay you in... in... what's money called again?",
    ],
    variables: [],
  },
  // GOSSIP
  {
    npcRole: 'merchant',
    mood: 'friendly',
    context: 'gossip',
    templates: [
      "You hear things in this business. For example: {GOSSIP}",
      "A little birdie told me... {GOSSIP}",
      "Keep this between us trading folk: {GOSSIP}",
      "My supplier from {ORIGIN_TOWN} mentioned {GOSSIP}",
      "Business intelligence, friend: {GOSSIP}",
    ],
    variables: ['GOSSIP', 'ORIGIN_TOWN'],
  },
  {
    npcRole: 'merchant',
    mood: 'neutral',
    context: 'gossip',
    templates: [
      "Information costs. What's it worth to you?",
      "I hear things. Might share for the right price.",
      "Gossip isn't my trade. Unless there's profit in it.",
      "Buy something first. Then we'll talk.",
      "I know things. You know how business works.",
    ],
    variables: [],
  },
  {
    npcRole: 'merchant',
    mood: 'hostile',
    context: 'gossip',
    templates: [
      "I wouldn't tell you if your life depended on it.",
      "Information is valuable. You're not worth it.",
      "Ask someone who trusts you. Oh wait, nobody does.",
      "I'll tell you nothing. Now buy something or leave.",
      "Loose lips sink ships. Mine stay sealed around you.",
    ],
    variables: [],
  },
  {
    npcRole: 'merchant',
    mood: 'fearful',
    context: 'gossip',
    templates: [
      "I'll tell you everything! {GOSSIP}",
      "Please don't hurt me! What do you want to know? {GOSSIP}",
      "They told me not to talk, but... {GOSSIP}",
      "I overheard this at {LOCATION}: {GOSSIP}",
      "Anything! I'll tell you anything! {GOSSIP}",
    ],
    variables: ['GOSSIP', 'LOCATION'],
  },
  {
    npcRole: 'merchant',
    mood: 'drunk',
    context: 'gossip',
    templates: [
      "Wanna know a shecret? *hic* {GOSSIP}",
      "I'm gonna tell you shomething I shouldn't... {GOSSIP}",
      "EVERYBODY LISTEN! {GOSSIP} ... that wash a shecret...",
      "My besht cushtomer told me... {GOSSIP}",
      "For my new besht friend... {GOSSIP} ... you're welcome!",
    ],
    variables: ['GOSSIP'],
  },
];

// ============================================================================
// ADDITIONAL ROLE TEMPLATES - BLACKSMITH, DOCTOR, BANKER, etc.
// (Abbreviated for space - following same pattern)
// ============================================================================

export const BLACKSMITH_TEMPLATES: DialogueTemplate[] = [
  // GREETING
  {
    npcRole: 'blacksmith',
    mood: 'friendly',
    context: 'greeting',
    templates: [
      "Howdy, {PLAYER}! What needs fixin' today?",
      "Good to see you! The forge is hot and ready!",
      "Welcome back! Your last order held up well, I hope?",
      "Ah, a fellow who appreciates good metalwork!",
      "{PLAYER}! Just finished something you might like!",
    ],
    variables: ['PLAYER'],
  },
  {
    npcRole: 'blacksmith',
    mood: 'neutral',
    context: 'greeting',
    templates: [
      "What do you need?",
      "Repairs or new work?",
      "State your business. I'm behind schedule.",
      "If you're buying, I'm selling. If not, step aside.",
      "Workshop's open. Make it quick.",
    ],
    variables: ['PLAYER'],
  },
  {
    npcRole: 'blacksmith',
    mood: 'hostile',
    context: 'greeting',
    templates: [
      "You again. Money up front this time.",
      "I heard what you did with my last work. Shameful.",
      "Get out of my forge before I use you as an anvil.",
      "I don't work for your type. Find another smith.",
      "Last time you cost me materials. Not happening again.",
    ],
    variables: ['PLAYER'],
  },
  {
    npcRole: 'blacksmith',
    mood: 'fearful',
    context: 'greeting',
    templates: [
      "Please, I'm just a craftsman! I'll make whatever you want!",
      "Don't hurt the forge! I'll work for free!",
      "I-I don't want any trouble... best prices for you!",
      "The weapons are over there! Take them!",
      "I heard about {LOCATION}... please, I have a family...",
    ],
    variables: ['PLAYER', 'LOCATION'],
  },
  {
    npcRole: 'blacksmith',
    mood: 'drunk',
    context: 'greeting',
    templates: [
      "FIRE! *hic* Oh wait, that's jusht the forge...",
      "Welcome to my... shmelting... place! *hic*",
      "You look like you need a shword! Or a horseshoe! Shame thing!",
      "I love hitting shtuff! Watch! *swings hammer wildly*",
      "Everything's better when yer drunk and have a hammer!",
    ],
    variables: ['PLAYER'],
  },
  // TRADE
  {
    npcRole: 'blacksmith',
    mood: 'friendly',
    context: 'trade',
    templates: [
      "Best steel in the territory! Fair prices for quality!",
      "I'll give you the locals' rate. You've earned it.",
      "Custom work? Name it. I can forge anything.",
      "Repairs are half price for friends!",
      "Got some fine horseshoes from {ORIGIN_TOWN}. Interested?",
    ],
    variables: ['ORIGIN_TOWN'],
  },
  {
    npcRole: 'blacksmith',
    mood: 'neutral',
    context: 'trade',
    templates: [
      "Prices are set. Materials cost what they cost.",
      "I don't haggle. The work speaks for itself.",
      "Standard rates. Custom orders take time.",
      "Cash for finished goods. Half up front for orders.",
      "What you see is what you get.",
    ],
    variables: [],
  },
  {
    npcRole: 'blacksmith',
    mood: 'hostile',
    context: 'trade',
    templates: [
      "Triple price for you. Take it or leave.",
      "I don't need your business. Pay premium or go away.",
      "Maybe I'll 'forget' to temper your blade properly.",
      "Cash only. And I count every coin twice.",
      "Fine. But if it breaks, I never saw you.",
    ],
    variables: [],
  },
  {
    npcRole: 'blacksmith',
    mood: 'fearful',
    context: 'trade',
    templates: [
      "Take anything! The best pieces are yours!",
      "Free! Everything's free! Just please don't...",
      "I'll forge whatever you need! No charge!",
      "Here, my finest work! A gift!",
      "Please, the weapons... just don't use them on me...",
    ],
    variables: [],
  },
  {
    npcRole: 'blacksmith',
    mood: 'drunk',
    context: 'trade',
    templates: [
      "Thish shword? Pricelessh! Or... *hic* ... free! Take it!",
      "I made thish when I wash... *hic* ... shober... good times...",
      "For you? Shpecial price! One... two... many gold!",
      "Everything's on fire shale! I mean... sale! Fire sale!",
      "I'll trade you for more whiskey! Deal? DEAL!",
    ],
    variables: [],
  },
  // QUEST
  {
    npcRole: 'blacksmith',
    mood: 'friendly',
    context: 'quest',
    templates: [
      "I need rare ore from {LOCATION}. Bring it, get a custom piece.",
      "Someone stole my masterwork! Help me track it down!",
      "{NPC} owes me for a big order. Collect it for a cut.",
      "There's a legendary forge at {LOCATION}. Help me find it.",
      "My apprentice ran off with my tools. Bring him back.",
    ],
    variables: ['LOCATION', 'NPC'],
  },
  {
    npcRole: 'blacksmith',
    mood: 'neutral',
    context: 'quest',
    templates: [
      "Might have work. Depends on your skills.",
      "Ore deliveries pay. If you can handle the trip.",
      "There's a collection job. Dangerous. Interested?",
      "I need materials from {LOCATION}. Standard pay.",
      "Work's available. Nothing fancy.",
    ],
    variables: ['LOCATION'],
  },
  {
    npcRole: 'blacksmith',
    mood: 'hostile',
    context: 'quest',
    templates: [
      "Work for you? You'd melt my steel.",
      "Maybe clean the slag pit. That's all you're worth.",
      "Bring me quality ore, and maybe I'll reconsider my opinion.",
      "There's a dangerous job nobody wants. Perfect for you.",
      "Prove yourself first. Then we talk about real work.",
    ],
    variables: [],
  },
  {
    npcRole: 'blacksmith',
    mood: 'fearful',
    context: 'quest',
    templates: [
      "{GANG} demanded weapons! If I don't deliver, they'll kill me!",
      "Please, someone stole my forge materials! I'll be ruined!",
      "Help me! They want me to make weapons against the town!",
      "My family's being threatened! I need protection!",
      "I'll give you my best work forever if you save me!",
    ],
    variables: ['GANG'],
  },
  {
    npcRole: 'blacksmith',
    mood: 'drunk',
    context: 'quest',
    templates: [
      "I dropped my besht hammer in the... *hic* ... shomewhere!",
      "There'sh a dragon that needsh... wait, that's not right...",
      "Find me more fire! The forge needsh FIRE! *hic*",
      "My rival... that guy... break hish anvil! Or don't! Whatever!",
      "I need you to deliver thish to... *passes out*",
    ],
    variables: [],
  },
  // GOSSIP
  {
    npcRole: 'blacksmith',
    mood: 'friendly',
    context: 'gossip',
    templates: [
      "You hear things at the forge. Like: {GOSSIP}",
      "Someone ordered weapons in secret. {GOSSIP}",
      "Word from the mining camps: {GOSSIP}",
      "My customers talk while I work: {GOSSIP}",
      "Between hammer strokes, I heard: {GOSSIP}",
    ],
    variables: ['GOSSIP'],
  },
  {
    npcRole: 'blacksmith',
    mood: 'neutral',
    context: 'gossip',
    templates: [
      "I work metal, not tongues.",
      "Gossip's not my trade. I deal in steel.",
      "Ask the washerwomen. I just forge things.",
      "I might know something. Worth a discount on repairs?",
      "People talk while I work. I barely listen.",
    ],
    variables: [],
  },
  {
    npcRole: 'blacksmith',
    mood: 'hostile',
    context: 'gossip',
    templates: [
      "I don't gossip with people I don't trust.",
      "Mind your own business.",
      "The only thing I'm telling you is to leave.",
      "Why would I share anything with you?",
      "Ask someone who cares. I'm busy.",
    ],
    variables: [],
  },
  {
    npcRole: 'blacksmith',
    mood: 'fearful',
    context: 'gossip',
    templates: [
      "I'll tell you everything! {GOSSIP}",
      "Please, I overheard at the forge: {GOSSIP}",
      "They made me forge weapons for them. {GOSSIP}",
      "{GANG} has been here. They said: {GOSSIP}",
      "Don't tell anyone I told you: {GOSSIP}",
    ],
    variables: ['GOSSIP', 'GANG'],
  },
  {
    npcRole: 'blacksmith',
    mood: 'drunk',
    context: 'gossip',
    templates: [
      "Lemme tell you about the shteel... and alsho... {GOSSIP}",
      "Shecrets of the forge! And alsho... *hic* {GOSSIP}",
      "You know what? You know what?? {GOSSIP}!!",
      "My cushtomers... they tell me everything... {GOSSIP}",
      "Iron tongue! Get it? *hic* Anyway... {GOSSIP}",
    ],
    variables: ['GOSSIP'],
  },
];

// ============================================================================
// QUICK TEMPLATE DEFINITIONS FOR REMAINING ROLES
// (Following same structure - abbreviated for space)
// ============================================================================

export const DOCTOR_TEMPLATES: DialogueTemplate[] = [
  { npcRole: 'doctor', mood: 'friendly', context: 'greeting', templates: [
    "Ah, {PLAYER}! Healthy I hope? Come in, come in!",
    "Good to see you walking! What brings you to my practice?",
    "My favorite patient! Not that you're sick often, thankfully.",
    "Welcome! I trust you're here for a checkup, not emergencies?",
    "{PLAYER}! I was just thinking about recommending some tonics!",
  ], variables: ['PLAYER'] },
  { npcRole: 'doctor', mood: 'neutral', context: 'greeting', templates: [
    "What seems to be the trouble?",
    "Symptoms?",
    "Medical emergency or routine visit?",
    "Take a seat. I'll be with you shortly.",
    "Examination room is to the left.",
  ], variables: ['PLAYER'] },
  { npcRole: 'doctor', mood: 'hostile', context: 'greeting', templates: [
    "You again. I've patched you up too many times.",
    "Violence follows you. I'm not enabling it anymore.",
    "Cash up front. I don't trust you'll live to pay later.",
    "Every bullet I pull out of you could save an innocent life.",
    "The Hippocratic oath is all that keeps me treating you.",
  ], variables: ['PLAYER'] },
  { npcRole: 'doctor', mood: 'fearful', context: 'greeting', templates: [
    "Please, I'm just a healer! I help everyone!",
    "Whatever you need! Medicine? Surgery? Take it!",
    "I-I've treated your enemies too... I'm neutral!",
    "Don't hurt me! I can be useful alive!",
    "I'll patch you up for free! Just please...",
  ], variables: ['PLAYER'] },
  { npcRole: 'doctor', mood: 'drunk', context: 'greeting', templates: [
    "Doctor'sh in! *hic* Where doesh it hurt?",
    "I shee two of you! Both look shick!",
    "Medical emergenchy? I'll just... *drops instruments*",
    "The cure for everything ish more whiskey! *hic*",
    "I can totally do shurgery right now! Probably!",
  ], variables: ['PLAYER'] },
  // Trade
  { npcRole: 'doctor', mood: 'friendly', context: 'trade', templates: [
    "Healing supplies at fair prices! I want you healthy!",
    "I'll give you my personal formula tonics. They work wonders!",
    "Medicine costs what it costs, but I can adjust payment terms.",
    "Here's what will keep you alive out there!",
    "Take this extra bandage. On me. Stay safe!",
  ], variables: [] },
  { npcRole: 'doctor', mood: 'neutral', context: 'trade', templates: [
    "Standard rates for medicine. Healing isn't cheap.",
    "Pay for treatment. No credit extended.",
    "Supplies are limited. Prices reflect that.",
    "Surgery costs extra. Anesthesia costs more.",
    "I sell cures, not miracles.",
  ], variables: [] },
  { npcRole: 'doctor', mood: 'hostile', context: 'trade', templates: [
    "Double price. Your lifestyle raises costs for everyone.",
    "I'll treat you. But it'll cost extra for my conscience.",
    "Maybe if medicine's too expensive, you'll avoid trouble.",
    "Premium rates for premium violence.",
    "Pay for supplies you've already ruined by being reckless.",
  ], variables: [] },
  { npcRole: 'doctor', mood: 'fearful', context: 'trade', templates: [
    "Take everything! Medicine cabinet's yours!",
    "Free treatment forever! Just don't hurt me!",
    "The morphine's in the cabinet! Please!",
    "I'll give you whatever supplies you need!",
    "No charge! Ever! I value my life!",
  ], variables: [] },
  { npcRole: 'doctor', mood: 'drunk', context: 'trade', templates: [
    "Thish medicine? It'sh... *squints at bottle* ...good for shomething!",
    "I'll trade you theshe bandages for another drink!",
    "Free diagnoshis! You've got... *hic* ...shtuff wrong!",
    "Shurgery shpecial! Two for one! Maybe!",
    "I have no idea what theshe pillsh do anymore!",
  ], variables: [] },
  // Quest & Gossip
  { npcRole: 'doctor', mood: 'friendly', context: 'quest', templates: [
    "I need rare herbs from {LOCATION}. Bring them for medicine supplies.",
    "There's an outbreak at {LOCATION}. Help me contain it.",
    "{NPC} is refusing treatment. Convince them to see me.",
    "Medical supplies were stolen. Track them down.",
    "I need an escort to {LOCATION}. Dangerous trip.",
  ], variables: ['LOCATION', 'NPC'] },
  { npcRole: 'doctor', mood: 'neutral', context: 'quest', templates: [
    "Might need courier work. Interested?",
    "Medical supplies don't deliver themselves.",
    "There's work if you can handle it.",
    "I need things done. Standard pay.",
    "Check back later. Might have something.",
  ], variables: [] },
  { npcRole: 'doctor', mood: 'hostile', context: 'quest', templates: [
    "Want to help? Stop creating patients for me.",
    "You want work? Volunteer at the cemetery you're filling.",
    "Maybe clear your conscience first.",
    "The only job I have is keeping people alive from YOU.",
    "Prove you can save lives, not take them.",
  ], variables: [] },
  { npcRole: 'doctor', mood: 'fearful', context: 'quest', templates: [
    "{GANG} wants me to treat only their people! Help me!",
    "Someone's poisoning the town well! Find them!",
    "They're threatening to burn my clinic! Please!",
    "I need protection! They said they'd come back!",
    "Save the town from this plague! I'll pay anything!",
  ], variables: ['GANG'] },
  { npcRole: 'doctor', mood: 'drunk', context: 'quest', templates: [
    "I need you to find my... my... medical degree!",
    "There'sh a patient! Shomewhere! Maybe! Go find 'em!",
    "My rival doctor ish a quack! Prove it! Or don't!",
    "Get me more... *hic* ...aneshthetic! The drinking kind!",
    "I think I left my patient on the table... check?",
  ], variables: [] },
  { npcRole: 'doctor', mood: 'friendly', context: 'gossip', templates: [
    "Medical confidentiality aside... {GOSSIP}",
    "I see people at their weakest. They tell me things. {GOSSIP}",
    "Between us healers... {GOSSIP}",
    "A patient mentioned... {GOSSIP}",
    "The body reveals secrets. Like: {GOSSIP}",
  ], variables: ['GOSSIP'] },
  { npcRole: 'doctor', mood: 'neutral', context: 'gossip', templates: [
    "I have patient confidentiality to consider.",
    "Medical ethics prevent me from sharing.",
    "What I hear in this office stays here.",
    "I'm a doctor, not a gossip.",
    "Some things are best left unsaid.",
  ], variables: [] },
  { npcRole: 'doctor', mood: 'hostile', context: 'gossip', templates: [
    "I wouldn't tell you if you were dying.",
    "My patients' secrets are safe from you.",
    "Ask someone without ethics. I have standards.",
    "The only thing I'll share is your diagnosis: insufferable.",
    "Information? Try the gossips. I'm a professional.",
  ], variables: [] },
  { npcRole: 'doctor', mood: 'fearful', context: 'gossip', templates: [
    "I'll tell you everything! Patient records, everything! {GOSSIP}",
    "I've treated {GANG} members! They said: {GOSSIP}",
    "Medical secrets! Here! {GOSSIP}",
    "I overheard during surgery: {GOSSIP}",
    "Please, I know things! {GOSSIP}",
  ], variables: ['GOSSIP', 'GANG'] },
  { npcRole: 'doctor', mood: 'drunk', context: 'gossip', templates: [
    "Medical shecretsh! *hic* Okay here goesh: {GOSSIP}",
    "Patient confidentiali... confudenly... whatever! {GOSSIP}",
    "You know what's wrong with EVERYONE? {GOSSIP}",
    "I've sheen things inside people! Alsho: {GOSSIP}",
    "Doctor-patient privilege? Never heard of it! {GOSSIP}",
  ], variables: ['GOSSIP'] },
];

// ============================================================================
// REMAINING ROLES (Banker, Saloon Girl, Rancher, Outlaw, Preacher)
// Using simplified structure for brevity
// ============================================================================

export const BANKER_TEMPLATES: DialogueTemplate[] = [
  { npcRole: 'banker', mood: 'friendly', context: 'greeting', templates: ["Welcome, {PLAYER}! Your account is in excellent standing!", "Ah, a valued customer! How may the bank serve you today?", "Good day! I've been meaning to discuss some investment opportunities with you."], variables: ['PLAYER'] },
  { npcRole: 'banker', mood: 'neutral', context: 'greeting', templates: ["Business hours only. State your purpose.", "Account number?", "Deposits, withdrawals, or inquiries?"], variables: [] },
  { npcRole: 'banker', mood: 'hostile', context: 'greeting', templates: ["Your credit is no good here.", "I know about your outstanding debts.", "The vault is impenetrable. Don't get ideas."], variables: [] },
  { npcRole: 'banker', mood: 'fearful', context: 'greeting', templates: ["The combination is... please, I'll open the vault!", "Take whatever you want! Just don't hurt anyone!", "I'm just a clerk! I don't make the decisions!"], variables: [] },
  { npcRole: 'banker', mood: 'drunk', context: 'greeting', templates: ["*hic* The interest rates are... wait, who are you?", "Money! I love money! Do you have money? I have money!", "Shecurity! Oh wait, I fired them... *hic*"], variables: [] },
  { npcRole: 'banker', mood: 'friendly', context: 'trade', templates: ["Excellent interest rates for valued customers!", "I can offer a loan at preferential terms.", "Your gold is safe with us. Best vault in the territory."], variables: [] },
  { npcRole: 'banker', mood: 'neutral', context: 'trade', templates: ["Standard rates apply.", "Fees are non-negotiable.", "Banking services at posted prices."], variables: [] },
  { npcRole: 'banker', mood: 'hostile', context: 'trade', templates: ["Higher rates for higher risk customers. Like you.", "Collateral required. All of it.", "I don't trust your money is clean."], variables: [] },
  { npcRole: 'banker', mood: 'fearful', context: 'trade', templates: ["Take the gold! It's insured anyway!", "Zero interest! Forever! Just please...", "The vault... I'll open it... just don't..."], variables: [] },
  { npcRole: 'banker', mood: 'drunk', context: 'trade', templates: ["I'll give you... *hic* ...a million percent interesht!", "Free money for everyone! *throws coins*", "Investments! Shtocks! Bonds! Words I know!"], variables: [] },
  { npcRole: 'banker', mood: 'friendly', context: 'quest', templates: ["A shipment of gold needs escort to {LOCATION}.", "Someone's been counterfeiting. Help me catch them.", "Debt collection. Delicate work for someone I trust."], variables: ['LOCATION'] },
  { npcRole: 'banker', mood: 'neutral', context: 'quest', templates: ["Security work available. Standard pay.", "Collections. Dangerous. Interested?", "The bank needs services. Discretion required."], variables: [] },
  { npcRole: 'banker', mood: 'hostile', context: 'quest', templates: ["Pay your debts first. Then we talk.", "The only work I have for you is leaving.", "Maybe rob a different bank."], variables: [] },
  { npcRole: 'banker', mood: 'fearful', context: 'quest', templates: ["{GANG} is demanding protection money! Stop them!", "They're planning to rob us! I know it!", "Please, protect the bank! I'll pay anything!"], variables: ['GANG'] },
  { npcRole: 'banker', mood: 'drunk', context: 'quest', templates: ["Find my money! Shomebody took it! Maybe me!", "Guard the vault! From... *hic* ...everybody!", "I need you to count to... to a big number!"], variables: [] },
  { npcRole: 'banker', mood: 'friendly', context: 'gossip', templates: ["Financial intelligence, strictly confidential: {GOSSIP}", "Money talks, and it told me: {GOSSIP}", "Between us investors: {GOSSIP}"], variables: ['GOSSIP'] },
  { npcRole: 'banker', mood: 'neutral', context: 'gossip', templates: ["Banking discretion prevents me from sharing.", "Financial matters are confidential.", "I deal in gold, not gossip."], variables: [] },
  { npcRole: 'banker', mood: 'hostile', context: 'gossip', templates: ["I would never share information with you.", "Our clients' business is private.", "The only thing I'll tell you is your balance: zero."], variables: [] },
  { npcRole: 'banker', mood: 'fearful', context: 'gossip', templates: ["Account records! I'll show you everything! {GOSSIP}", "Secret transactions! Here! {GOSSIP}", "I know who's moving money illegally! {GOSSIP}"], variables: ['GOSSIP'] },
  { npcRole: 'banker', mood: 'drunk', context: 'gossip', templates: ["You know who'sh broke? {GOSSIP} *hic*", "Shecret accountsh! Numbered! Shomewhere! {GOSSIP}", "The vault hash... wait, I shouldn't... {GOSSIP}"], variables: ['GOSSIP'] },
];

export const SALOON_GIRL_TEMPLATES: DialogueTemplate[] = [
  { npcRole: 'saloon_girl', mood: 'friendly', context: 'greeting', templates: ["Hey there, handsome! Buy a girl a drink?", "Well if it isn't my favorite cowboy! Come sit with me!", "{PLAYER}! I was hoping you'd walk through that door!"], variables: ['PLAYER'] },
  { npcRole: 'saloon_girl', mood: 'neutral', context: 'greeting', templates: ["Looking for company? It'll cost you.", "Drinks first. Conversation later.", "What do you want?"], variables: [] },
  { npcRole: 'saloon_girl', mood: 'hostile', context: 'greeting', templates: ["I remember you. Keep walking.", "My time is valuable. Too valuable for you.", "The door's right there. Use it."], variables: [] },
  { npcRole: 'saloon_girl', mood: 'fearful', context: 'greeting', templates: ["Please, I'm just working... I don't want trouble...", "Whatever you want, just don't hurt me...", "I'll do whatever you say... just please..."], variables: [] },
  { npcRole: 'saloon_girl', mood: 'drunk', context: 'greeting', templates: ["*hic* You're cuuute! Come dance with me!", "I love everyooone tonight! Especially you!", "Shhh... I'm hiding from my boss... *giggles*"], variables: [] },
  { npcRole: 'saloon_girl', mood: 'friendly', context: 'trade', templates: ["For you, sugar? Special rates.", "Drinks are on the house... if you buy me one too!", "I know all the best stuff behind the bar!"], variables: [] },
  { npcRole: 'saloon_girl', mood: 'neutral', context: 'trade', templates: ["Standard prices. No negotiating.", "Drinks cost money. Company costs more.", "You want service? Pay for it."], variables: [] },
  { npcRole: 'saloon_girl', mood: 'hostile', context: 'trade', templates: ["Triple price. Don't like it? Leave.", "I don't serve your kind.", "Find someone else to hustle."], variables: [] },
  { npcRole: 'saloon_girl', mood: 'fearful', context: 'trade', templates: ["Take anything! The tips, all of it!", "Free drinks! On me! Just please...", "Here, my jewelry... it's all I have..."], variables: [] },
  { npcRole: 'saloon_girl', mood: 'drunk', context: 'trade', templates: ["Everything's freee! *hic* Or expensive! I forget!", "Buy me a drink and I'll give you a shcret!", "Sho thirsty... trade you anything for water... I mean whiskey!"], variables: [] },
  { npcRole: 'saloon_girl', mood: 'friendly', context: 'quest', templates: ["Honey, I need a favor. {NPC} has been bothering me...", "There's a gentleman upstairs who needs... persuading to leave.", "Would you escort me to {LOCATION}? It's dangerous alone."], variables: ['NPC', 'LOCATION'] },
  { npcRole: 'saloon_girl', mood: 'neutral', context: 'quest', templates: ["Might have work for you. If the price is right.", "There's something needs doing. Interested?", "I hear things. Could be profitable for you."], variables: [] },
  { npcRole: 'saloon_girl', mood: 'hostile', context: 'quest', templates: ["Work for you? I'd rather drink lye.", "The only job is getting out of my sight.", "Maybe prove you're not garbage first."], variables: [] },
  { npcRole: 'saloon_girl', mood: 'fearful', context: 'quest', templates: ["{NPC} won't leave me alone! Make them stop!", "They threatened to sell me to {GANG}! Help me!", "Please, I need to escape this place! Get me to {LOCATION}!"], variables: ['NPC', 'GANG', 'LOCATION'] },
  { npcRole: 'saloon_girl', mood: 'drunk', context: 'quest', templates: ["Find my shoe! I losht it shomewhere!", "That guy owes me money! Get it! Or don't!", "I need you to tell him... tell who? Never mind!"], variables: [] },
  { npcRole: 'saloon_girl', mood: 'friendly', context: 'gossip', templates: ["Men tell me everything after a few drinks. Like: {GOSSIP}", "The things I overhear... want to know? {GOSSIP}", "A girl hears things. {GOSSIP}"], variables: ['GOSSIP'] },
  { npcRole: 'saloon_girl', mood: 'neutral', context: 'gossip', templates: ["Information costs extra.", "I hear things. Sharing costs money.", "Secrets are my currency. Pay up."], variables: [] },
  { npcRole: 'saloon_girl', mood: 'hostile', context: 'gossip', templates: ["My lips are sealed. Especially for you.", "I don't talk to people I don't like.", "Buy your gossip elsewhere."], variables: [] },
  { npcRole: 'saloon_girl', mood: 'fearful', context: 'gossip', templates: ["I'll tell you everything! {GOSSIP}", "I overheard {GANG} talking about: {GOSSIP}", "Please, I know secrets! {GOSSIP}"], variables: ['GOSSIP', 'GANG'] },
  { npcRole: 'saloon_girl', mood: 'drunk', context: 'gossip', templates: ["*giggling* Okay shho there's this thing... {GOSSIP}", "Shecrets! I have them! {GOSSIP}", "Everyone tellsh me everything! Like: {GOSSIP}"], variables: ['GOSSIP'] },
];

export const RANCHER_TEMPLATES: DialogueTemplate[] = [
  { npcRole: 'rancher', mood: 'friendly', context: 'greeting', templates: ["Howdy, {PLAYER}! How's the trail treating you?", "Good to see a friendly face! Come on in!", "Well look who it is! Coffee's hot!"], variables: ['PLAYER'] },
  { npcRole: 'rancher', mood: 'neutral', context: 'greeting', templates: ["What do you want?", "I'm busy. Make it quick.", "State your business, stranger."], variables: [] },
  { npcRole: 'rancher', mood: 'hostile', context: 'greeting', templates: ["Get off my land.", "I've got a shotgun and I know how to use it.", "Rustlers aren't welcome here."], variables: [] },
  { npcRole: 'rancher', mood: 'fearful', context: 'greeting', templates: ["Please, take the cattle... just leave my family alone!", "I don't want trouble... whatever you want...", "We're just simple folk... please..."], variables: [] },
  { npcRole: 'rancher', mood: 'drunk', context: 'greeting', templates: ["*hic* The cows are... where are the cows?", "Welcome to my... my... what's this place called?", "You look like a horse! A nice horse! *hic*"], variables: [] },
  { npcRole: 'rancher', mood: 'friendly', context: 'trade', templates: ["Got the best beef in the territory!", "Fair prices for quality livestock!", "I can spare some horses. Good breeding stock."], variables: [] },
  { npcRole: 'rancher', mood: 'neutral', context: 'trade', templates: ["Prices are set. Market rates.", "Cash for cattle. No credit.", "What you see is what you get."], variables: [] },
  { npcRole: 'rancher', mood: 'hostile', context: 'trade', templates: ["I don't sell to your kind.", "The price just doubled. For you.", "Find another ranch."], variables: [] },
  { npcRole: 'rancher', mood: 'fearful', context: 'trade', templates: ["Take any cattle you want! Please!", "Free horses! All of them! Just don't...", "The best livestock... yours... please..."], variables: [] },
  { npcRole: 'rancher', mood: 'drunk', context: 'trade', templates: ["I'll trade you a cow for... for... what wash I shaying?", "Everything's free! No wait, I need that to live...", "Theshe horsesh are... *hic* ...horshes!"], variables: [] },
  { npcRole: 'rancher', mood: 'friendly', context: 'quest', templates: ["Rustlers hit my north pasture. Help me track them!", "I need someone to drive cattle to {LOCATION}.", "{NPC} won't pay for the livestock they bought. Collect for me."], variables: ['LOCATION', 'NPC'] },
  { npcRole: 'rancher', mood: 'neutral', context: 'quest', templates: ["Ranch work available. Hard labor.", "There's trouble with predators. Could use help.", "Cattle drive coming up. Interested?"], variables: [] },
  { npcRole: 'rancher', mood: 'hostile', context: 'quest', templates: ["The only job is getting off my property.", "Maybe muck out the stables. That's what you're worth.", "Prove you're not a rustler first."], variables: [] },
  { npcRole: 'rancher', mood: 'fearful', context: 'quest', templates: ["{GANG} is demanding my cattle! Stop them!", "Something's killing livestock at night! Find it!", "Please, my family's been threatened!"], variables: ['GANG'] },
  { npcRole: 'rancher', mood: 'drunk', context: 'quest', templates: ["Find my favorite cow! Her name ish... Besshie? Bessie!", "The fence! It's... *hic* ...fency! Fix it maybe?", "There'sh coyotesh! Or wolves! Or sheep! Something!"], variables: [] },
  { npcRole: 'rancher', mood: 'friendly', context: 'gossip', templates: ["Out on the range, you hear things. {GOSSIP}", "Cowboys talk around the campfire. {GOSSIP}", "Word from the cattle trails: {GOSSIP}"], variables: ['GOSSIP'] },
  { npcRole: 'rancher', mood: 'neutral', context: 'gossip', templates: ["I mind my own business.", "Gossip's for town folk.", "I deal in cattle, not rumors."], variables: [] },
  { npcRole: 'rancher', mood: 'hostile', context: 'gossip', templates: ["Why would I tell you anything?", "Get off my land before I make you.", "Talk to the fence posts. They care more."], variables: [] },
  { npcRole: 'rancher', mood: 'fearful', context: 'gossip', templates: ["I'll tell you everything! {GOSSIP}", "The rustlers... they said: {GOSSIP}", "Please, I know things! {GOSSIP}"], variables: ['GOSSIP'] },
  { npcRole: 'rancher', mood: 'drunk', context: 'gossip', templates: ["The cows told me... wait, cows don't talk... {GOSSIP}", "Shomebody shaid... *hic* ... {GOSSIP}", "I heard from the horse! No, FROM a horse! {GOSSIP}"], variables: ['GOSSIP'] },
];

export const OUTLAW_TEMPLATES: DialogueTemplate[] = [
  { npcRole: 'outlaw', mood: 'friendly', context: 'greeting', templates: ["Well, well! A fellow operator! Pull up a seat!", "Hey there, partner! Looking to make some money?", "I've heard good things about you. Let's talk business."], variables: ['PLAYER'] },
  { npcRole: 'outlaw', mood: 'neutral', context: 'greeting', templates: ["What do you want?", "You law? Then get to talking.", "State your business. Quick."], variables: [] },
  { npcRole: 'outlaw', mood: 'hostile', context: 'greeting', templates: ["You've got ten seconds to explain why I shouldn't shoot you.", "I don't like your face.", "Wrong place, wrong time. For you."], variables: [] },
  { npcRole: 'outlaw', mood: 'fearful', context: 'greeting', templates: ["Please, I'll give you my cut! Just don't turn me in!", "I'm worth more alive! I know things!", "You're not with {GANG}, are you? Please say no..."], variables: ['GANG'] },
  { npcRole: 'outlaw', mood: 'drunk', context: 'greeting', templates: ["*hic* Stick 'em up! No wait... you're not the law...", "HANDS UP! Or... down... whatever... *hic*", "I'm the fasstest gun in... wait, where am I?"], variables: [] },
  { npcRole: 'outlaw', mood: 'friendly', context: 'trade', templates: ["Hot merchandise, cold prices. What do you need?", "Fell off a stagecoach, if you know what I mean.", "I can get you anything. For a price."], variables: [] },
  { npcRole: 'outlaw', mood: 'neutral', context: 'trade', templates: ["Cash only. No questions.", "Take it or leave it.", "Prices aren't negotiable."], variables: [] },
  { npcRole: 'outlaw', mood: 'hostile', context: 'trade', templates: ["The price is your life. Too rich for you?", "I could take your money AND your goods.", "Maybe I'll just rob you instead."], variables: [] },
  { npcRole: 'outlaw', mood: 'fearful', context: 'trade', templates: ["Take it all! I don't want any trouble!", "Here, my whole stash! Just don't...", "You can have everything! Please!"], variables: [] },
  { npcRole: 'outlaw', mood: 'drunk', context: 'trade', templates: ["Thish gun? It'sh... *hic* ...priceless! Or free! I forget!", "I shtole this from... shomeone... take it!", "Trade you everything for more whiskey! *hic*"], variables: [] },
  { npcRole: 'outlaw', mood: 'friendly', context: 'quest', templates: ["I've got a job. Big score at {LOCATION}. You in?", "Need backup for a stagecoach hit. Interested?", "There's a bank at {LOCATION} just begging to be robbed."], variables: ['LOCATION'] },
  { npcRole: 'outlaw', mood: 'neutral', context: 'quest', templates: ["There's work. Dangerous. Profitable.", "Job's available. No questions asked.", "Could use another gun. Interested?"], variables: [] },
  { npcRole: 'outlaw', mood: 'hostile', context: 'quest', templates: ["Prove yourself first. Go kill someone.", "Want in? Bring me the sheriff's badge. Off his body.", "Maybe as a distraction. That's all you're good for."], variables: [] },
  { npcRole: 'outlaw', mood: 'fearful', context: 'quest', templates: ["{GANG} wants me dead! Help me escape!", "The bounty hunters are closing in! Get them off my trail!", "Please, I need to get to {LOCATION}! Escort me!"], variables: ['GANG', 'LOCATION'] },
  { npcRole: 'outlaw', mood: 'drunk', context: 'quest', templates: ["Let'sh rob the... *hic* ...everything! All of it!", "There'sh treasure! At the place! With shtuff!", "Help me find my wanted poster! It'sh flattering!"], variables: [] },
  { npcRole: 'outlaw', mood: 'friendly', context: 'gossip', templates: ["Word on the criminal circuit: {GOSSIP}", "Between us outlaws: {GOSSIP}", "Here's the real score: {GOSSIP}"], variables: ['GOSSIP'] },
  { npcRole: 'outlaw', mood: 'neutral', context: 'gossip', templates: ["Information has a price.", "I know things. What's it worth to you?", "Talk is cheap. Gold isn't."], variables: [] },
  { npcRole: 'outlaw', mood: 'hostile', context: 'gossip', templates: ["Why would I tell you anything?", "Snitches get stitches.", "The only thing I'm telling you is goodbye."], variables: [] },
  { npcRole: 'outlaw', mood: 'fearful', context: 'gossip', templates: ["I'll tell you everything! {GOSSIP}", "The gang's planning: {GOSSIP}", "Please, I know all the hideouts! {GOSSIP}"], variables: ['GOSSIP'] },
  { npcRole: 'outlaw', mood: 'drunk', context: 'gossip', templates: ["You wanna know where the money ish? {GOSSIP} *hic*", "Shecrets of the gang! *hic* {GOSSIP}", "I shouldn't shay this but... {GOSSIP}"], variables: ['GOSSIP'] },
];

export const PREACHER_TEMPLATES: DialogueTemplate[] = [
  { npcRole: 'preacher', mood: 'friendly', context: 'greeting', templates: ["Blessings upon you, {PLAYER}! What brings you to God's house?", "Welcome, child! The Lord smiles upon your visit!", "Ah, a familiar face! Come, let us pray together!"], variables: ['PLAYER'] },
  { npcRole: 'preacher', mood: 'neutral', context: 'greeting', templates: ["Peace be with you.", "The church is open to all.", "Seek and ye shall find."], variables: [] },
  { npcRole: 'preacher', mood: 'hostile', context: 'greeting', templates: ["Your sins follow you like a shadow.", "Even God's patience has limits.", "Repent, or face divine judgment."], variables: [] },
  { npcRole: 'preacher', mood: 'fearful', context: 'greeting', templates: ["Please, this is holy ground! Sanctuary!", "Even the wicked can be saved! Let me help you!", "In God's name, I beg you..."], variables: [] },
  { npcRole: 'preacher', mood: 'drunk', context: 'greeting', templates: ["*hic* The Lord... works in... mysterious ways!", "Blesshings! Upon... everyone! *hic*", "Wine! The blood of... wait, that's not right..."], variables: [] },
  { npcRole: 'preacher', mood: 'friendly', context: 'trade', templates: ["The church asks only for donations.", "Give what you can, receive God's grace.", "The collection plate is there for the faithful."], variables: [] },
  { npcRole: 'preacher', mood: 'neutral', context: 'trade', templates: ["Donations are voluntary.", "We trade in faith, not gold.", "The church provides spiritual services."], variables: [] },
  { npcRole: 'preacher', mood: 'hostile', context: 'trade', templates: ["Your money cannot buy redemption.", "God does not want your blood money.", "Thirty pieces of silver won't help you."], variables: [] },
  { npcRole: 'preacher', mood: 'fearful', context: 'trade', templates: ["Take the collection! It's for the poor!", "The church's gold... take it... please...", "Whatever you want! Just spare the congregation!"], variables: [] },
  { npcRole: 'preacher', mood: 'drunk', context: 'trade', templates: ["Shalvation! For sale! Or free! *hic*", "I'll trade you a blessing for... for... what was I saying?", "The wine ish for communion! But... *hic* ...sharing is caring!"], variables: [] },
  { npcRole: 'preacher', mood: 'friendly', context: 'quest', templates: ["The orphanage needs supplies from {LOCATION}.", "A parishioner at {LOCATION} needs spiritual aid. And protection.", "Evil lurks at {LOCATION}. Will you be God's instrument?"], variables: ['LOCATION'] },
  { npcRole: 'preacher', mood: 'neutral', context: 'quest', templates: ["There is always work for the righteous.", "The Lord provides tasks for willing hands.", "Seek good works, and you shall find them."], variables: [] },
  { npcRole: 'preacher', mood: 'hostile', context: 'quest', templates: ["Seek redemption first.", "Your soul requires saving before any task.", "Prove you've changed. Then we'll talk."], variables: [] },
  { npcRole: 'preacher', mood: 'fearful', context: 'quest', templates: ["Devils walk among us! {GANG} threatens the congregation!", "Please, protect the church from those who would desecrate it!", "Save us! In God's name!"], variables: ['GANG'] },
  { npcRole: 'preacher', mood: 'drunk', context: 'quest', templates: ["Find the... *hic* ...holy grail! It'sh around here somewhere!", "Cast out the... the thingsh! At the place!", "I need you to tell everyone... God lovesh them! *hic*"], variables: [] },
  { npcRole: 'preacher', mood: 'friendly', context: 'gossip', templates: ["Confession is sacred, but... {GOSSIP}", "The Lord reveals much to those who listen: {GOSSIP}", "In confidence, child: {GOSSIP}"], variables: ['GOSSIP'] },
  { npcRole: 'preacher', mood: 'neutral', context: 'gossip', templates: ["Gossip is a sin.", "I hear confessions, not rumors.", "The church does not spread tales."], variables: [] },
  { npcRole: 'preacher', mood: 'hostile', context: 'gossip', templates: ["I would not share water with you in the desert.", "Your ears do not deserve truth.", "Seek gossip elsewhere, sinner."], variables: [] },
  { npcRole: 'preacher', mood: 'fearful', context: 'gossip', templates: ["I'll tell you everything confessed to me! {GOSSIP}", "Forgive me, Lord! {GOSSIP}", "I know everyone's sins! {GOSSIP}"], variables: ['GOSSIP'] },
  { npcRole: 'preacher', mood: 'drunk', context: 'gossip', templates: ["Confession shecrets! *hic* {GOSSIP}", "The Lord told me... or wash it {NPC}? Anyway: {GOSSIP}", "Shins! Sho many shins! Like: {GOSSIP}"], variables: ['GOSSIP', 'NPC'] },
];

// ============================================================================
// CONSOLIDATED TEMPLATES EXPORT
// ============================================================================

export const ALL_DIALOGUE_TEMPLATES: DialogueTemplate[] = [
  ...BARTENDER_TEMPLATES,
  ...SHERIFF_TEMPLATES,
  ...MERCHANT_TEMPLATES,
  ...BLACKSMITH_TEMPLATES,
  ...DOCTOR_TEMPLATES,
  ...BANKER_TEMPLATES,
  ...SALOON_GIRL_TEMPLATES,
  ...RANCHER_TEMPLATES,
  ...OUTLAW_TEMPLATES,
  ...PREACHER_TEMPLATES,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get dialogue templates for a specific NPC role
 */
export function getTemplatesByRole(role: NPCRole): DialogueTemplate[] {
  return ALL_DIALOGUE_TEMPLATES.filter((t) => t.npcRole === role);
}

/**
 * Get dialogue templates for a specific context
 */
export function getTemplatesByContext(context: DialogueContext): DialogueTemplate[] {
  return ALL_DIALOGUE_TEMPLATES.filter((t) => t.context === context);
}

/**
 * Get specific dialogue template
 */
export function getDialogueTemplate(
  role: NPCRole,
  mood: DialogueMood,
  context: DialogueContext
): DialogueTemplate | undefined {
  return ALL_DIALOGUE_TEMPLATES.find(
    (t) => t.npcRole === role && t.mood === mood && t.context === context
  );
}

/**
 * Get random dialogue from a template
 */
export function getRandomDialogue(template: DialogueTemplate): string {
  return template.templates[Math.floor(Math.random() * template.templates.length)];
}

/**
 * Calculate total dialogue combinations
 */
export function calculateDialogueCombinations(): number {
  let total = 0;
  for (const template of ALL_DIALOGUE_TEMPLATES) {
    total += template.templates.length;
  }
  return total;
}

// Export count
export const TOTAL_DIALOGUE_VARIATIONS = calculateDialogueCombinations();

/**
 * Legendary Animal Clues and Rumors
 *
 * Discovery system data for legendary animal hunts including
 * rumor texts, clue descriptions, and NPC dialogue
 */

import { LegendaryCategory } from '@desperados/shared';
import { SecureRNG } from '../services/base/SecureRNG';

/**
 * Rumor text templates by NPC type
 */
export const LEGENDARY_RUMORS: Record<string, {
  legendaryId: string;
  npcId: string;
  npcName: string;
  rumor: string;
  hints: string[];
}[]> = {
  // OLD RED - The Demon Bear
  old_red: [
    {
      legendaryId: 'old_red',
      npcId: 'miner_jack',
      npcName: 'Miner Jack',
      rumor: '"Stay away from them mountain caves, friend. Old Red haunts those parts. That ain\'t no ordinary bear - his fur\'s scarred red from all the battles he\'s won. Lost my partner to him last spring. Twenty-seven hunters have tried to bring him down. Twenty-seven funerals I\'ve attended. That demon ain\'t natural, I tell you."',
      hints: ['Spawns in mountain caves', 'Active at dusk and night', 'Extremely dangerous', 'Fire might be effective'],
    },
    {
      legendaryId: 'old_red',
      npcId: 'old_prospector',
      npcName: 'Old Prospector',
      rumor: '"Been prospectin\' these mountains forty years, and I\'ll tell you - Old Red\'s somethin\' else. Some nights, you can hear him roar from miles away. Shakes your very soul. Found tracks once... biggest bear prints I ever seen. Some say he\'s possessed by a vengeful spirit. I say he\'s just mean and too smart for his own good."',
      hints: ['Look for enormous tracks', 'Roar can be heard at night', 'Highly intelligent', 'Avoid fighting in caves'],
    },
    {
      legendaryId: 'old_red',
      npcId: 'mountain_guide',
      npcName: 'Mountain Guide Sarah',
      rumor: '"I guide hunters through these mountains, but I refuse to take anyone after Old Red anymore. Too many good men dead. Last group I took... well, only one came back, minus an arm. That bear don\'t just kill - he hunts hunters. Uses the terrain against you, causes cave-ins. You go after him, you best be prepared to never come back."',
      hints: ['Uses terrain strategically', 'Can cause cave collapses', 'Bring heavy armor', 'Hire experienced guide'],
    },
    {
      legendaryId: 'old_red',
      npcId: 'bounty_hunter_sarah',
      npcName: 'Bounty Hunter Sarah',
      rumor: '"There\'s a standing bounty on Old Red - five thousand gold. Been there for years, and still nobody\'s claimed it. I\'ve tracked grizzlies across three territories, but that demon bear? He\'s different. Saw him once, just for a moment. His eyes... they weren\'t animal eyes. They were calculating. Intelligent. He looked at me like he knew exactly what I was thinking."',
      hints: ['Extremely intelligent opponent', 'Large bounty available', 'Eye contact is unnerving', 'Requires level 30+'],
    },
  ],

  // GHOST CAT - The Phantom Cougar
  ghost_cat: [
    {
      legendaryId: 'ghost_cat',
      npcId: 'elder_white_feather',
      npcName: 'Elder White Feather',
      rumor: '"The white spirit watches over Spirit Springs. Ghost Cat, you call it. We know it as the Guardian of the Sacred Places. It appears like morning mist and vanishes the same way. To hunt it is to challenge the spirits themselves. But... if one proves worthy, perhaps the spirits will grant their blessing."',
      hints: ['Sacred to Coalition', 'Appears during fog', 'Nearly invisible', 'Dawn or dusk spawns'],
    },
    {
      legendaryId: 'ghost_cat',
      npcId: 'coalition_scout',
      npcName: 'Coalition Scout',
      rumor: '"I\'ve seen Ghost Cat twice in my life. Once at dawn, once at dusk. Both times it was like watching moonlight move through the trees. You can\'t track it normally - the thing leaves barely any sign. I\'ve heard it can become almost completely invisible. Settlers think we made it up, but I\'ve seen the white pelt with my own eyes."',
      hints: ['Dawn and dusk sightings', 'Difficult to track', 'Can turn invisible', 'Requires high perception'],
    },
    {
      legendaryId: 'ghost_cat',
      npcId: 'spirit_guide',
      npcName: 'Spirit Guide',
      rumor: '"The Ghost Cat is real, make no mistake. But it\'s not just a cougar - it\'s touched by something beyond our understanding. Hunters who pursue it often find themselves being hunted instead. It can see you long before you see it. Move through fog like it\'s not even there. If you mean to hunt it, bring something to help you see clearly."',
      hints: ['Fog makes it stronger', 'Vision enhancement crucial', 'Can turn the hunt around', 'Bring perception items'],
    },
    {
      legendaryId: 'ghost_cat',
      npcName: 'Mountain Hermit',
      npcId: 'mountain_hermit',
      rumor: '"Lived up in these mountains twenty years. Seen Ghost Cat more times than most. It\'s curious, that cat. Sometimes I think it watches me for entertainment. Pure white it is, with eyes like crystal. Don\'t make much noise neither. Once it passed not ten feet from me and I never heard a sound. You want to find it? Look to the cliffs at dawn when the fog rolls in."',
      hints: ['Frequents clifftops', 'Silent movement', 'Active in fog', 'Crystal-like eyes'],
    },
  ],

  // LOBO GRANDE - The Wolf King
  lobo_grande: [
    {
      legendaryId: 'lobo_grande',
      npcId: 'rancher_johnson',
      npcName: 'Rancher Johnson',
      rumor: '"That damned wolf has cost me fifty head of cattle this year alone. Lobo Grande they call him - the Big Wolf. But that don\'t do him justice. He\'s massive, smart as any man, and he leads a pack of at least twenty. They attack with military precision. Had three hired guns try to hunt \'em down. Found their bodies scattered across the range. If you\'re going after him, bring an army."',
      hints: ['Leads a large pack', 'Extremely intelligent', 'Coordinated attacks', 'Bring area weapons'],
    },
    {
      legendaryId: 'lobo_grande',
      npcId: 'cattle_driver',
      npcName: 'Cattle Driver Mike',
      rumor: '"I was driving cattle through Longhorn Range when Lobo Grande\'s pack hit us. It was like facing trained soldiers. They divided us, picked off stragglers, set ambushes. And the Wolf King himself? Black as midnight, twice the size of a normal wolf. He hung back, directing the others. Only moved in when he knew they had us. Lost half the herd before we escaped."',
      hints: ['Black-furred alpha', 'Directs pack tactically', 'Sets ambushes', 'Full moon increases activity'],
    },
    {
      legendaryId: 'lobo_grande',
      npcId: 'bounty_hunter_jim',
      npcName: 'Bounty Hunter Jim',
      rumor: '"There\'s a hefty bounty on Lobo Grande - dead or alive, though I don\'t know who could take him alive. I tracked him for three weeks. Saw him once, standing on a ridge at full moon. His pack howled around him like he was their god. He looked down at me, and I swear he smiled. Knew he could kill me anytime he wanted. Let me live as a warning."',
      hints: ['Active during full moon', 'Commands absolute pack loyalty', 'Toying with opponents', 'Silver bullets recommended'],
    },
    {
      legendaryId: 'lobo_grande',
      npcId: 'tracker_maria',
      npcName: 'Tracker Maria',
      rumor: '"I\'ve tracked wolves across four territories. Lobo Grande is different - his tracks are twice normal size, and his pack leaves patterns that show planning. They use terrain, set up escape routes, position sentries. It\'s not animal behavior, it\'s tactical warfare. You want to hunt him? Thin the pack first, or you\'ll be overwhelmed."',
      hints: ['Reduce pack numbers first', 'Uses tactical positioning', 'Large distinctive tracks', 'Requires strategy'],
    },
  ],

  // THUNDER - The White Buffalo
  thunder: [
    {
      legendaryId: 'thunder',
      npcId: 'elder_white_feather',
      npcName: 'Elder White Feather',
      rumor: '"Thunder is sacred. The White Buffalo appears in times of great change, carrying the spirits of our ancestors. To harm Thunder is to invite catastrophe upon yourself and your people. Only the most foolish or desperate would dare. But... I have seen it at dawn on the sacred grounds. Magnificent. Pure white against the rising sun. If you seek it, know that you will be judged."',
      hints: ['Sacred to Coalition', 'Dawn spawns on mesa', 'Killing has consequences', 'Spiritual significance'],
    },
    {
      legendaryId: 'thunder',
      npcId: 'shaman_walks_with_spirits',
      npcName: 'Shaman Walks With Spirits',
      rumor: '"The prophecy speaks of Thunder - the white buffalo who walks between worlds. Its hide carries protective blessings, its horns channel the storm. But those who hunt Thunder will know the ancestors\' wrath. Spirit lightning will strike them down. The Coalition will hunt them forever. No amount of gold is worth such a curse. Yet still, some seek it."',
      hints: ['Spirit lightning hazard', 'Sacred hide worth fortune', 'Coalition will retaliate', 'Extremely powerful'],
    },
    {
      legendaryId: 'thunder',
      npcId: 'coalition_chief',
      npcName: 'Coalition Chief',
      rumor: '"If you hunt Thunder, you are no friend to the Coalition. We will consider you an enemy forever. The White Buffalo is our sacred guardian, and we will defend it with our lives. But I know there are those who would kill anything for profit. If you are such a person, know that you will face not just Thunder, but all of us."',
      hints: ['Coalition protection', 'Permanent faction loss', 'Defended by warriors', 'Mythic-tier difficulty'],
    },
  ],

  // CROWN - The Monarch Elk
  crown: [
    {
      legendaryId: 'crown',
      npcId: 'trophy_hunter_bill',
      npcName: 'Trophy Hunter Bill',
      rumor: '"Crown. The Monarch Elk. I\'ve been hunting trophy animals for twenty years, and he\'s the one that got away. That rack must have forty points - largest I\'ve ever seen. He\'s smart though, won\'t let you within five hundred yards. Approaches from downwind, moves through cover. I\'ve offered five thousand gold to anyone who brings me his head. Still waiting."',
      hints: ['Requires long-range shot', 'Approach from downwind', 'Extremely wary', 'Dawn best time'],
    },
    {
      legendaryId: 'crown',
      npcId: 'mountain_guide',
      npcName: 'Mountain Guide Sarah',
      rumor: '"Seen Crown three times on Thunderbird Peak. Beautiful animal - almost seems a shame to hunt him. But that rack... it\'s magnificent. He moves through the high meadows at dawn, but he\'s got senses like you wouldn\'t believe. Slightest wrong move and he\'s gone like smoke. You need patience, a steady hand, and perfect conditions."',
      hints: ['High meadows at dawn', 'Perfect conditions needed', 'Steady aim required', 'One shot opportunity'],
    },
    {
      legendaryId: 'crown',
      npcId: 'lodge_keeper',
      npcName: 'Lodge Keeper',
      rumor: '"Trophy hunters come through here all the time chasing Crown. Most don\'t even see him. Those that do usually spook him with bad approach or miss the shot. He won\'t give you a second chance - one mistake and he\'s gone for weeks. But if you do bring him down... that mount would be the centerpiece of any collection."',
      hints: ['No second chances', 'Weeks between sightings', 'Trophy value enormous', 'Professional approach needed'],
    },
    {
      legendaryId: 'crown',
      npcId: 'tracker_pete',
      npcName: 'Tracker Pete',
      rumor: '"I\'ve tracked Crown for three seasons now. Know his patterns, his favorite spots, his routes. Still can\'t get close enough for a shot. He\'s got this sixth sense about danger. Best bet is the forest edge at dawn, clear weather, wind in your face. Use cover, move slow, and pray. That\'s about all you can do."',
      hints: ['Forest edge preferred spot', 'Clear weather essential', 'Wind direction critical', 'Use cover extensively'],
    },
  ],

  // DESERT KING - The Golden Pronghorn
  desert_king: [
    {
      legendaryId: 'desert_king',
      npcId: 'desert_trader',
      npcName: 'Desert Trader',
      rumor: '"You want to know about Desert King? Golden pronghorn that appears at dawn in the Wastes. Fastest thing you\'ll ever see - makes regular pronghorns look slow. They say he can outrun bullets. I don\'t know about that, but I know nobody\'s ever caught him. See him sometimes, just a golden blur against the sunrise."',
      hints: ['Dawn only', 'Extremely fast', 'Golden coloring', 'Salt flats location'],
    },
    {
      legendaryId: 'desert_king',
      npcId: 'prospector_sam',
      npcName: 'Prospector Sam',
      rumor: '"Was heading to my claim one morning when I saw Desert King. Stopped me dead in my tracks. Most beautiful thing I ever saw - fur that glowed gold in the dawn light. Then he took off, and I ain\'t never seen anything move that fast. Like lightning with legs. You want to catch him? Better be the best shot in the territory."',
      hints: ['Glowing golden fur', 'Lightning-fast movement', 'Requires best marksmanship', 'Long range advised'],
    },
    {
      legendaryId: 'desert_king',
      npcId: 'nomad_runner',
      npcName: 'Nomad Runner',
      rumor: '"Desert King is legend among us runners. We pride ourselves on speed, but that pronghorn... he mocks us all. Some say his speed is supernatural, a gift from the desert spirits. Others say he\'s just the perfect animal. Either way, chasing him on horseback is pointless. Take your shot from ambush or don\'t bother."',
      hints: ['Supernatural speed', 'Horseback pursuit futile', 'Ambush only option', 'Desert spirit connection'],
    },
    {
      legendaryId: 'desert_king',
      npcId: 'stable_master',
      npcName: 'Stable Master',
      rumor: '"Had a hunter come through here last week claiming he was going to catch Desert King. Sold him my fastest horse, best tack, everything. He came back three days later, horse exhausted, man defeated. Said he never even got close. That golden pronghorn is in a league of his own. You want him? Forget horses. Get a rifle and wait at dawn."',
      hints: ['Horses are useless', 'Rifle recommended', 'Dawn positioning critical', 'Patience required'],
    },
  ],

  // SCREAMER - The Giant Eagle
  screamer: [
    {
      legendaryId: 'screamer',
      npcId: 'rancher_johnson',
      npcName: 'Rancher Johnson',
      rumor: '"Screamer. That damned eagle has killed three of my horses and injured two riders. He\'s huge - wingspan must be fifteen feet. Comes diving out of the sun so you can\'t see him until it\'s too late. Lost a good wrangler last month when Screamer knocked him off a cliff. County\'s put a bounty on him, but nobody wants to climb up to that summit."',
      hints: ['Attacks from the sun', 'Summit location', 'Targets horses', 'Cliff hazard'],
    },
    {
      legendaryId: 'screamer',
      npcId: 'coalition_scout',
      npcName: 'Coalition Scout',
      rumor: '"We call him Thunderbird\'s Son. Screamer, you call him. He nests atop Thunderbird Peak, in the sacred places. Some of our people say he should not be hunted, that he is spirit-touched. But he has killed too many. If a warrior proves strong enough to face him in aerial combat, we will not interfere. But bring rope - the cliffs are treacherous."',
      hints: ['Aerial combat', 'Sacred peak location', 'Cliff dangers', 'Coalition neutral'],
    },
    {
      legendaryId: 'screamer',
      npcId: 'mountain_guide',
      npcName: 'Mountain Guide Sarah',
      rumor: '"I\'ve guided hunters up to Screamer\'s territory three times. Only one survived. That eagle is smart - uses the terrain, the wind, the cliffs. He\'ll try to knock you off edges or grab you and drop you. Fight him in the open if you can, and watch the sky constantly. His cry gives him away - you\'ll hear it before you see him."',
      hints: ['Terrain is deadly', 'Watch for cry warning', 'Open ground safer', 'Constant vigilance needed'],
    },
    {
      legendaryId: 'screamer',
      npcId: 'horse_breeder',
      npcName: 'Horse Breeder',
      rumor: '"Lost six horses to Screamer this year. Six! That\'s half my breeding stock. He seems to prefer horses over anything else. Swoops down, grabs them with those talons, and either kills them outright or drops them from height. I\'ve seen him carry a full-grown horse fifty feet in the air. Someone needs to stop that bird before he ruins every rancher in the territory."',
      hints: ['Targets horses specifically', 'Incredible strength', 'Can lift large prey', 'Dive attack signature move'],
    },
  ],

  // EL GALLO DIABLO - The Hell Turkey
  el_gallo_diablo: [
    {
      legendaryId: 'el_gallo_diablo',
      npcId: 'outlaw_pete',
      npcName: 'Outlaw Pete',
      rumor: '"You\'re gonna laugh, but I got chased off by a turkey once. Not just any turkey - El Gallo Diablo. Thing\'s four feet tall and mean as hell. Got these spurs that are poisonous. Saw him kill a coyote once, just stomped it to death. Yeah, it\'s embarrassing, but that devil bird is no joke. Course, if you do kill him, you\'ll be a legend in every Frontera saloon."',
      hints: ['Venomous spurs', 'Extremely aggressive', 'Badlands location', 'Comedic value'],
    },
    {
      legendaryId: 'el_gallo_diablo',
      npcId: 'desert_trader',
      npcName: 'Desert Trader',
      rumor: '"El Gallo Diablo is a local legend. Seen him a few times in the badlands. Massive turkey, dark feathers, attitude problem. He\'s territorial as hell - attacks anything that gets near his area. Some folks think it\'s funny, hunting a turkey. Those folks haven\'t met El Gallo. He\'s put more than one tough hombre in the dirt."',
      hints: ['Territorial', 'Dark feathers', 'Surprisingly dangerous', 'Attacks aggressively'],
    },
    {
      legendaryId: 'el_gallo_diablo',
      npcId: 'frontera_scout',
      npcName: 'Frontera Scout',
      rumor: '"That damn turkey is famous around here. Every outlaw worth his salt has a El Gallo Diablo story. Most of them end with running away. He\'s fast, mean, and those spurs will make you regret getting close. Plus the venom hurts like nothing else. You bring him down though? Free drinks in every Frontera cantina for life."',
      hints: ['Outlaw respect for killing', 'Fast movement', 'Spur venom painful', 'Close combat dangerous'],
    },
    {
      legendaryId: 'el_gallo_diablo',
      npcId: 'badlands_hermit',
      npcName: 'Badlands Hermit',
      rumor: '"I see El Gallo most mornings. He patrols the badlands like he owns them. And I suppose he does - ain\'t nothing else wants to challenge him. Seen him fight off coyotes, bobcats, even scared off a cougar once. For a bird, he\'s surprisingly brave. Or stupid. Hard to tell with turkeys."',
      hints: ['Morning patrols', 'Fearless behavior', 'Drives off other predators', 'Badlands domain'],
    },
  ],

  // IRONHIDE - The Armored Boar
  ironhide: [
    {
      legendaryId: 'ironhide',
      npcId: 'miner_jack',
      npcName: 'Miner Jack',
      rumor: '"Ironhide? That boar survived a mining explosion that killed three men. Walked away with some burns and got meaner. His hide is so thick and scarred that bullets just bounce off. Seen it myself - whole group of hunters emptying revolvers into him, and he just kept charging. You want to bring him down? Aim for the soft spots or bring something really heavy."',
      hints: ['Survived explosion', 'Thick scarred hide', 'Bullets ineffective', 'Aim for weak points'],
    },
    {
      legendaryId: 'ironhide',
      npcId: 'forest_hunter',
      npcName: 'Forest Hunter',
      rumor: '"Been hunting these woods thirty years. Ironhide\'s been here most of that time. Watched him grow from a nasty piglet to a four-hundred-pound monster. Every scar on his hide is a story - trap, bullet, knife. He\'s like living armor. Only way to kill him is precision shots to weak spots: eyes, ears, belly, joints. Anywhere else, you\'re just making him angry."',
      hints: ['400+ pounds', 'Weak spots: eyes, ears, belly, joints', 'Decades of survival', 'Precision critical'],
    },
    {
      legendaryId: 'ironhide',
      npcId: 'red_gulch_sheriff',
      npcName: 'Red Gulch Sheriff',
      rumor: '"Ironhide\'s more than a nuisance - he\'s a menace. Charged through town last month, tore up three stores and injured a deputy. We shot him maybe twenty times, and he just shook it off. Finally drove him off with fire. There\'s a standing bounty - five hundred gold to whoever kills him. Good luck collecting it."',
      hints: ['Charges aggressively', 'Fire effective deterrent', 'Bounty available', 'Town menace'],
    },
    {
      legendaryId: 'ironhide',
      npcId: 'prospector_sam',
      npcName: 'Prospector Sam',
      rumor: '"I was there when Ironhide walked through the dynamite blast. We were clearing a new shaft, set the charges, boom. When the smoke cleared, there\'s this massive boar walking out of the crater. Singed but alive. Looked right at us like he was offended we interrupted his nap. That\'s when I knew - that ain\'t no normal pig."',
      hints: ['Dynamite survivor', 'Abnormal toughness', 'Mining area habitat', 'Easily offended'],
    },
  ],

  // NIGHTSTALKER - The Black Panther
  nightstalker: [
    {
      legendaryId: 'nightstalker',
      npcId: 'shaman_walks_with_spirits',
      npcName: 'Shaman Walks With Spirits',
      rumor: '"Nightstalker is Shadow-That-Walks, a spirit guardian that tests warriors in darkness. It hunts only at night, silent as death itself. Those who face it and survive gain great honor. Those who fail... well, we find them in the morning. If you seek Nightstalker, bring light. In complete darkness, it is unbeatable."',
      hints: ['Night only', 'Bring light sources', 'Spirit guardian', 'Complete darkness deadly'],
    },
    {
      legendaryId: 'nightstalker',
      npcId: 'night_watchman',
      npcName: 'Night Watchman',
      rumor: '"I do my rounds every night. Seen Nightstalker twice. Once was just a glimpse - pair of eyes reflecting my lantern, then gone. Second time... I heard it breathing behind me. Felt its presence. Turned around with my lantern and there it was, three feet away. Black as midnight, eyes like amber. Stared at me for ten seconds, then vanished. I quit drinking after that night. Swear I haven\'t touched a drop since."',
      hints: ['Eyes reflect light', 'Silent movement', 'Amber eyes', 'Night vision crucial'],
    },
    {
      legendaryId: 'nightstalker',
      npcId: 'coalition_scout',
      npcName: 'Coalition Scout',
      rumor: '"Nightstalker killed my brother. He was a warrior, strong and skilled. Went to prove himself by hunting the black cat. We found him three days later. No signs of struggle, no chance to fight back. Just... gone in an instant. If you hunt Nightstalker, know that it hunts you too. And in the dark, you are at its mercy."',
      hints: ['Hunts the hunter', 'Instant kills possible', 'No mercy in darkness', 'Requires preparation'],
    },
    {
      legendaryId: 'nightstalker',
      npcId: 'survivor_jane',
      npcName: 'Survivor Jane',
      rumor: '"I survived Nightstalker. Barely. Was camping in Spirit Springs forest when it attacked. Never saw it coming. Just felt claws and teeth, then I was down. Playing dead saved my life - it thought I was done and left. Spent two weeks recovering. That pelt would be worth everything I own, but I ain\'t going back. You can\'t fight what you can\'t see."',
      hints: ['Ambush predator', 'Playing dead might work', 'Valuable pelt', 'Invisibility in darkness'],
    },
  ],

  // OLD GATOR - The River Terror
  old_gator: [
    {
      legendaryId: 'old_gator',
      npcId: 'river_trader',
      npcName: 'River Trader',
      rumor: '"Old Gator\'s destroyed six boats that I know of. Maybe more. He\'s massive - twenty-five feet if he\'s an inch. Been in these waters longer than anyone can remember. Some say he\'s fifty years old. He rules this river absolutely. Stay in your boat, move slow, and pray he ain\'t hungry. And for God\'s sake, don\'t fall in the water."',
      hints: ['25 feet long', '50+ years old', 'Boat destroyer', 'Never enter water'],
    },
    {
      legendaryId: 'old_gator',
      npcId: 'swamp_guide',
      npcName: 'Swamp Guide',
      rumor: '"I guide folks through these swamps, and Old Gator is the one thing that scares me. He\'s smart - knows the water gives him advantage. If you fight him on land, you got a chance. In the water? You\'re done. Seen him death roll a full-grown bull. Crushed it like it was nothing. That hide is ancient and thick as armor."',
      hints: ['Fight on land', 'Death roll signature move', 'Ancient armor-like hide', 'Water gives huge advantage'],
    },
    {
      legendaryId: 'old_gator',
      npcId: 'fisherman_jose',
      npcName: 'Fisherman Jose',
      rumor: '"I fish these waters every day. Know \'em like my own home. And I know Old Gator. He\'s got regular spots he patrols. Big sandbar on the south bend, deep pool by the cypress grove. He\'s most active in daylight and when it rains. I\'ve watched him take down gators half his size. There\'s only one king of this river, and it ain\'t human."',
      hints: ['Regular patrol routes', 'Active in rain', 'Dominates other gators', 'Daylight activity'],
    },
    {
      legendaryId: 'old_gator',
      npcId: 'frontera_scout',
      npcName: 'Frontera Scout',
      rumor: '"There\'s a bounty on Old Gator - territory put up three thousand gold. Still ain\'t been claimed. Every few years, some fool tries to collect. Usually end up as gator food. You want my advice? Heavy rifle, solid ground, and aim for the belly when he rolls. That\'s his only weak spot. And bring friends. You ain\'t taking him alone."',
      hints: ['3000 gold bounty', 'Belly weak spot', 'Requires heavy weapons', 'Bring backup'],
    },
  ],

  // JACKALOPE - The Impossible Beast
  jackalope: [
    {
      legendaryId: 'jackalope',
      npcId: 'any_drunk',
      npcName: 'Drunk Prospector',
      rumor: '"I seen it! I swear on my mother\'s grave! Rabbit with antlers, big as a dog! It was hoppin\' around near my claim at sunset. I tried to catch it but... it just vanished. Poof! Gone! Nobody believes me, but I know what I saw. That jackalope is real, I tell you! REAL!"',
      hints: ['Sighted at sunset', 'Vanishes mysteriously', 'Rabbit with antlers', 'Reality-defying'],
    },
    {
      legendaryId: 'jackalope',
      npcId: 'old_prospector',
      npcName: 'Old Prospector',
      rumor: '"Jackalope? Ha! Been hearing stories about them critters since I was a boy. My grandfather swore he saw one. Now I\'m old and I\'ve never seen hide nor hair. But... well, strange things happen out in the territories. Wouldn\'t surprise me if one day someone actually caught one. Would be worth a fortune to the right collector."',
      hints: ['Ancient legends', 'Never definitively seen', 'High collector value', 'Strange occurrences'],
    },
    {
      legendaryId: 'jackalope',
      npcId: 'crazy_hermit',
      npcName: 'Crazy Hermit',
      rumor: '"The jackalope is a test, you see? A test from beyond! It appears to those chosen, those worthy of seeing the impossible made real. I\'ve seen it seven times. Maybe eight. Lost count. It hops between realities, you know. Can\'t be caught by normal means. You need luck, destiny, and a willingness to believe in things that shouldn\'t exist!"',
      hints: ['Requires luck', 'Reality-bending properties', 'Chosen ones only', 'Belief required'],
    },
    {
      legendaryId: 'jackalope',
      npcId: 'storyteller',
      npcName: 'Storyteller',
      rumor: '"The legend of the jackalope goes back generations. Some say it\'s a myth, a tall tale told around campfires. Others swear they\'ve seen it. Me? I\'ve collected over a hundred jackalope stories from across the territories. Every one different, but all describing the same thing: a rabbit with antlers that defies the laws of nature. If it exists, catching one would make you famous forever."',
      hints: ['Legendary status', 'Numerous sightings', 'Defies natural laws', 'Eternal fame for capture'],
    },
  ],
};

/**
 * Get rumors for a specific legendary
 */
export function getRumorsForLegendary(legendaryId: string): typeof LEGENDARY_RUMORS[string] {
  return LEGENDARY_RUMORS[legendaryId] || [];
}

/**
 * Get random rumor for a legendary
 */
export function getRandomRumor(legendaryId: string): typeof LEGENDARY_RUMORS[string][number] | null {
  const rumors = getRumorsForLegendary(legendaryId);
  if (rumors.length === 0) return null;
  return SecureRNG.select(rumors);
}

/**
 * Clue discovery flavor text
 */
export const CLUE_DISCOVERY_TEXT: Record<string, Record<string, string>> = {
  old_red: {
    tracks: 'You find enormous bear tracks pressed deep into the muddy earth. The prints are far larger than any normal grizzly, and the claw marks are disturbingly long. These tracks lead toward the mountain caves.',
    kill_site: 'The remains of several elk lie scattered across the clearing. The violence of the attack is evident - trees scored with deep claw marks, ground torn up, blood everywhere. This was no ordinary bear.',
    witness: 'The miner\'s hands shake as he describes Old Red: "Massive... scarred red fur... eyes like burning coals. He looked at me like he knew what I was thinking."',
    remains: 'You discover the weathered bones of what appears to be human remains, along with rusted hunting equipment. A warning carved into a nearby tree reads: "OLD RED - TURN BACK"',
    warning: 'Crude warnings have been carved into the rocks around the cave entrance: skulls, crosses, desperate pleas to stay away. The last one simply says "Demon."',
  },
  ghost_cat: {
    tracks: 'Faint white paw prints lead across the rocky cliff trail. They\'re spaced impossibly far apart, and they seem to disappear in places, as if the creature sometimes doesn\'t touch the ground.',
    witness: 'The Coalition elder speaks with reverence: "The white guardian moves like morning mist. You see it, then you don\'t. It is both here and not here."',
    remains: 'A deer carcass lies pristine in the meadow. No signs of struggle, no disturbed earth. Just two precise killing bites to the throat. The prints around it are pure white.',
  },
  lobo_grande: {
    tracks: 'Multiple wolf tracks crisscross the area, but one set stands out - prints twice the size of the others, pressed deeper into the earth. The alpha. The others follow his path exactly.',
    kill_site: 'Dead cattle lie in a circular pattern, systematically taken down. The precision of the attack is disturbing - this wasn\'t random predation, it was tactical warfare.',
    witness: 'The rancher\'s voice is grim: "They came at us like soldiers. Coordinated. Planned. And that black wolf... he directed them all like a general."',
    remains: 'You find the scattered remains of what appears to be a group of bounty hunters. Their weapons are still loaded. They never had a chance to use them.',
  },
  thunder: {
    tracks: 'Massive buffalo tracks glow faintly in the dawn light. The prints are so large and heavy that they\'ve compressed the earth into stone. Around them, grass grows greener.',
    witness: 'The elder\'s voice carries warning: "Thunder walks the sacred grounds at dawn. Pure white. The ancestors travel with it. To hunt Thunder is to hunt the spirits themselves."',
    warning: 'Ancient warnings are carved into the rocks around the mesa: "The White Buffalo is sacred. Those who harm it will know the wrath of sky and earth."',
  },
  crown: {
    tracks: 'Large elk tracks with a distinctive gait pattern. The hoofprints are deep and spaced perfectly - this animal is massive but moves with incredible grace.',
    remains: 'Trees show signs of antler rubbing - the bark is stripped away in patterns that suggest a truly enormous rack. Forty points, at least.',
    witness: 'The trophy hunter\'s eyes light up: "That rack... I\'ve been hunting thirty years and never seen anything like it. Forty points, perfect symmetry. He\'s the one that got away."',
  },
  desert_king: {
    tracks: 'Pronghorn tracks spaced impossibly far apart stretch across the salt flats. Simple math suggests speeds that shouldn\'t be possible for any living creature.',
    remains: 'Golden hairs caught on desert brush shimmer in the sunlight. They\'re coarser than normal pronghorn, and they seem to catch and hold the light.',
    witness: 'The desert trader shakes his head in wonder: "I saw him at dawn. Golden fur like captured sunlight. Then he ran, and... I\'ve never seen anything move that fast."',
  },
  screamer: {
    remains: 'A horse carcass lies on a mountain ledge fifty feet up. Talon marks gouge deep into the hide. Whatever carried it here has incredible strength.',
    witness: 'The rancher\'s face darkens: "Wingspan like nothing I\'ve seen. Fifteen feet, maybe more. Comes out of the sun so you can\'t see until it\'s too late."',
    warning: 'A massive nest crowns the peak, built from branches as thick as a man\'s arm. Horse bones litter the area beneath.',
  },
  el_gallo_diablo: {
    tracks: 'Three-toed turkey tracks, but far larger than normal. They\'re pressed deep into the earth, suggesting a bird of considerable weight.',
    remains: 'A dead coyote lies in the scrubland, killed by what appears to be spur wounds. The punctures are deep and show signs of venom.',
    witness: 'The outlaw grins sheepishly: "Yeah, I got chased by a turkey. Go ahead and laugh. But when you meet El Gallo, you\'ll understand."',
  },
  ironhide: {
    tracks: 'Deep boar tracks and scarred trees mark the area. One tree has been partially uprooted by what must have been a tremendous charge.',
    remains: 'The ground is torn up in patterns suggesting multiple violent charges. Embedded in one tree trunk are several flattened bullets.',
    witness: 'The miner speaks with disbelief: "He walked out of the explosion. Just... walked out. Singed but alive. That\'s when I knew he wasn\'t normal."',
  },
  nightstalker: {
    tracks: 'Large cat tracks visible only in certain light. They appear jet black against the earth, as if they absorb light rather than reflect it.',
    remains: 'A victim with no signs of struggle. The kill was instant, professional, perfect. Only visible in darkness, the attack came from nowhere.',
    witness: 'The survivor\'s voice trembles: "I never saw it. Just felt it. Claws, teeth, and then darkness. Playing dead saved me. You can\'t fight what you can\'t see."',
  },
  old_gator: {
    tracks: 'Massive slide marks enter the water, accompanied by four-toed prints as long as a man\'s forearm. The mud is churned up from something of enormous weight.',
    remains: 'A destroyed boat floats in pieces. Massive bite marks have crushed through the wood like paper.',
    witness: 'The river trader\'s voice is grave: "Twenty-five feet, easy. Maybe more. He\'s been in these waters longer than anyone alive. He IS the river."',
  },
  jackalope: {
    tracks: 'Rabbit tracks that seem... wrong somehow. They\'re spaced oddly, and in places they simply vanish mid-stride, as if the creature hopped into another dimension.',
    witness: 'The drunk prospector insists: "RABBIT WITH ANTLERS! I swear it! Big as a dog! It was right there and then... gone! You believe me, right?"',
  },
};

/**
 * Get clue text for discovery
 */
export function getClueText(legendaryId: string, clueType: string): string {
  return CLUE_DISCOVERY_TEXT[legendaryId]?.[clueType] || 'You find signs of the legendary creature.';
}

/**
 * Progress milestones for legendary discovery
 */
export const DISCOVERY_MILESTONES = {
  RUMOR_HEARD: 20,        // 20% progress per rumor
  CLUE_FOUND: 25,         // 25% progress per clue
  DISCOVERY_THRESHOLD: 75 // 75% progress unlocks hunt
};

export default LEGENDARY_RUMORS;

/**
 * Enhanced Location Descriptions
 * Narrative-rich atmospheric descriptions for all major locations
 */

export interface LocationDescription {
  locationId: string;
  name: string;
  longDescription: string;
  visualDescription: string;
  sounds: string;
  smells: string;
  dayDescription: string;
  nightDescription: string;
  weatherVariations: {
    clear: string;
    rain: string;
    dust_storm: string;
  };
  secrets: string[];
  history: string;
}

/**
 * ========================================
 * MAJOR SETTLEMENTS
 * ========================================
 */

export const RED_GULCH_DESCRIPTION: LocationDescription = {
  locationId: 'red-gulch',
  name: 'Red Gulch',
  longDescription: `Red Gulch sprawls across the canyon mouth like a fever dream of civilization carved into the desert. The town divides itself naturally into Upper Town and Lower Town, separated not just by altitude but by wealth, power, and aspiration.

Upper Town perches on the canyon rim, where Victorian mansions painted in whites and pastels stand in defiance of the red dust that coats everything. Here, railroad barons smoke cigars on wraparound porches, their wives host garden parties beneath parasols, and servants sweep red sand off marble steps every morning. The streets are wide and relatively clean, lined with gas lamps that actually work.

Lower Town is where Red Gulch truly lives. A chaotic sprawl of false-front buildings, tents, and makeshift structures crowd together along dirt streets that become rivers of mud when it rains. The Lucky Strike Saloon anchors the main drag, its piano audible from three blocks away. The smell of frying meat mixes with horse manure, coal smoke, and the metallic tang of blood from the butcher's shop.

Between the two sections, the Gulch Stairs climb the canyon wall - 247 wooden steps that separate the haves from the have-nots. Locals say you can judge a man's fortune by counting how many steps up he lives.`,

  visualDescription: `Red sandstone canyon walls loom over wooden buildings. Dust hangs in the air, turning sunlight golden. Buildings lean against each other like drunks. Wanted posters flutter on every post. The red earth stains everything - boots, hems, hopes.`,

  sounds: `Piano music from saloons. Hammer on anvil from the blacksmith. Horses nickering at the livery. Shouted prices from vendors. The distant rumble of mine explosions. At night, gunshots and breaking glass punctuate the darkness.`,

  smells: `Woodsmoke, horse sweat, spilled whiskey, dust, fried food, coal from the smithy, perfume from the fancy ladies, blood and meat from the butcher. After rain, the distinct smell of wet creosote.`,

  dayDescription: `The morning sun turns the canyon walls blood-red. Merchants open shutters, workers trudge to the mines, and the smell of coffee drifts from the café. By noon, the heat drives most indoors. Streets fill again as the sun sets, when the real business of Red Gulch begins.`,

  nightDescription: `Gas lamps cast pools of yellow light. Saloons glow with lamplight and raucous laughter. Shadows move in alleys where things best left unspoken happen. The marshal makes his rounds, lantern swinging. Up in Upper Town, civilized dinners end with brandy and cigars while Lower Town gets drunk and dangerous.`,

  weatherVariations: {
    clear: `The sky stretches impossibly blue above the red canyon. Heat shimmers off roofs. Lizards bask on sun-warmed stones. Even the shadows feel hot.`,
    rain: `Rare and violent, the rain turns streets into rivers of red mud. Everyone retreats indoors except children who dance in the downpour. The canyon walls darken to the color of dried blood. Thunder echoes like artillery.`,
    dust_storm: `The sky turns orange-brown. Grit fills every crack and crevice. Shopkeepers board windows. The wind howls through town like a living thing. Only fools and the desperate venture outside. The storm passes, leaving everything buried under a fine layer of red powder.`
  },

  secrets: [
    `The old mine shaft beneath Henderson's General Store connects to a network of smuggling tunnels.`,
    `Marshal Blackwood's predecessor died in a fire that was definitely not an accident.`,
    `Every third Thursday, there's a high-stakes poker game in the backroom of The Lucky Strike that decides more than gambling debts.`,
    `The Chinese laundry worker can forge any document you need - for the right price.`,
    `The well at the edge of town is deeper than it should be, and sometimes you can hear things moving down there.`
  ],

  history: `Founded during the silver boom of 1875, Red Gulch exploded from a mining camp to a full town in less than two years. The original camp was just tents clustered around the first profitable strike - the "Red Lady" mine that gave the gulch its name.

As wealth poured out of the earth, the town split along class lines. Mine owners built mansions on the canyon rim to escape the noise and smell of their fortune's source. Workers and merchants remained below, creating the divided town that exists today.

The railroad arrived in 1880, cementing Red Gulch's position as the regional capital. But with civilization came corruption. Three marshals have died violently in office. The mines are running dry, but nobody wants to admit the boom is ending.`
};

export const THE_FRONTERA_DESCRIPTION: LocationDescription = {
  locationId: 'the-frontera',
  name: 'The Frontera',
  longDescription: `The Frontera exists in the liminal space between nations, laws, and civilizations. Built on both banks of the Rio Sangre, connected by a rickety bridge that sways in the wind, the town operates under El Rey's Code - a harsh but fair set of rules that applies to everyone equally.

The architecture reflects the town's mixed heritage: adobe buildings with Spanish tile roofs stand beside rough timber structures. Signs are written in Spanish, English, and sometimes Chinese. Three flags fly over the town: Mexico, the United States, and El Rey's personal standard - a black flag with a red sword.

The main plaza centers around an old mission church, long deconsecrated and now serving as El Rey's hall of justice. Public trials happen here, quick and brutal. The Code is posted on the church doors: "No theft among our own. No murder without cause. No law but The Code. No mercy for those who break it."

The black market thrives openly here. What's illegal elsewhere is just commerce in The Frontera. Smugglers, fugitives, deserters, and those running from their past find refuge - as long as they follow The Code and pay El Rey's tax.`,

  visualDescription: `Adobe and timber mixed together. Mexican, American, and Chinese architecture clashing beautifully. The black flag with the red sword snaps in the wind above the plaza. Armed men everywhere - but watching each other, not you. The river runs red with clay, living up to its name.`,

  sounds: `Spanish, English, and Chinese mix in the air. Mariachi music from cantinas. The creek of the swaying bridge. Horses, always horses. Distant gunfire from the practice range. The metallic ring of blade on whetstone. Cards shuffling. Coins clinking. Deals being made in quiet corners.`,

  smells: `Chili peppers roasting. Horse leather and gun oil. Tequila and mescal. Tobacco smoke. The distinctive smell of black powder. River water and wet earth. Cooking masa. Blood from the fighting pit behind the cantina.`,

  dayDescription: `Mornings are for business - cargo moves across the border, deals are struck, hands are shaken or cut off. The market opens with shouted prices in three languages. By afternoon, men gather in the shade to drink and play cards. El Rey holds court in the mission from noon to sunset.`,

  nightDescription: `The Frontera truly comes alive after dark. Cantinas fill with music and laughter. The fighting pit draws crowds and bets. Shadowy figures move contraband across the river. The Prophet reads fortunes by candlelight. El Rey patrols with his blade, enforcing The Code with steel and blood.`,

  weatherVariations: {
    clear: `The brutal sun beats down on adobe walls. Everything bakes. Siesta is not optional - the heat makes work impossible midday. The river shrinks, exposing red mud banks. Vultures circle overhead.`,
    rain: `The rain brings life to The Frontera. The river swells, sometimes cutting the town in two when the bridge becomes impassable. Adobe walls darken beautifully. Everyone comes outside to feel the precious water. Children play. Old men smile. The desert remembers it's alive.`,
    dust_storm: `The wind from the desert turns day to twilight. Red dust infiltrates everything. The bridge sways dangerously. El Rey's flag shreds itself to ribbons. People huddle indoors, waiting for the storm to pass while drinking and telling stories of worse storms.`
  },

  secrets: [
    `The mission church has a hidden basement where El Rey keeps his real treasures - and his prisoners.`,
    `The Prophet is much older than they appear and knows secrets about the territory that predate the Spanish.`,
    `Three smuggling tunnels run under the river, predating the town itself.`,
    `El Rey's sword is said to have been Cortés' personal blade, stolen from a Spanish museum.`,
    `The black market has connections to Pinkerton agents who look the other way for a cut.`
  ],

  history: `The Frontera began as a river crossing, a ford where traders moving between nations would meet. For decades, it was just a few adobe buildings where deals were made and goods exchanged without the inconvenience of tariffs or laws.

Carlos Martinez arrived in 1878, a former cavalry officer on both sides of the border war. He saw potential in the lawless crossing. With a small group of loyal followers, he established The Code and declared himself El Rey - The King. His rule is absolute but fair, his justice swift but evenhanded.

Under El Rey, The Frontera grew from a smuggler's crossing to a functioning outlaw town. Fugitives from both nations found refuge. The black market flourished. Neither Mexico nor the United States officially recognizes The Frontera, but both turn a blind eye - sometimes it's useful to have a place where unofficial business can be conducted.`
};

export const KAIOWA_MESA_DESCRIPTION: LocationDescription = {
  locationId: 'kaiowa-mesa',
  name: 'Kaiowa Mesa',
  longDescription: `Kaiowa Mesa rises from the desert like an island of stone, a sacred place where the Kaiowa people have lived for generations uncounted. The top is flat and broad, accessible only by narrow trails that wind up cliff faces - easily defended, impossible to take by force.

Traditional lodges circle the central fire pit where the council meets. Medicine wheels mark the four directions. The sacred kiva - a circular underground chamber - sits at the highest point, its entrance oriented to catch the sunrise. This is where the elders perform ceremonies that connect the living to the ancestors, to the land itself.

Unlike the settler towns that fight against the land, Kaiowa Mesa exists in harmony with it. Water is collected from rare rains and stored in carefully maintained cisterns. Gardens grow in terraced plots using techniques refined over centuries. Buffalo hides cure in the sun. Children play games their grandparents' grandparents played.

But harmony does not mean peace. The Kaiowa are warriors. They've fought the Spanish, the Mexicans, the Americans, and each other. Warriors train on the mesa's edge, perfecting skills with bow, lance, and increasingly, rifle. They know the settlers' hunger for land is infinite, and the fight is far from over.`,

  visualDescription: `Red-orange stone rises in layered cliffs. Traditional lodges with buffalo hide coverings surround the central fire. Medicine wheels made of stone mark sacred directions. Eagle feathers flutter from prayer sticks. The sky seems closer here, bigger. At night, stars so bright they cast shadows.`,

  sounds: `The constant wind across the mesa. Eagles crying overhead. The soft rhythm of drums from the kiva. Children's laughter. The scrape of stone on stone as tools are made. Horses whinnying from the corrals. At night, coyotes singing to the moon. The crackle of the central fire that never goes out.`,

  smells: `Sage smoke from purification rituals. Cured buffalo hide. Woodsmoke and cooking meat. The sharp scent of desert plants after rain. Sweet grass being braided. The dry stone smell of the mesa itself. Horse leather and honest sweat.`,

  dayDescription: `Sunrise brings the elders to pray. The morning is for work - tending gardens, training warriors, teaching children. Noon heat brings rest and storytelling in the shade. Afternoon is for council meetings and decision-making. Sunset brings the entire community together around the central fire.`,

  nightDescription: `The stars emerge like spirits. The central fire burns bright, drawing the community together. Elders tell stories of the ancestors. Young warriors boast and compete. The drums echo from the kiva during ceremonies. Watch fires on the mesa's edge keep vigilant against threats. The sacred darkness is for connecting with the spirit world.`,

  weatherVariations: {
    clear: `The sun blazes overhead, but the wind never stops, keeping the mesa bearable. Hawks ride thermals. Lizards hunt in crevices. The stone holds heat like a living thing. You can see for fifty miles in every direction - which is exactly the point.`,
    rain: `When rain comes to the mesa, it's a blessing. Every container fills. Children dance. Adults give thanks to the sky. Water pours off the cliffs in temporary waterfalls. The desert below turns briefly green. The kiva fills with grateful prayers.`,
    dust_storm: `The mesa faces the full fury of desert storms. Wind tears at everything. Sand scours exposed skin. Everyone retreats to lodges and endures. But the mesa has stood for uncounted generations. It will stand through this storm too.`
  },

  secrets: [
    `The kiva goes deeper than anyone admits, with tunnels reaching far beneath the mesa.`,
    `There's a sacred cave where pictographs show events that haven't happened yet - or have they?`,
    `Soaring Eagle knows the location of ancient Spanish gold, hidden by his great-grandfather.`,
    `A wendigo is bound beneath the mesa, held by ceremonies that must be performed correctly. If they fail...`,
    `The Kaiowa have a treaty with the skinwalkers - uneasy, fragile, but holding. For now.`
  ],

  history: `The Kaiowa claim to have lived on the mesa since the world was young, and the rock art in the caves suggests they're not exaggerating by much. The mesa has been sacred ground for over a thousand years, a place of power where the barrier between worlds grows thin.

They've seen empires rise and fall - the Ancestral Puebloans, the Spanish conquistadors, the Mexican government, and now the Americans. Each thought they could claim the mesa. Each learned better.

The current generation faces the greatest threat yet: not armies, but farmers, railroads, and the inexorable spread of "civilization." The elders know the fight is no longer about holding the mesa - it's about preserving the Kaiowa way of life itself.`
};

/**
 * All enhanced location descriptions
 */
export const ALL_LOCATION_DESCRIPTIONS: LocationDescription[] = [
  RED_GULCH_DESCRIPTION,
  THE_FRONTERA_DESCRIPTION,
  KAIOWA_MESA_DESCRIPTION
];

/**
 * Get description by location ID
 */
export function getLocationDescription(locationId: string): LocationDescription | undefined {
  return ALL_LOCATION_DESCRIPTIONS.find(desc => desc.locationId === locationId);
}

/**
 * Get description by location name
 */
export function getLocationDescriptionByName(name: string): LocationDescription | undefined {
  return ALL_LOCATION_DESCRIPTIONS.find(desc =>
    desc.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Wandering Service Provider Data
 *
 * Contains all 10 traveling service provider NPCs who offer various services
 * as they move between locations throughout the game world
 */

import {
  WanderingServiceProvider,
  ServiceProviderProfession,
  ServiceType,
  ServiceEffectType,
  NPCActivity,
} from '@desperados/shared';

/**
 * All 10 Wandering Service Providers
 */
export const WANDERING_SERVICE_PROVIDERS: WanderingServiceProvider[] = [
  // 1. REVEREND JOSIAH BLACKWOOD (TRAVELING PREACHER)
  {
    id: 'provider_reverend_blackwood',
    name: 'Reverend Josiah Blackwood',
    title: 'Fire and Brimstone Preacher',
    profession: ServiceProviderProfession.TRAVELING_PREACHER,
    description:
      'A fire-and-brimstone preacher who travels between settlements bringing the word of God. Despite his harsh sermons, he genuinely cares for the souls of frontier folk.',
    personality: 'Fire-and-brimstone exterior, genuinely caring heart',
    faction: 'settler',
    baseTrust: 2,
    trustDecayRate: 0.1,
    maxTrust: 5,

    route: [
      {
        locationId: 'red_gulch',
        locationName: 'Red Gulch',
        arrivalDay: 0, // Sunday
        arrivalHour: 8,
        departureDay: 0,
        departureHour: 16,
        stayDuration: 8,
        setupLocation: 'red_gulch_church',
      },
      {
        locationId: 'iron_springs',
        locationName: 'Iron Springs',
        arrivalDay: 2, // Tuesday
        arrivalHour: 10,
        departureDay: 2,
        departureHour: 18,
        stayDuration: 8,
        setupLocation: 'iron_springs_church',
      },
      {
        locationId: 'copper_trail',
        locationName: 'Copper Trail',
        arrivalDay: 4, // Thursday
        arrivalHour: 12,
        departureDay: 4,
        departureHour: 20,
        stayDuration: 8,
        setupLocation: 'copper_trail_chapel',
      },
      {
        locationId: 'ravens_perch',
        locationName: "Raven's Perch",
        arrivalDay: 6, // Saturday
        arrivalHour: 9,
        departureDay: 6,
        departureHour: 17,
        stayDuration: 8,
        setupLocation: 'ravens_perch_church',
      },
    ],

    schedule: [
      {
        dayOfWeek: 0,
        hour: 8,
        endHour: 10,
        activity: NPCActivity.PRAYING,
        locationId: 'red_gulch_church',
        locationName: 'Red Gulch Church',
        servicesAvailable: false,
      },
      {
        dayOfWeek: 0,
        hour: 10,
        endHour: 14,
        activity: NPCActivity.WORKING,
        locationId: 'red_gulch_church',
        locationName: 'Red Gulch Church',
        servicesAvailable: true,
      },
      {
        dayOfWeek: 0,
        hour: 14,
        endHour: 15,
        activity: NPCActivity.EATING,
        locationId: 'red_gulch_restaurant',
        locationName: 'Restaurant',
        servicesAvailable: false,
      },
      {
        dayOfWeek: 0,
        hour: 15,
        endHour: 16,
        activity: NPCActivity.SOCIALIZING,
        locationId: 'red_gulch_main_street',
        locationName: 'Main Street',
        servicesAvailable: true,
      },
    ],

    services: [
      {
        id: 'service_sermon',
        name: 'Sunday Sermon',
        description:
          'A powerful sermon that inspires and strengthens the spirit. Provides temporary morale boost.',
        serviceType: ServiceType.BLESSING,
        cost: {
          type: 'gold',
          gold: 5,
        },
        duration: 30,
        effects: [
          {
            type: ServiceEffectType.BUFF,
            target: 'stat',
            value: 10,
            duration: 120,
            statName: 'morale',
            description: '+10 Morale for 2 hours',
          },
        ],
        cooldown: 1440, // Once per day
      },
      {
        id: 'service_blessing',
        name: 'Personal Blessing',
        description:
          'A personal blessing from the Reverend that provides divine protection and luck.',
        serviceType: ServiceType.BLESSING,
        cost: {
          type: 'gold',
          gold: 15,
        },
        duration: 15,
        effects: [
          {
            type: ServiceEffectType.BUFF,
            target: 'stat',
            value: 5,
            duration: 240,
            statName: 'luck',
            description: '+5 Luck for 4 hours',
          },
          {
            type: ServiceEffectType.BUFF,
            target: 'stat',
            value: 10,
            duration: 240,
            statName: 'defense',
            description: '+10 Defense for 4 hours',
          },
        ],
        requirements: {
          minTrustLevel: 2,
        },
        cooldown: 360, // Once per 6 hours
      },
      {
        id: 'service_confession',
        name: 'Confession',
        description:
          'Confess your sins and receive absolution. Reduces karma debt and bounty.',
        serviceType: ServiceType.CONFESSION,
        cost: {
          type: 'gold',
          gold: 25,
        },
        duration: 20,
        effects: [
          {
            type: ServiceEffectType.REDUCE_BOUNTY,
            target: 'legal',
            value: 10, // 10% reduction
            description: 'Reduces bounty by 10%',
          },
        ],
        requirements: {
          minTrustLevel: 3,
        },
        cooldown: 1440, // Once per day
      },
      {
        id: 'service_marriage',
        name: 'Marriage Ceremony',
        description: 'Perform a proper marriage ceremony in the eyes of God.',
        serviceType: ServiceType.MARRIAGE,
        cost: {
          type: 'gold',
          gold: 50,
        },
        duration: 60,
        effects: [
          {
            type: ServiceEffectType.UNLOCK,
            target: 'character',
            value: 1,
            description: 'Unlocks marriage benefits',
          },
        ],
        requirements: {
          minTrustLevel: 4,
        },
      },
      {
        id: 'service_last_rites',
        name: 'Last Rites',
        description:
          'Administer last rites to prepare the soul for the hereafter. Reduces death penalty.',
        serviceType: ServiceType.LAST_RITES,
        cost: {
          type: 'gold',
          gold: 20,
        },
        duration: 10,
        effects: [
          {
            type: ServiceEffectType.BUFF,
            target: 'character',
            value: 50, // 50% reduction in death penalty
            duration: 60,
            description: 'Reduces next death penalty by 50% for 1 hour',
          },
        ],
        requirements: {
          minTrustLevel: 2,
        },
        emergencyCost: {
          type: 'gold',
          gold: 40,
        },
      },
    ],

    dialogue: {
      greeting: [
        'Brother, the Lord works in mysterious ways!',
        'Repent, for the Kingdom of Heaven is at hand!',
        'Welcome, child. How may I guide your soul?',
        'The Word of the Lord burns like fire in my bones!',
      ],
      serviceOffer: [
        'I offer blessings, confession, and the saving grace of the Almighty.',
        'Would you hear a sermon? Receive a blessing? Confess your sins?',
        'The services of the Church are available to all who seek redemption.',
      ],
      serviceDone: [
        'Go in peace, and sin no more.',
        'May the Lord watch over you on your journey.',
        'You are absolved. Walk in righteousness.',
        'The grace of God be upon you.',
      ],
      cannotAfford: [
        'The Church accepts whatever you can give, my child.',
        'Even a widow\'s mite is precious in God\'s eyes.',
        'Faith is free, but the Church must eat.',
      ],
      trustLow: [
        'I sense doubt in your heart. Return when you are ready to truly seek the Lord.',
        'Actions speak louder than words, friend. Show me your faith.',
      ],
      trustHigh: [
        'Ah, a faithful servant! The Lord smiles upon you.',
        'Your devotion has not gone unnoticed. I am honored to serve you.',
        'Walk with God, my most trusted friend.',
      ],
      emergency: [
        'A soul in need! I shall come at once!',
        'The Lord\'s work knows no hours. What troubles you?',
      ],
      departingSoon: [
        'I must move on soon. The Lord\'s work calls me elsewhere.',
        'Another flock awaits. But I shall return next week.',
      ],
      busy: [
        'I am in prayer. Please wait, or return later.',
        'The Lord requires my full attention just now.',
      ],
    },

    specialAbilities: [
      'Reduces karma debt through confession',
      'Provides powerful morale buffs',
      'Can perform marriages',
    ],

    trustBonuses: [
      {
        trustLevel: 2,
        benefits: {
          discountPercentage: 10,
        },
      },
      {
        trustLevel: 3,
        benefits: {
          unlockServices: ['service_confession'],
          discountPercentage: 15,
        },
      },
      {
        trustLevel: 4,
        benefits: {
          unlockServices: ['service_marriage'],
          discountPercentage: 20,
          priorityService: true,
        },
      },
      {
        trustLevel: 5,
        benefits: {
          discountPercentage: 25,
          exclusiveServices: ['service_divine_intervention'],
          canTeachAbilities: true,
        },
      },
    ],
  },

  // 2. DR. HELENA MARSH (TRAVELING PHYSICIAN)
  {
    id: 'provider_dr_marsh',
    name: 'Dr. Helena Marsh',
    title: 'Traveling Physician',
    profession: ServiceProviderProfession.TRAVELING_PHYSICIAN,
    description:
      'A skilled physician who brings modern medicine to remote areas. As a progressive woman doctor, she faces prejudice but her skills speak for themselves.',
    personality: 'Progressive, skilled, determined despite prejudice',
    faction: 'settler',
    baseTrust: 2,
    trustDecayRate: 0.1,
    maxTrust: 5,

    route: [
      {
        locationId: 'mining_camp_1',
        locationName: 'Silver Creek Mine',
        arrivalDay: 1, // Monday
        arrivalHour: 8,
        departureDay: 1,
        departureHour: 16,
        stayDuration: 8,
        setupLocation: 'miners_barracks',
      },
      {
        locationId: 'ranch_settlement',
        locationName: 'Prairie Ranch',
        arrivalDay: 3, // Wednesday
        arrivalHour: 10,
        departureDay: 3,
        departureHour: 18,
        stayDuration: 8,
        setupLocation: 'ranch_house',
      },
      {
        locationId: 'frontier_outpost',
        locationName: 'Frontier Outpost',
        arrivalDay: 5, // Friday
        arrivalHour: 12,
        departureDay: 5,
        departureHour: 20,
        stayDuration: 8,
        setupLocation: 'outpost_infirmary',
      },
    ],

    schedule: [
      {
        dayOfWeek: 1,
        hour: 8,
        endHour: 12,
        activity: NPCActivity.WORKING,
        locationId: 'miners_barracks',
        locationName: 'Miners Barracks',
        servicesAvailable: true,
      },
      {
        dayOfWeek: 1,
        hour: 12,
        endHour: 13,
        activity: NPCActivity.EATING,
        locationId: 'mining_camp_mess',
        locationName: 'Mess Hall',
        servicesAvailable: false,
      },
      {
        dayOfWeek: 1,
        hour: 13,
        endHour: 16,
        activity: NPCActivity.WORKING,
        locationId: 'miners_barracks',
        locationName: 'Miners Barracks',
        servicesAvailable: true,
        emergencyOnly: false,
      },
    ],

    services: [
      {
        id: 'service_medical_exam',
        name: 'Medical Examination',
        description:
          'A thorough medical examination to assess your health and treat minor ailments.',
        serviceType: ServiceType.MEDICAL_TREATMENT,
        cost: {
          type: 'gold',
          gold: 20,
        },
        duration: 15,
        effects: [
          {
            type: ServiceEffectType.HEAL,
            target: 'character',
            value: 50,
            description: 'Restores 50 HP',
          },
        ],
      },
      {
        id: 'service_surgery',
        name: 'Surgical Procedure',
        description:
          'Advanced surgical treatment for serious injuries. Better healing than standard doctors.',
        serviceType: ServiceType.SURGERY,
        cost: {
          type: 'gold',
          gold: 75,
        },
        duration: 45,
        effects: [
          {
            type: ServiceEffectType.HEAL,
            target: 'character',
            value: 100,
            description: 'Fully restores HP',
          },
          {
            type: ServiceEffectType.CURE,
            target: 'character',
            value: 1,
            description: 'Removes all injuries and ailments',
          },
        ],
        requirements: {
          minTrustLevel: 2,
        },
        cooldown: 360,
      },
      {
        id: 'service_disease_cure',
        name: 'Disease Treatment',
        description:
          'Treatment for diseases including cholera, typhoid, and other frontier ailments.',
        serviceType: ServiceType.DISEASE_CURE,
        cost: {
          type: 'gold',
          gold: 50,
        },
        duration: 30,
        effects: [
          {
            type: ServiceEffectType.CURE,
            target: 'character',
            value: 1,
            description: 'Cures all diseases',
          },
          {
            type: ServiceEffectType.BUFF,
            target: 'stat',
            value: 20,
            duration: 480,
            statName: 'constitution',
            description: '+20 Constitution for 8 hours',
          },
        ],
        requirements: {
          minTrustLevel: 3,
        },
      },
      {
        id: 'service_rare_condition',
        name: 'Rare Condition Treatment',
        description:
          'Treatment for rare medical conditions that other doctors cannot cure.',
        serviceType: ServiceType.DISEASE_CURE,
        cost: {
          type: 'gold',
          gold: 150,
        },
        duration: 60,
        effects: [
          {
            type: ServiceEffectType.CURE,
            target: 'character',
            value: 1,
            description: 'Cures rare conditions including poison, infection, cursed wounds',
          },
          {
            type: ServiceEffectType.HEAL,
            target: 'character',
            value: 100,
            description: 'Fully restores HP',
          },
        ],
        requirements: {
          minTrustLevel: 4,
        },
        cooldown: 1440,
        emergencyCost: {
          type: 'gold',
          gold: 300,
        },
      },
    ],

    dialogue: {
      greeting: [
        'Good day. I\'m Dr. Marsh. What seems to be the problem?',
        'Let me examine you. Don\'t mind the skeptics - my credentials speak for themselves.',
        'Modern medicine, even out here in the wilderness. How can I help?',
      ],
      serviceOffer: [
        'I offer medical examinations, surgery, and disease treatment.',
        'My training at the Boston Medical College makes me uniquely qualified to help you.',
        'I can treat conditions other frontier doctors cannot.',
      ],
      serviceDone: [
        'You should feel better now. Return if symptoms persist.',
        'Follow my instructions for recovery. Science prevails.',
        'There. A woman\'s touch can be just as skilled as any man\'s.',
      ],
      cannotAfford: [
        'Medicine isn\'t cheap, but I can arrange a payment plan.',
        'I didn\'t travel all this way to turn away patients. We\'ll work something out.',
      ],
      trustLow: [
        'You seem skeptical. Perhaps you\'d prefer a less qualified doctor?',
        'I earn trust through results, not words. Let me prove my worth.',
      ],
      trustHigh: [
        'Ah, a patient who appreciates proper medicine! How can I help you today?',
        'Always a pleasure to see you. Your health is important to me.',
      ],
      emergency: [
        'A medical emergency! Bring them here quickly!',
        'I\'ll get my surgical kit. Every second counts.',
      ],
      departingSoon: [
        'I must continue my rounds soon. Other settlements need medical care.',
        'I\'ll be back next week. Try to stay healthy until then.',
      ],
      busy: [
        'I\'m with a patient. Please wait or come back.',
        'Let me finish this procedure first.',
      ],
    },

    specialAbilities: [
      'Superior healing compared to town doctors',
      'Can cure rare conditions',
      'Emergency surgery available at any time',
    ],

    trustBonuses: [
      {
        trustLevel: 2,
        benefits: {
          discountPercentage: 10,
          unlockServices: ['service_surgery'],
        },
      },
      {
        trustLevel: 3,
        benefits: {
          discountPercentage: 15,
          unlockServices: ['service_disease_cure'],
        },
      },
      {
        trustLevel: 4,
        benefits: {
          discountPercentage: 20,
          unlockServices: ['service_rare_condition'],
          priorityService: true,
        },
      },
      {
        trustLevel: 5,
        benefits: {
          discountPercentage: 30,
          canTeachAbilities: true,
        },
      },
    ],
  },

  // 3. "WRENCH" MCALLISTER (TRAVELING MECHANIC)
  {
    id: 'provider_wrench',
    name: '"Wrench" McAllister',
    title: 'Traveling Mechanic',
    profession: ServiceProviderProfession.TRAVELING_MECHANIC,
    description:
      'A gruff mechanic who loves machines more than people. Can repair and upgrade any equipment, from firearms to steam engines.',
    personality: 'Gruff, honest, prefers machines to people',
    faction: 'neutral',
    baseTrust: 1,
    trustDecayRate: 0.2,
    maxTrust: 5,

    route: [
      {
        locationId: 'mining_camp_1',
        locationName: 'Silver Creek Mine',
        arrivalDay: 0, // Sunday
        arrivalHour: 10,
        departureDay: 1,
        departureHour: 16,
        stayDuration: 30,
        setupLocation: 'mining_camp_workshop',
      },
      {
        locationId: 'ranch_settlement',
        locationName: 'Prairie Ranch',
        arrivalDay: 2, // Tuesday
        arrivalHour: 8,
        departureDay: 2,
        departureHour: 18,
        stayDuration: 10,
        setupLocation: 'ranch_barn',
      },
      {
        locationId: 'frontier_outpost',
        locationName: 'Frontier Outpost',
        arrivalDay: 4, // Thursday
        arrivalHour: 12,
        departureDay: 5,
        departureHour: 16,
        stayDuration: 28,
        setupLocation: 'outpost_armory',
      },
    ],

    schedule: [
      {
        dayOfWeek: 0,
        hour: 10,
        endHour: 18,
        activity: NPCActivity.CRAFTING,
        locationId: 'mining_camp_workshop',
        locationName: 'Mining Camp Workshop',
        servicesAvailable: true,
      },
      {
        dayOfWeek: 0,
        hour: 18,
        endHour: 20,
        activity: NPCActivity.EATING,
        locationId: 'mining_camp_mess',
        locationName: 'Mess Hall',
        servicesAvailable: false,
      },
    ],

    services: [
      {
        id: 'service_equipment_repair',
        name: 'Equipment Repair',
        description: 'Repair damaged equipment to full functionality.',
        serviceType: ServiceType.EQUIPMENT_REPAIR,
        cost: {
          type: 'gold',
          gold: 15,
        },
        duration: 20,
        effects: [
          {
            type: ServiceEffectType.REPAIR,
            target: 'equipment',
            value: 100,
            description: 'Fully repairs one piece of equipment',
          },
        ],
      },
      {
        id: 'service_weapon_repair',
        name: 'Weapon Repair & Maintenance',
        description: 'Expert repair and maintenance for firearms and weapons.',
        serviceType: ServiceType.WEAPON_REPAIR,
        cost: {
          type: 'gold',
          gold: 25,
        },
        duration: 30,
        effects: [
          {
            type: ServiceEffectType.REPAIR,
            target: 'equipment',
            value: 100,
            description: 'Fully repairs weapon',
          },
          {
            type: ServiceEffectType.BUFF,
            target: 'equipment',
            value: 5,
            duration: 720,
            description: '+5% weapon performance for 12 hours',
          },
        ],
        requirements: {
          minTrustLevel: 2,
        },
      },
      {
        id: 'service_equipment_upgrade',
        name: 'Equipment Upgrade',
        description: 'Modify and upgrade equipment for improved performance.',
        serviceType: ServiceType.EQUIPMENT_UPGRADE,
        cost: {
          type: 'gold',
          gold: 100,
        },
        duration: 60,
        effects: [
          {
            type: ServiceEffectType.STAT_INCREASE,
            target: 'equipment',
            value: 10,
            description: 'Permanently increases equipment effectiveness by 10%',
          },
        ],
        requirements: {
          minTrustLevel: 3,
        },
        cooldown: 2880, // Once per 2 days
      },
      {
        id: 'service_unique_repair',
        name: 'Unique Item Repair',
        description:
          'Repair rare or unique items that normal smiths cannot fix.',
        serviceType: ServiceType.EQUIPMENT_REPAIR,
        cost: {
          type: 'gold',
          gold: 200,
        },
        duration: 90,
        effects: [
          {
            type: ServiceEffectType.REPAIR,
            target: 'equipment',
            value: 100,
            description: 'Repairs unique/legendary items',
          },
          {
            type: ServiceEffectType.BUFF,
            target: 'equipment',
            value: 15,
            description: 'Enhances unique item properties by 15%',
          },
        ],
        requirements: {
          minTrustLevel: 4,
        },
        cooldown: 4320, // Once per 3 days
      },
    ],

    dialogue: {
      greeting: [
        'Hmph. What broke this time?',
        'Machine problems? I can fix it. People problems? Get lost.',
        'Let me see it. And don\'t tell me how to do my job.',
      ],
      serviceOffer: [
        'I repair equipment, weapons, machinery. Anything mechanical.',
        'Broken? I\'ll fix it. Want it better? I can upgrade it.',
        'No job too tough. Well, except dealing with idiots.',
      ],
      serviceDone: [
        'There. Works better than new. Don\'t break it again.',
        'Fixed. That\'ll be all.',
        'Good as new. Maybe better. You\'re welcome.',
      ],
      cannotAfford: [
        'No money? No fix. Simple.',
        'Come back when you can pay.',
        'I don\'t work for free. Machines need parts, parts cost money.',
      ],
      trustLow: [
        'Don\'t know you. Can\'t trust you with my best work.',
        'Prove you\'re serious first.',
      ],
      trustHigh: [
        'Ah. One of the few who appreciates good work. Show me what you need.',
        'For you? I\'ll make it sing.',
      ],
      emergency: [
        'Critical failure? Bring it here. Fast.',
        'Emergency repairs cost double. But I\'ll do it.',
      ],
      departingSoon: [
        'Moving on soon. Other machines need me.',
        'Next stop has a steam engine with my name on it.',
      ],
      busy: [
        'Working. Come back later.',
        'Can\'t you see I\'m in the middle of something?',
      ],
    },

    specialAbilities: [
      'Can upgrade equipment permanently',
      'Repairs unique/legendary items',
      'Weapon maintenance provides temporary buffs',
    ],

    trustBonuses: [
      {
        trustLevel: 2,
        benefits: {
          discountPercentage: 10,
          unlockServices: ['service_weapon_repair'],
        },
      },
      {
        trustLevel: 3,
        benefits: {
          discountPercentage: 15,
          unlockServices: ['service_equipment_upgrade'],
        },
      },
      {
        trustLevel: 4,
        benefits: {
          discountPercentage: 20,
          unlockServices: ['service_unique_repair'],
          priorityService: true,
        },
      },
      {
        trustLevel: 5,
        benefits: {
          discountPercentage: 25,
          canTeachAbilities: true,
        },
      },
    ],
  },

  // 4. WHITE FEATHER (COALITION HEALER)
  {
    id: 'provider_white_feather',
    name: 'White Feather',
    title: 'Coalition Healer',
    profession: ServiceProviderProfession.COALITION_HEALER,
    description:
      'A serene Coalition healer with ancient knowledge of herbs and spiritual healing. Can cure supernatural ailments and addictions.',
    personality: 'Serene, speaks softly, ancient wisdom',
    faction: 'coalition',
    baseTrust: 2,
    trustDecayRate: 0.05,
    maxTrust: 5,

    route: [
      {
        locationId: 'coalition_village',
        locationName: 'Kaiowa Mesa',
        arrivalDay: 0, // Sunday
        arrivalHour: 6,
        departureDay: 2,
        departureHour: 18,
        stayDuration: 60,
        setupLocation: 'healing_lodge',
      },
      {
        locationId: 'sacred_grounds',
        locationName: 'Sacred Grounds',
        arrivalDay: 3, // Wednesday
        arrivalHour: 8,
        departureDay: 4,
        departureHour: 20,
        stayDuration: 36,
        setupLocation: 'spirit_circle',
      },
      {
        locationId: 'neutral_territory',
        locationName: 'Crossroads',
        arrivalDay: 5, // Friday
        arrivalHour: 12,
        departureDay: 6,
        departureHour: 18,
        stayDuration: 30,
        setupLocation: 'trading_post',
      },
    ],

    schedule: [
      {
        dayOfWeek: 0,
        hour: 6,
        endHour: 8,
        activity: NPCActivity.PRAYING,
        locationId: 'healing_lodge',
        locationName: 'Healing Lodge',
        servicesAvailable: false,
      },
      {
        dayOfWeek: 0,
        hour: 8,
        endHour: 18,
        activity: NPCActivity.WORKING,
        locationId: 'healing_lodge',
        locationName: 'Healing Lodge',
        servicesAvailable: true,
      },
    ],

    services: [
      {
        id: 'service_herbal_healing',
        name: 'Herbal Healing',
        description:
          'Traditional herbal remedies that heal wounds and restore vitality.',
        serviceType: ServiceType.MEDICAL_TREATMENT,
        cost: {
          type: 'barter',
          barterItems: [
            {
              itemType: 'herbs',
              quantity: 5,
              alternatives: ['medicinal_plants', 'rare_flowers'],
            },
          ],
        },
        duration: 20,
        effects: [
          {
            type: ServiceEffectType.HEAL,
            target: 'character',
            value: 60,
            description: 'Restores 60 HP',
          },
          {
            type: ServiceEffectType.BUFF,
            target: 'stat',
            value: 10,
            duration: 180,
            statName: 'vitality',
            description: '+10 Vitality for 3 hours',
          },
        ],
      },
      {
        id: 'service_spiritual_cleansing',
        name: 'Spiritual Cleansing',
        description:
          'A spiritual ceremony that cleanses the soul and removes negative effects.',
        serviceType: ServiceType.CURSE_REMOVAL,
        cost: {
          type: 'barter',
          barterItems: [
            {
              itemType: 'sacred_item',
              quantity: 1,
              alternatives: ['spirit_offering', 'blessed_token'],
            },
          ],
        },
        duration: 45,
        effects: [
          {
            type: ServiceEffectType.CURE,
            target: 'character',
            value: 1,
            description: 'Removes curses and negative spiritual effects',
          },
          {
            type: ServiceEffectType.BUFF,
            target: 'stat',
            value: 15,
            duration: 360,
            statName: 'spirit',
            description: '+15 Spirit for 6 hours',
          },
        ],
        requirements: {
          minTrustLevel: 2,
        },
      },
      {
        id: 'service_curse_removal',
        name: 'Curse Removal',
        description:
          'Powerful ritual to remove even the strongest supernatural curses.',
        serviceType: ServiceType.CURSE_REMOVAL,
        cost: {
          type: 'barter',
          barterItems: [
            {
              itemType: 'rare_spirit_offering',
              quantity: 1,
            },
          ],
        },
        duration: 60,
        effects: [
          {
            type: ServiceEffectType.CURE,
            target: 'character',
            value: 1,
            description: 'Removes all curses, hexes, and supernatural afflictions',
          },
        ],
        requirements: {
          minTrustLevel: 3,
        },
        cooldown: 1440,
      },
      {
        id: 'service_addiction_treatment',
        name: 'Addiction Treatment',
        description:
          'Ancient healing techniques to cure addiction to alcohol, drugs, or gambling.',
        serviceType: ServiceType.ADDICTION_TREATMENT,
        cost: {
          type: 'barter',
          barterItems: [
            {
              itemType: 'healing_herbs',
              quantity: 10,
            },
            {
              itemType: 'sacred_water',
              quantity: 1,
            },
          ],
        },
        duration: 90,
        effects: [
          {
            type: ServiceEffectType.CURE,
            target: 'character',
            value: 1,
            description: 'Cures all addictions',
          },
          {
            type: ServiceEffectType.BUFF,
            target: 'stat',
            value: 20,
            duration: 1440,
            statName: 'willpower',
            description: '+20 Willpower for 24 hours',
          },
        ],
        requirements: {
          minTrustLevel: 4,
        },
        cooldown: 2880,
      },
      {
        id: 'service_supernatural_healing',
        name: 'Supernatural Healing',
        description:
          'Heal ailments caused by supernatural forces - wendigo bites, spirit possession, etc.',
        serviceType: ServiceType.SUPERNATURAL_HEALING,
        cost: {
          type: 'barter',
          barterItems: [
            {
              itemType: 'spirit_stone',
              quantity: 1,
            },
            {
              itemType: 'rare_herbs',
              quantity: 5,
            },
          ],
        },
        duration: 120,
        effects: [
          {
            type: ServiceEffectType.CURE,
            target: 'character',
            value: 1,
            description: 'Cures supernatural ailments',
          },
          {
            type: ServiceEffectType.HEAL,
            target: 'character',
            value: 100,
            description: 'Fully restores HP',
          },
        ],
        requirements: {
          minTrustLevel: 5,
        },
        cooldown: 4320,
      },
    ],

    dialogue: {
      greeting: [
        'The spirits welcome you, traveler.',
        'Peace be with you. What troubles your spirit?',
        'I sense your presence. How may I help you walk the good path?',
      ],
      serviceOffer: [
        'I offer healing of body and spirit. The old ways are strong.',
        'Herbs, rituals, spiritual cleansing - the ancient knowledge endures.',
        'What the white man\'s medicine cannot cure, the spirits may heal.',
      ],
      serviceDone: [
        'Walk in balance. The spirits have blessed you.',
        'You are cleansed. Honor the gift you have received.',
        'The healing is complete. May you walk the good path.',
      ],
      cannotAfford: [
        'The spirits require an offering. Bring what you can.',
        'All gifts are sacred. Even the smallest offering has meaning.',
      ],
      trustLow: [
        'Your spirit is not yet open to the ancient ways.',
        'Trust must be earned. Return when you are ready.',
      ],
      trustHigh: [
        'Welcome, trusted friend. The spirits smile upon you.',
        'Your heart is pure. I am honored to help you.',
      ],
      emergency: [
        'The spirits call! I will come.',
        'Quickly, bring them to the healing lodge!',
      ],
      departingSoon: [
        'I must follow the old paths. I will return when the moon is full.',
        'The spirits guide me elsewhere. We will meet again.',
      ],
      busy: [
        'I am in ceremony. Please respect this sacred time.',
        'The spirits require my full attention.',
      ],
    },

    specialAbilities: [
      'Uses barter system instead of gold',
      'Can cure supernatural ailments',
      'Treats addictions',
      'Removes curses and hexes',
    ],

    trustBonuses: [
      {
        trustLevel: 2,
        benefits: {
          unlockServices: ['service_spiritual_cleansing'],
        },
      },
      {
        trustLevel: 3,
        benefits: {
          unlockServices: ['service_curse_removal'],
        },
      },
      {
        trustLevel: 4,
        benefits: {
          unlockServices: ['service_addiction_treatment'],
          priorityService: true,
        },
      },
      {
        trustLevel: 5,
        benefits: {
          unlockServices: ['service_supernatural_healing'],
          exclusiveServices: ['service_vision_quest'],
          canTeachAbilities: true,
        },
      },
    ],
  },

  // 5. FATHER MIGUEL (CATHOLIC PRIEST)
  {
    id: 'provider_father_miguel',
    name: 'Father Miguel',
    title: 'Catholic Priest',
    profession: ServiceProviderProfession.CATHOLIC_PRIEST,
    description:
      'A conflicted priest who serves outlaws but believes in redemption. Can provide sanctuary and partial absolution of bounties.',
    personality: 'Conflicted, compassionate, believes in redemption',
    faction: 'frontera',
    baseTrust: 2,
    trustDecayRate: 0.1,
    maxTrust: 5,

    route: [
      {
        locationId: 'frontera_village_1',
        locationName: 'La Frontera',
        arrivalDay: 0, // Sunday
        arrivalHour: 6,
        departureDay: 3,
        departureHour: 18,
        stayDuration: 84,
        setupLocation: 'village_church',
      },
      {
        locationId: 'outlaw_hideout',
        locationName: 'Hidden Valley',
        arrivalDay: 4, // Thursday
        arrivalHour: 14,
        departureDay: 5,
        departureHour: 20,
        stayDuration: 30,
        setupLocation: 'hideout_chapel',
      },
    ],

    schedule: [
      {
        dayOfWeek: 0,
        hour: 6,
        endHour: 8,
        activity: NPCActivity.PRAYING,
        locationId: 'village_church',
        locationName: 'Village Church',
        servicesAvailable: false,
      },
      {
        dayOfWeek: 0,
        hour: 8,
        endHour: 10,
        activity: NPCActivity.WORKING,
        locationId: 'village_church',
        locationName: 'Village Church',
        servicesAvailable: true,
      },
      {
        dayOfWeek: 0,
        hour: 10,
        endHour: 12,
        activity: NPCActivity.PRAYING,
        locationId: 'village_church',
        locationName: 'Village Church - Sunday Mass',
        servicesAvailable: false,
      },
      {
        dayOfWeek: 0,
        hour: 12,
        endHour: 18,
        activity: NPCActivity.WORKING,
        locationId: 'village_church',
        locationName: 'Village Church',
        servicesAvailable: true,
      },
    ],

    services: [
      {
        id: 'service_mass',
        name: 'Sunday Mass',
        description:
          'Attend Sunday Mass and receive the blessings of the Church.',
        serviceType: ServiceType.BLESSING,
        cost: {
          type: 'gold',
          gold: 0, // Free, but donations appreciated
        },
        duration: 60,
        effects: [
          {
            type: ServiceEffectType.BUFF,
            target: 'stat',
            value: 15,
            duration: 360,
            statName: 'morale',
            description: '+15 Morale for 6 hours',
          },
        ],
        cooldown: 10080, // Once per week
      },
      {
        id: 'service_confession_miguel',
        name: 'Confession',
        description:
          'Confess your sins to Father Miguel and receive absolution.',
        serviceType: ServiceType.CONFESSION,
        cost: {
          type: 'gold',
          gold: 20,
        },
        duration: 15,
        effects: [
          {
            type: ServiceEffectType.REDUCE_BOUNTY,
            target: 'legal',
            value: 15, // 15% reduction
            description: 'Reduces bounty by 15%',
          },
        ],
        cooldown: 1440,
      },
      {
        id: 'service_sanctuary',
        name: 'Sanctuary',
        description:
          'The Church provides temporary sanctuary from the law. Lawmen cannot arrest you while in sanctuary.',
        serviceType: ServiceType.SANCTUARY,
        cost: {
          type: 'gold',
          gold: 50,
        },
        duration: 180, // 3 hours of sanctuary
        effects: [
          {
            type: ServiceEffectType.BUFF,
            target: 'character',
            value: 1,
            duration: 180,
            description: 'Immune to arrest while in church grounds for 3 hours',
          },
        ],
        requirements: {
          minTrustLevel: 3,
        },
        cooldown: 2880,
      },
      {
        id: 'service_absolution',
        name: 'Partial Absolution',
        description:
          'Through the power of the Church, Father Miguel can petition for partial forgiveness of your crimes.',
        serviceType: ServiceType.BOUNTY_REDUCTION,
        cost: {
          type: 'gold',
          gold: 100,
        },
        duration: 30,
        effects: [
          {
            type: ServiceEffectType.REDUCE_BOUNTY,
            target: 'legal',
            value: 25, // 25% reduction
            description: 'Reduces bounty by 25%',
          },
        ],
        requirements: {
          minTrustLevel: 4,
        },
        cooldown: 4320, // Once per 3 days
      },
      {
        id: 'service_last_rites_miguel',
        name: 'Last Rites',
        description: 'Receive the last rites of the Catholic Church.',
        serviceType: ServiceType.LAST_RITES,
        cost: {
          type: 'gold',
          gold: 15,
        },
        duration: 10,
        effects: [
          {
            type: ServiceEffectType.BUFF,
            target: 'character',
            value: 50,
            duration: 120,
            description: 'Reduces next death penalty by 50% for 2 hours',
          },
        ],
        emergencyCost: {
          type: 'gold',
          gold: 30,
        },
      },
    ],

    dialogue: {
      greeting: [
        'Bienvenido, my child. The Church welcomes all who seek redemption.',
        'Even the most wayward soul can find peace here.',
        'Come, sit. Tell me what weighs upon your conscience.',
      ],
      serviceOffer: [
        'I offer Mass, confession, sanctuary, and the sacraments of the Church.',
        'Though you walk a dark path, the light of God still shines for you.',
        'The Church serves all - saint and sinner alike.',
      ],
      serviceDone: [
        'Go in peace, and sin no more.',
        'Your penance is complete. Walk carefully, my child.',
        'May God watch over you on your dangerous path.',
      ],
      cannotAfford: [
        'The Church asks only what you can give.',
        'God values the intention, not the coin.',
        'We will make arrangements. No soul should be turned away.',
      ],
      trustLow: [
        'You wear your sins heavily. When you are ready to truly repent, return.',
        'The Church is patient. We will be here when you seek redemption.',
      ],
      trustHigh: [
        'Ah, my faithful friend. Your journey toward grace continues.',
        'You honor me with your trust. How may I serve you?',
      ],
      emergency: [
        'Someone needs last rites? I will come immediately!',
        'The dying must not face eternity alone. Take me to them!',
      ],
      departingSoon: [
        'I must minister to other flocks. But I shall return.',
        'Other souls need guidance. Go with God until we meet again.',
      ],
      busy: [
        'I am in prayer. Please wait in silence.',
        'The confessional is occupied. Your turn will come.',
      ],
    },

    specialAbilities: [
      'Provides sanctuary from law enforcement',
      'Can reduce bounty through absolution',
      'Serves outlaw communities',
    ],

    trustBonuses: [
      {
        trustLevel: 2,
        benefits: {
          discountPercentage: 10,
        },
      },
      {
        trustLevel: 3,
        benefits: {
          discountPercentage: 15,
          unlockServices: ['service_sanctuary'],
        },
      },
      {
        trustLevel: 4,
        benefits: {
          discountPercentage: 20,
          unlockServices: ['service_absolution'],
          priorityService: true,
        },
      },
      {
        trustLevel: 5,
        benefits: {
          discountPercentage: 30,
          exclusiveServices: ['service_full_pardon'],
        },
      },
    ],
  },

  // 6. MA PERKINS (TRAVELING COOK)
  {
    id: 'provider_ma_perkins',
    name: 'Ma Perkins',
    title: 'Traveling Cook',
    profession: ServiceProviderProfession.TRAVELING_COOK,
    description:
      'A motherly cook who brings hot meals and home cooking to mining camps and ranches. Her meals provide extended buffs.',
    personality: 'Motherly, no-nonsense, feeds everyone',
    faction: 'neutral',
    baseTrust: 3,
    trustDecayRate: 0.15,
    maxTrust: 5,

    route: [
      {
        locationId: 'mining_camp_1',
        locationName: 'Silver Creek Mine',
        arrivalDay: 1, // Monday
        arrivalHour: 5,
        departureDay: 2,
        departureHour: 20,
        stayDuration: 39,
        setupLocation: 'miners_mess',
      },
      {
        locationId: 'mining_camp_2',
        locationName: 'Copper Ridge',
        arrivalDay: 3, // Wednesday
        arrivalHour: 6,
        departureDay: 4,
        departureHour: 19,
        stayDuration: 37,
        setupLocation: 'camp_kitchen',
      },
      {
        locationId: 'ranch_settlement',
        locationName: 'Prairie Ranch',
        arrivalDay: 5, // Friday
        arrivalHour: 10,
        departureDay: 6,
        departureHour: 18,
        stayDuration: 32,
        setupLocation: 'ranch_cookhouse',
      },
    ],

    schedule: [
      {
        dayOfWeek: 1,
        hour: 5,
        endHour: 9,
        activity: NPCActivity.WORKING,
        locationId: 'miners_mess',
        locationName: 'Miners Mess - Breakfast',
        servicesAvailable: true,
      },
      {
        dayOfWeek: 1,
        hour: 9,
        endHour: 12,
        activity: NPCActivity.RESTING,
        locationId: 'miners_mess',
        locationName: 'Miners Mess',
        servicesAvailable: false,
      },
      {
        dayOfWeek: 1,
        hour: 12,
        endHour: 14,
        activity: NPCActivity.WORKING,
        locationId: 'miners_mess',
        locationName: 'Miners Mess - Lunch',
        servicesAvailable: true,
      },
      {
        dayOfWeek: 1,
        hour: 14,
        endHour: 17,
        activity: NPCActivity.RESTING,
        locationId: 'miners_mess',
        locationName: 'Miners Mess',
        servicesAvailable: false,
      },
      {
        dayOfWeek: 1,
        hour: 17,
        endHour: 20,
        activity: NPCActivity.WORKING,
        locationId: 'miners_mess',
        locationName: 'Miners Mess - Dinner',
        servicesAvailable: true,
      },
    ],

    services: [
      {
        id: 'service_hot_meal',
        name: 'Hot Meal',
        description:
          'A hearty hot meal that restores energy and provides a morale boost.',
        serviceType: ServiceType.HOT_MEAL,
        cost: {
          type: 'gold',
          gold: 5,
        },
        duration: 15,
        effects: [
          {
            type: ServiceEffectType.HEAL,
            target: 'character',
            value: 25,
            description: 'Restores 25 HP',
          },
          {
            type: ServiceEffectType.BUFF,
            target: 'stat',
            value: 10,
            duration: 120,
            statName: 'morale',
            description: '+10 Morale for 2 hours',
          },
        ],
      },
      {
        id: 'service_home_cooking',
        name: 'Ma\'s Special Home Cooking',
        description:
          'Ma\'s famous home cooking - like mother used to make. Provides extended comfort buffs.',
        serviceType: ServiceType.SPECIAL_MEAL,
        cost: {
          type: 'gold',
          gold: 15,
        },
        duration: 30,
        effects: [
          {
            type: ServiceEffectType.HEAL,
            target: 'character',
            value: 50,
            description: 'Restores 50 HP',
          },
          {
            type: ServiceEffectType.BUFF,
            target: 'stat',
            value: 15,
            duration: 360,
            statName: 'morale',
            description: '+15 Morale for 6 hours',
          },
          {
            type: ServiceEffectType.BUFF,
            target: 'stat',
            value: 10,
            duration: 360,
            statName: 'stamina',
            description: '+10 Stamina for 6 hours',
          },
        ],
        requirements: {
          minTrustLevel: 2,
        },
        cooldown: 360,
      },
      {
        id: 'service_provisions',
        name: 'Trail Provisions',
        description:
          'Packed food for the trail - jerky, hardtack, and preserves.',
        serviceType: ServiceType.PROVISIONS,
        cost: {
          type: 'gold',
          gold: 20,
        },
        duration: 10,
        effects: [
          {
            type: ServiceEffectType.BUFF,
            target: 'character',
            value: 5,
            duration: 1440,
            description: '+5 HP regeneration per hour for 24 hours',
          },
        ],
      },
      {
        id: 'service_comfort_meal',
        name: 'Comfort Food',
        description:
          'Ma\'s ultimate comfort food - provides the "Comfort" effect that reduces stress and anxiety.',
        serviceType: ServiceType.SPECIAL_MEAL,
        cost: {
          type: 'gold',
          gold: 25,
        },
        duration: 45,
        effects: [
          {
            type: ServiceEffectType.HEAL,
            target: 'character',
            value: 75,
            description: 'Restores 75 HP',
          },
          {
            type: ServiceEffectType.BUFF,
            target: 'stat',
            value: 20,
            duration: 480,
            statName: 'morale',
            description: '+20 Morale for 8 hours',
          },
          {
            type: ServiceEffectType.CURE,
            target: 'character',
            value: 1,
            description: 'Removes stress, anxiety, and minor mental debuffs',
          },
        ],
        requirements: {
          minTrustLevel: 3,
        },
        cooldown: 720,
      },
    ],

    dialogue: {
      greeting: [
        'Well hello there, honey! You look half-starved. Sit down and eat!',
        'Lord have mercy, when did you last have a decent meal? Come here!',
        'There you are! I\'ve been cooking all day. You\'re just in time!',
      ],
      serviceOffer: [
        'I\'ve got hot meals, home cooking, and trail provisions.',
        'Nothing fancy, just good honest food made with love.',
        'You work hard out here. You need proper meals to keep going.',
      ],
      serviceDone: [
        'There now, don\'t you feel better? Come back anytime you\'re hungry.',
        'Eat up! There\'s plenty more where that came from.',
        'You needed that. Now get along before it gets cold!',
      ],
      cannotAfford: [
        'Oh honey, when have I ever let someone go hungry? Sit down.',
        'Pay me when you can. Nobody leaves my kitchen with an empty stomach.',
        'Nonsense! You can owe me. Now eat!',
      ],
      trustLow: [
        'I don\'t know you well yet, but you\'re welcome at my table.',
        'New face around here? Well, everyone\'s got to eat!',
      ],
      trustHigh: [
        'There\'s my favorite! I made your favorite dish today!',
        'Sit down, sit down! I always save the best portions for you!',
        'Like family to me, you are. Eat as much as you want!',
      ],
      emergency: [
        'Someone\'s hurt and hungry? I\'ll pack something right now!',
        'Emergency rations coming right up!',
      ],
      departingSoon: [
        'I\'ll be moving to the next camp soon. Other hungry mouths to feed!',
        'Next stop is the mine up north. They need me there.',
      ],
      busy: [
        'In the middle of cooking! Give me a few minutes!',
        'Hold on, honey, don\'t want to burn the biscuits!',
      ],
    },

    specialAbilities: [
      'Meals provide extended buff durations',
      'Comfort effect removes mental debuffs',
      'Generous with those who cannot pay',
    ],

    trustBonuses: [
      {
        trustLevel: 2,
        benefits: {
          discountPercentage: 15,
          unlockServices: ['service_home_cooking'],
        },
      },
      {
        trustLevel: 3,
        benefits: {
          discountPercentage: 20,
          unlockServices: ['service_comfort_meal'],
        },
      },
      {
        trustLevel: 4,
        benefits: {
          discountPercentage: 30,
          priorityService: true,
        },
      },
      {
        trustLevel: 5,
        benefits: {
          discountPercentage: 40,
          exclusiveServices: ['service_mas_secret_recipe'],
        },
      },
    ],
  },

  // 7. "LUCKY" LOU THE GAMBLER (TRAVELING CARD SHARP)
  {
    id: 'provider_lucky_lou',
    name: '"Lucky" Lou Lancaster',
    title: 'Traveling Gambler',
    profession: ServiceProviderProfession.TRAVELING_GAMBLER,
    description:
      'A charming card sharp who travels between saloons. Morally flexible but surprisingly helpful - can teach gambling skills and sell luck charms.',
    personality: 'Charming, morally flexible, surprisingly helpful',
    faction: 'neutral',
    baseTrust: 1,
    trustDecayRate: 0.25,
    maxTrust: 5,

    route: [
      {
        locationId: 'red_gulch',
        locationName: 'Red Gulch',
        arrivalDay: 1, // Monday
        arrivalHour: 14,
        departureDay: 2,
        departureHour: 3,
        stayDuration: 13,
        setupLocation: 'red_gulch_saloon',
      },
      {
        locationId: 'iron_springs',
        locationName: 'Iron Springs',
        arrivalDay: 3, // Wednesday
        arrivalHour: 16,
        departureDay: 4,
        departureHour: 2,
        stayDuration: 10,
        setupLocation: 'iron_springs_casino',
      },
      {
        locationId: 'devils_den',
        locationName: "Devil's Den",
        arrivalDay: 5, // Friday
        arrivalHour: 18,
        departureDay: 6,
        departureHour: 4,
        stayDuration: 10,
        setupLocation: 'devils_den_gambling_hall',
      },
    ],

    schedule: [
      {
        dayOfWeek: 1,
        hour: 14,
        endHour: 18,
        activity: NPCActivity.SOCIALIZING,
        locationId: 'red_gulch_saloon',
        locationName: 'Red Gulch Saloon',
        servicesAvailable: true,
      },
      {
        dayOfWeek: 1,
        hour: 18,
        endHour: 19,
        activity: NPCActivity.EATING,
        locationId: 'red_gulch_saloon',
        locationName: 'Red Gulch Saloon',
        servicesAvailable: false,
      },
      {
        dayOfWeek: 1,
        hour: 19,
        endHour: 3,
        activity: NPCActivity.GAMBLING,
        locationId: 'red_gulch_saloon',
        locationName: 'Red Gulch Saloon',
        servicesAvailable: true,
      },
    ],

    services: [
      {
        id: 'service_gambling_lesson',
        name: 'Gambling Lesson',
        description:
          'Learn professional gambling techniques. Permanently increases Gambling skill.',
        serviceType: ServiceType.GAMBLING_LESSON,
        cost: {
          type: 'gold',
          gold: 50,
        },
        duration: 60,
        effects: [
          {
            type: ServiceEffectType.TEACH,
            target: 'stat',
            value: 5,
            statName: 'gambling',
            description: 'Permanently increases Gambling skill by 5',
          },
        ],
        requirements: {
          minTrustLevel: 2,
        },
        cooldown: 2880,
      },
      {
        id: 'service_card_game',
        name: 'High-Stakes Card Game',
        description:
          'Play in a private high-stakes game with professional gamblers.',
        serviceType: ServiceType.CARD_GAME,
        cost: {
          type: 'gold',
          gold: 100, // Buy-in
        },
        duration: 120,
        effects: [
          {
            type: ServiceEffectType.UNLOCK,
            target: 'character',
            value: 1,
            description: 'Access to exclusive gambling opportunities',
          },
        ],
        requirements: {
          minTrustLevel: 3,
        },
      },
      {
        id: 'service_luck_charm_basic',
        name: 'Lucky Rabbit\'s Foot',
        description: 'A "lucky" rabbit\'s foot that provides a small luck boost.',
        serviceType: ServiceType.LUCK_CHARM,
        cost: {
          type: 'gold',
          gold: 25,
        },
        duration: 5,
        effects: [
          {
            type: ServiceEffectType.BUFF,
            target: 'stat',
            value: 5,
            duration: 360,
            statName: 'luck',
            description: '+5 Luck for 6 hours',
          },
        ],
      },
      {
        id: 'service_luck_charm_advanced',
        name: 'Lucky Horseshoe',
        description:
          'An enchanted horseshoe that brings significant luck. Perfect for gambling.',
        serviceType: ServiceType.LUCK_CHARM,
        cost: {
          type: 'gold',
          gold: 75,
        },
        duration: 10,
        effects: [
          {
            type: ServiceEffectType.BUFF,
            target: 'stat',
            value: 15,
            duration: 720,
            statName: 'luck',
            description: '+15 Luck for 12 hours',
          },
          {
            type: ServiceEffectType.BUFF,
            target: 'stat',
            value: 10,
            duration: 720,
            statName: 'gambling',
            description: '+10 Gambling for 12 hours',
          },
        ],
        requirements: {
          minTrustLevel: 3,
        },
        cooldown: 720,
      },
      {
        id: 'service_inside_tip',
        name: 'Inside Information',
        description:
          'Lou shares inside information about upcoming gambling opportunities and marks.',
        serviceType: ServiceType.GAMBLING_LESSON,  // Teaching about gambling opportunities
        cost: {
          type: 'gold',
          gold: 150,
        },
        duration: 15,
        effects: [
          {
            type: ServiceEffectType.UNLOCK,
            target: 'character',
            value: 1,
            description: 'Unlocks special gambling quests and opportunities',
          },
        ],
        requirements: {
          minTrustLevel: 4,
        },
        cooldown: 4320,
      },
    ],

    dialogue: {
      greeting: [
        'Well, well! Lady Luck brings us together again!',
        'Pull up a chair, friend. Feeling lucky today?',
        'Ah, just the person I wanted to see! Care for a game?',
      ],
      serviceOffer: [
        'I can teach you the finer points of gambling, sell you luck charms, or deal you into a game.',
        'Lessons, charms, games - whatever your pleasure, I can arrange it.',
        'Looking to improve your odds? I\'ve got just what you need.',
      ],
      serviceDone: [
        'There you go! May fortune smile upon you.',
        'Remember what I taught you. Play smart, not hard.',
        'Pleasure doing business! Come find me if you need anything else.',
      ],
      cannotAfford: [
        'Little short, eh? Tell you what - I\'ll spot you the difference if you win your next game.',
        'Come back when your pockets are heavier, friend.',
      ],
      trustLow: [
        'Don\'t know you well enough for my best services yet, friend.',
        'Earn my trust and I\'ll show you the real opportunities.',
      ],
      trustHigh: [
        'My favorite player! I\'ve been saving something special for you.',
        'For you? Anything. You\'ve proven yourself a true professional.',
      ],
      emergency: [
        'Emergency? I\'m in the middle of a hand! ...alright, what is it?',
        'This better be worth folding a full house.',
      ],
      departingSoon: [
        'The cards are calling me to greener pastures. Moving on tomorrow.',
        'Big game in the next town. Gotta keep moving.',
      ],
      busy: [
        'Can\'t talk - holding a straight flush here!',
        'One moment - let me finish this hand.',
      ],
    },

    specialAbilities: [
      'Teaches gambling skill permanently',
      'Sells luck-enhancing charms',
      'Provides access to exclusive games',
      'Shares inside information',
    ],

    trustBonuses: [
      {
        trustLevel: 2,
        benefits: {
          discountPercentage: 10,
          unlockServices: ['service_gambling_lesson'],
        },
      },
      {
        trustLevel: 3,
        benefits: {
          discountPercentage: 15,
          unlockServices: ['service_card_game', 'service_luck_charm_advanced'],
        },
      },
      {
        trustLevel: 4,
        benefits: {
          discountPercentage: 20,
          unlockServices: ['service_inside_tip'],
          priorityService: true,
        },
      },
      {
        trustLevel: 5,
        benefits: {
          discountPercentage: 25,
          exclusiveServices: ['service_underground_game'],
          canTeachAbilities: true,
        },
      },
    ],
  },

  // 8. JUDGE ROY BEAN (CIRCUIT JUDGE)
  {
    id: 'provider_judge_bean',
    name: 'Judge Roy Bean',
    title: 'Circuit Judge - "Law West of the Pecos"',
    profession: ServiceProviderProfession.CIRCUIT_JUDGE,
    description:
      'An unconventional circuit judge who brings frontier justice to lawless towns. Known for creative interpretations of the law.',
    personality: 'Unconventional, "law west of the Pecos", practical',
    faction: 'settler',
    baseTrust: 2,
    trustDecayRate: 0.1,
    maxTrust: 5,

    route: [
      {
        locationId: 'red_gulch',
        locationName: 'Red Gulch',
        arrivalDay: 2, // Tuesday
        arrivalHour: 10,
        departureDay: 3,
        departureHour: 16,
        stayDuration: 30,
        setupLocation: 'red_gulch_courthouse',
      },
      {
        locationId: 'copper_trail',
        locationName: 'Copper Trail',
        arrivalDay: 4, // Thursday
        arrivalHour: 12,
        departureDay: 5,
        departureHour: 18,
        stayDuration: 30,
        setupLocation: 'copper_trail_courthouse',
      },
      {
        locationId: 'frontier_outpost',
        locationName: 'Frontier Outpost',
        arrivalDay: 6, // Saturday
        arrivalHour: 9,
        departureDay: 0,
        departureHour: 15,
        stayDuration: 30,
        setupLocation: 'outpost_courthouse',
      },
    ],

    schedule: [
      {
        dayOfWeek: 2,
        hour: 10,
        endHour: 12,
        activity: NPCActivity.WORKING,
        locationId: 'red_gulch_courthouse',
        locationName: 'Red Gulch Courthouse',
        servicesAvailable: true,
      },
      {
        dayOfWeek: 2,
        hour: 12,
        endHour: 13,
        activity: NPCActivity.EATING,
        locationId: 'red_gulch_saloon',
        locationName: 'Red Gulch Saloon',
        servicesAvailable: false,
      },
      {
        dayOfWeek: 2,
        hour: 13,
        endHour: 16,
        activity: NPCActivity.WORKING,
        locationId: 'red_gulch_courthouse',
        locationName: 'Red Gulch Courthouse',
        servicesAvailable: true,
      },
    ],

    services: [
      {
        id: 'service_trial',
        name: 'Fair Trial',
        description:
          'Stand trial before Judge Bean for your crimes. Results may vary based on circumstances.',
        serviceType: ServiceType.TRIAL,
        cost: {
          type: 'gold',
          gold: 50,
        },
        duration: 60,
        effects: [
          {
            type: ServiceEffectType.REDUCE_BOUNTY,
            target: 'legal',
            value: 30, // 30% reduction on successful trial
            description: 'May reduce bounty by up to 30% depending on trial outcome',
          },
        ],
        requirements: {
          maxBounty: 1000, // Won't try very high bounties
        },
        cooldown: 4320,
      },
      {
        id: 'service_legal_ruling',
        name: 'Legal Ruling',
        description:
          'Get a legal ruling on a dispute or claim. The Judge\'s word is law.',
        serviceType: ServiceType.LEGAL_RULING,
        cost: {
          type: 'gold',
          gold: 75,
        },
        duration: 30,
        effects: [
          {
            type: ServiceEffectType.UNLOCK,
            target: 'character',
            value: 1,
            description: 'Resolves legal disputes in your favor',
          },
        ],
        requirements: {
          minTrustLevel: 2,
        },
      },
      {
        id: 'service_marriage_bean',
        name: 'Quick Marriage',
        description:
          'Judge Bean can marry you and your partner in a quick ceremony.',
        serviceType: ServiceType.MARRIAGE,
        cost: {
          type: 'gold',
          gold: 25,
        },
        duration: 15,
        effects: [
          {
            type: ServiceEffectType.UNLOCK,
            target: 'character',
            value: 1,
            description: 'Legally married (Judge Bean style)',
          },
        ],
      },
      {
        id: 'service_divorce',
        name: 'Quick Divorce',
        description: 'Judge Bean can dissolve a marriage just as quickly as he made it.',
        serviceType: ServiceType.LEGAL_RULING,
        cost: {
          type: 'gold',
          gold: 30,
        },
        duration: 10,
        effects: [
          {
            type: ServiceEffectType.UNLOCK,
            target: 'character',
            value: 1,
            description: 'Dissolves marriage',
          },
        ],
      },
      {
        id: 'service_bounty_reduction',
        name: 'Bounty Negotiation',
        description:
          'The Judge can negotiate with authorities to reduce your bounty through legal channels.',
        serviceType: ServiceType.BOUNTY_REDUCTION,
        cost: {
          type: 'gold',
          gold: 200,
        },
        duration: 45,
        effects: [
          {
            type: ServiceEffectType.REDUCE_BOUNTY,
            target: 'legal',
            value: 40, // 40% reduction
            description: 'Reduces bounty by 40% through legal negotiation',
          },
        ],
        requirements: {
          minTrustLevel: 3,
        },
        cooldown: 4320,
      },
      {
        id: 'service_claim_legitimization',
        name: 'Claim Legitimization',
        description:
          'Legitimize a mining claim, land deed, or other disputed property.',
        serviceType: ServiceType.CLAIM_LEGITIMIZATION,
        cost: {
          type: 'gold',
          gold: 150,
        },
        duration: 60,
        effects: [
          {
            type: ServiceEffectType.UNLOCK,
            target: 'character',
            value: 1,
            description: 'Legitimizes disputed claims and property',
          },
        ],
        requirements: {
          minTrustLevel: 4,
        },
      },
    ],

    dialogue: {
      greeting: [
        'Order in the court! State your business.',
        'Judge Roy Bean presiding. What brings you before the law?',
        'Well now, another case for the Law West of the Pecos!',
      ],
      serviceOffer: [
        'I can hold trials, make legal rulings, perform marriages and divorces, and legitimize claims.',
        'The law is what I say it is out here. How can I help you?',
        'Need something legal sorted out? I\'m the only law for a hundred miles.',
      ],
      serviceDone: [
        'Court is adjourned! My decision is final.',
        'That\'s settled then. Next case!',
        'The law has spoken. Move along now.',
      ],
      cannotAfford: [
        'Justice ain\'t free. Come back when you can pay the court fees.',
        'The law requires payment, friend.',
      ],
      trustLow: [
        'Don\'t know you. Can\'t give you my best rulings yet.',
        'Prove yourself trustworthy and we\'ll see what the law can do for you.',
      ],
      trustHigh: [
        'Ah! A law-abiding citizen I can trust. How can I help you today?',
        'For you? I\'ll make sure justice is properly served.',
      ],
      emergency: [
        'Emergency trial? Court is now in session!',
        'Bring them before the bench immediately!',
      ],
      departingSoon: [
        'Moving to the next circuit. Other towns need the law too.',
        'I\'ll be back next week. Try to stay out of trouble until then.',
      ],
      busy: [
        'Court is in session! Wait your turn!',
        'I\'m deliberating. Come back in a bit.',
      ],
    },

    specialAbilities: [
      'Can reduce sentences through trials',
      'Legitimizes disputed claims',
      'Unique quest opportunities',
      'Performs marriages and divorces',
    ],

    trustBonuses: [
      {
        trustLevel: 2,
        benefits: {
          discountPercentage: 10,
          unlockServices: ['service_legal_ruling'],
        },
      },
      {
        trustLevel: 3,
        benefits: {
          discountPercentage: 15,
          unlockServices: ['service_bounty_reduction'],
        },
      },
      {
        trustLevel: 4,
        benefits: {
          discountPercentage: 20,
          unlockServices: ['service_claim_legitimization'],
          priorityService: true,
        },
      },
      {
        trustLevel: 5,
        benefits: {
          discountPercentage: 30,
          exclusiveServices: ['service_pardon'],
        },
      },
    ],
  },

  // 9. SARAH "STITCH" NEEDLEMAN (TRAVELING SEAMSTRESS)
  {
    id: 'provider_stitch',
    name: 'Sarah "Stitch" Needleman',
    title: 'Traveling Seamstress',
    profession: ServiceProviderProfession.TRAVELING_SEAMSTRESS,
    description:
      'An observant, quiet seamstress who knows everyone\'s measurements by sight. Expert at clothing repair and creating disguises.',
    personality: 'Observant, quiet, knows everyone\'s measurements',
    faction: 'neutral',
    baseTrust: 2,
    trustDecayRate: 0.1,
    maxTrust: 5,

    route: [
      {
        locationId: 'red_gulch',
        locationName: 'Red Gulch',
        arrivalDay: 1, // Monday
        arrivalHour: 9,
        departureDay: 2,
        departureHour: 17,
        stayDuration: 32,
        setupLocation: 'red_gulch_tailor_shop',
      },
      {
        locationId: 'iron_springs',
        locationName: 'Iron Springs',
        arrivalDay: 3, // Wednesday
        arrivalHour: 10,
        departureDay: 4,
        departureHour: 18,
        stayDuration: 32,
        setupLocation: 'iron_springs_general_store',
      },
      {
        locationId: 'ravens_perch',
        locationName: "Raven's Perch",
        arrivalDay: 5, // Friday
        arrivalHour: 11,
        departureDay: 6,
        departureHour: 19,
        stayDuration: 32,
        setupLocation: 'ravens_perch_trading_post',
      },
    ],

    schedule: [
      {
        dayOfWeek: 1,
        hour: 9,
        endHour: 12,
        activity: NPCActivity.CRAFTING,
        locationId: 'red_gulch_tailor_shop',
        locationName: 'Red Gulch Tailor Shop',
        servicesAvailable: true,
      },
      {
        dayOfWeek: 1,
        hour: 12,
        endHour: 13,
        activity: NPCActivity.EATING,
        locationId: 'red_gulch_restaurant',
        locationName: 'Restaurant',
        servicesAvailable: false,
      },
      {
        dayOfWeek: 1,
        hour: 13,
        endHour: 17,
        activity: NPCActivity.CRAFTING,
        locationId: 'red_gulch_tailor_shop',
        locationName: 'Red Gulch Tailor Shop',
        servicesAvailable: true,
      },
    ],

    services: [
      {
        id: 'service_clothing_repair',
        name: 'Clothing Repair',
        description: 'Expert repair of damaged clothing and armor.',
        serviceType: ServiceType.CLOTHING_REPAIR,
        cost: {
          type: 'gold',
          gold: 10,
        },
        duration: 20,
        effects: [
          {
            type: ServiceEffectType.REPAIR,
            target: 'equipment',
            value: 100,
            description: 'Fully repairs clothing/armor',
          },
        ],
      },
      {
        id: 'service_custom_outfit',
        name: 'Custom Outfit',
        description:
          'Create a custom outfit tailored to your exact specifications.',
        serviceType: ServiceType.CUSTOM_OUTFIT,
        cost: {
          type: 'gold',
          gold: 75,
        },
        duration: 120,
        effects: [
          {
            type: ServiceEffectType.UNLOCK,
            target: 'character',
            value: 1,
            description: 'Creates custom outfit with chosen appearance',
          },
        ],
        requirements: {
          minTrustLevel: 2,
        },
        cooldown: 1440,
      },
      {
        id: 'service_disguise_basic',
        name: 'Simple Disguise',
        description:
          'Create a simple disguise that makes you harder to recognize.',
        serviceType: ServiceType.DISGUISE_CREATION,
        cost: {
          type: 'gold',
          gold: 50,
        },
        duration: 60,
        effects: [
          {
            type: ServiceEffectType.BUFF,
            target: 'stat',
            value: 20,
            duration: 360,
            statName: 'stealth',
            description: '+20 Stealth for 6 hours',
          },
          {
            type: ServiceEffectType.REDUCE_BOUNTY,
            target: 'legal',
            value: 50, // 50% less likely to be recognized
            duration: 360,
            description: 'Reduces recognition chance by 50% for 6 hours',
          },
        ],
        requirements: {
          minTrustLevel: 2,
        },
        cooldown: 720,
      },
      {
        id: 'service_disguise_advanced',
        name: 'Master Disguise',
        description:
          'Create an elaborate disguise that can fool even close acquaintances.',
        serviceType: ServiceType.DISGUISE_CREATION,
        cost: {
          type: 'gold',
          gold: 150,
        },
        duration: 180,
        effects: [
          {
            type: ServiceEffectType.BUFF,
            target: 'stat',
            value: 40,
            duration: 720,
            statName: 'stealth',
            description: '+40 Stealth for 12 hours',
          },
          {
            type: ServiceEffectType.REDUCE_BOUNTY,
            target: 'legal',
            value: 90, // 90% less likely to be recognized
            duration: 720,
            description: 'Reduces recognition chance by 90% for 12 hours',
          },
          {
            type: ServiceEffectType.UNLOCK,
            target: 'character',
            value: 1,
            description: 'Can assume alternate identity',
          },
        ],
        requirements: {
          minTrustLevel: 4,
        },
        cooldown: 2880,
      },
      {
        id: 'service_valuable_repair',
        name: 'Valuable Clothing Repair',
        description:
          'Expert restoration of rare or valuable clothing items.',
        serviceType: ServiceType.CLOTHING_REPAIR,
        cost: {
          type: 'gold',
          gold: 100,
        },
        duration: 90,
        effects: [
          {
            type: ServiceEffectType.REPAIR,
            target: 'equipment',
            value: 100,
            description: 'Repairs rare/legendary clothing',
          },
          {
            type: ServiceEffectType.BUFF,
            target: 'equipment',
            value: 10,
            description: 'Enhances clothing properties by 10%',
          },
        ],
        requirements: {
          minTrustLevel: 3,
        },
      },
    ],

    dialogue: {
      greeting: [
        'Ah, I thought I might see you today. Let me get my measuring tape.',
        'Welcome. I remember your measurements from last time.',
        'Good timing. I just finished another project.',
      ],
      serviceOffer: [
        'I repair clothing, create custom outfits, and... craft disguises.',
        'Whatever you need sewn, stitched, or tailored, I can make it.',
        'Repairs, custom work, or something more... discreet?',
      ],
      serviceDone: [
        'Perfect fit, as always. Come back if you need alterations.',
        'There. You won\'t find better work anywhere.',
        'All finished. I never forget a measurement.',
      ],
      cannotAfford: [
        'Quality work requires quality payment, I\'m afraid.',
        'Perhaps something simpler? Or come back when you have the funds.',
      ],
      trustLow: [
        'I don\'t know you well enough for my... specialized services.',
        'Build trust with me first. I need to know I can rely on discretion.',
      ],
      trustHigh: [
        'Ah, my most trusted client. I have something special for you.',
        'For you? My finest work. What do you need?',
      ],
      emergency: [
        'Clothing emergency? That\'s a first. Show me.',
        'Emergency repairs? I can work quickly.',
      ],
      departingSoon: [
        'I leave tomorrow. Other towns need a seamstress too.',
        'Finishing up here. Next stop is Iron Springs.',
      ],
      busy: [
        'In the middle of delicate work. One moment.',
        'Let me finish this seam first.',
      ],
    },

    specialAbilities: [
      'Creates disguises that reduce recognition',
      'Repairs valuable clothing',
      'Never forgets measurements',
      'Can create alternate identities',
    ],

    trustBonuses: [
      {
        trustLevel: 2,
        benefits: {
          discountPercentage: 10,
          unlockServices: ['service_custom_outfit', 'service_disguise_basic'],
        },
      },
      {
        trustLevel: 3,
        benefits: {
          discountPercentage: 15,
          unlockServices: ['service_valuable_repair'],
        },
      },
      {
        trustLevel: 4,
        benefits: {
          discountPercentage: 20,
          unlockServices: ['service_disguise_advanced'],
          priorityService: true,
        },
      },
      {
        trustLevel: 5,
        benefits: {
          discountPercentage: 25,
          exclusiveServices: ['service_identity_papers'],
        },
      },
    ],
  },

  // 10. "BONES" MCCOY (TRAVELING VETERINARIAN)
  {
    id: 'provider_bones',
    name: '"Bones" McCoy',
    title: 'Traveling Veterinarian & Horse Doctor',
    profession: ServiceProviderProfession.TRAVELING_VETERINARIAN,
    description:
      'A grumpy veterinarian who prefers animals to people. Expert at healing companion animals and improving horse stats.',
    personality: 'Prefers animals to people, grumpy but skilled',
    faction: 'neutral',
    baseTrust: 1,
    trustDecayRate: 0.15,
    maxTrust: 5,

    route: [
      {
        locationId: 'ranch_settlement',
        locationName: 'Prairie Ranch',
        arrivalDay: 0, // Sunday
        arrivalHour: 8,
        departureDay: 2,
        departureHour: 18,
        stayDuration: 58,
        setupLocation: 'ranch_stable',
      },
      {
        locationId: 'red_gulch',
        locationName: 'Red Gulch',
        arrivalDay: 3, // Wednesday
        arrivalHour: 10,
        departureDay: 4,
        departureHour: 16,
        stayDuration: 30,
        setupLocation: 'red_gulch_stables',
      },
      {
        locationId: 'frontier_outpost',
        locationName: 'Frontier Outpost',
        arrivalDay: 5, // Friday
        arrivalHour: 12,
        departureDay: 6,
        departureHour: 20,
        stayDuration: 32,
        setupLocation: 'outpost_stables',
      },
    ],

    schedule: [
      {
        dayOfWeek: 0,
        hour: 8,
        endHour: 12,
        activity: NPCActivity.WORKING,
        locationId: 'ranch_stable',
        locationName: 'Prairie Ranch Stable',
        servicesAvailable: true,
      },
      {
        dayOfWeek: 0,
        hour: 12,
        endHour: 13,
        activity: NPCActivity.EATING,
        locationId: 'ranch_cookhouse',
        locationName: 'Ranch Cookhouse',
        servicesAvailable: false,
      },
      {
        dayOfWeek: 0,
        hour: 13,
        endHour: 18,
        activity: NPCActivity.WORKING,
        locationId: 'ranch_stable',
        locationName: 'Prairie Ranch Stable',
        servicesAvailable: true,
      },
    ],

    services: [
      {
        id: 'service_animal_checkup',
        name: 'Animal Checkup',
        description: 'General health checkup for your companion animal or horse.',
        serviceType: ServiceType.ANIMAL_HEALING,
        cost: {
          type: 'gold',
          gold: 15,
        },
        duration: 20,
        effects: [
          {
            type: ServiceEffectType.HEAL,
            target: 'companion',
            value: 50,
            description: 'Restores 50 HP to companion/horse',
          },
        ],
      },
      {
        id: 'service_animal_healing',
        name: 'Animal Healing',
        description:
          'Comprehensive healing for injured or sick animals.',
        serviceType: ServiceType.ANIMAL_HEALING,
        cost: {
          type: 'gold',
          gold: 40,
        },
        duration: 45,
        effects: [
          {
            type: ServiceEffectType.HEAL,
            target: 'companion',
            value: 100,
            description: 'Fully heals companion/horse',
          },
          {
            type: ServiceEffectType.CURE,
            target: 'companion',
            value: 1,
            description: 'Removes all diseases and ailments',
          },
        ],
        requirements: {
          minTrustLevel: 2,
        },
      },
      {
        id: 'service_horse_care',
        name: 'Premium Horse Care',
        description:
          'Expert care that improves horse health and performance.',
        serviceType: ServiceType.HORSE_CARE,
        cost: {
          type: 'gold',
          gold: 60,
        },
        duration: 60,
        effects: [
          {
            type: ServiceEffectType.HEAL,
            target: 'companion',
            value: 100,
            description: 'Fully heals horse',
          },
          {
            type: ServiceEffectType.BUFF,
            target: 'companion',
            value: 10,
            duration: 720,
            statName: 'speed',
            description: '+10% Horse Speed for 12 hours',
          },
          {
            type: ServiceEffectType.BUFF,
            target: 'companion',
            value: 10,
            duration: 720,
            statName: 'stamina',
            description: '+10% Horse Stamina for 12 hours',
          },
        ],
        requirements: {
          minTrustLevel: 2,
        },
        cooldown: 360,
      },
      {
        id: 'service_companion_treatment',
        name: 'Companion Treatment',
        description:
          'Specialized treatment for companion animals (dogs, wolves, etc.).',
        serviceType: ServiceType.COMPANION_TREATMENT,
        cost: {
          type: 'gold',
          gold: 50,
        },
        duration: 45,
        effects: [
          {
            type: ServiceEffectType.HEAL,
            target: 'companion',
            value: 100,
            description: 'Fully heals companion',
          },
          {
            type: ServiceEffectType.BUFF,
            target: 'companion',
            value: 15,
            duration: 480,
            statName: 'loyalty',
            description: '+15% Companion Loyalty for 8 hours',
          },
        ],
        requirements: {
          minTrustLevel: 2,
        },
        cooldown: 720,
      },
      {
        id: 'service_horse_upgrade',
        name: 'Horse Training & Conditioning',
        description:
          'Intensive training that permanently improves horse stats.',
        serviceType: ServiceType.HORSE_UPGRADE,
        cost: {
          type: 'gold',
          gold: 200,
        },
        duration: 240, // 4 hours
        effects: [
          {
            type: ServiceEffectType.STAT_INCREASE,
            target: 'companion',
            value: 5,
            statName: 'speed',
            description: 'Permanently increases Horse Speed by 5%',
          },
          {
            type: ServiceEffectType.STAT_INCREASE,
            target: 'companion',
            value: 5,
            statName: 'stamina',
            description: 'Permanently increases Horse Stamina by 5%',
          },
          {
            type: ServiceEffectType.STAT_INCREASE,
            target: 'companion',
            value: 5,
            statName: 'health',
            description: 'Permanently increases Horse Health by 5%',
          },
        ],
        requirements: {
          minTrustLevel: 3,
        },
        cooldown: 4320, // Once per 3 days
      },
      {
        id: 'service_emergency_vet',
        name: 'Emergency Veterinary Care',
        description:
          'Emergency treatment for critically injured animals.',
        serviceType: ServiceType.ANIMAL_HEALING,
        cost: {
          type: 'gold',
          gold: 100,
        },
        duration: 90,
        effects: [
          {
            type: ServiceEffectType.HEAL,
            target: 'companion',
            value: 100,
            description: 'Saves critically injured animal',
          },
          {
            type: ServiceEffectType.CURE,
            target: 'companion',
            value: 1,
            description: 'Removes all injuries and conditions',
          },
        ],
        requirements: {
          minTrustLevel: 4,
        },
        emergencyCost: {
          type: 'gold',
          gold: 100, // Same cost - he cares about animals
        },
      },
    ],

    dialogue: {
      greeting: [
        'Horse sick? I can help. People sick? Find a people doctor.',
        'What\'s wrong with your animal? Don\'t waste my time with nonsense.',
        'Let me see the horse. And don\'t tell me how to do my job.',
      ],
      serviceOffer: [
        'I treat horses and companion animals. That\'s it.',
        'Animal healing, horse care, training. Best in the territory.',
        'Sick horse? Injured dog? I can fix it.',
      ],
      serviceDone: [
        'There. Animal\'s fine now. Treat it better next time.',
        'Fixed. Don\'t let it happen again.',
        'Good as new. Now get out of my way - got other animals to see.',
      ],
      cannotAfford: [
        'No money? Then your animal stays sick. Simple.',
        'Come back when you can pay.',
      ],
      trustLow: [
        'Don\'t know you. Don\'t trust you with my advanced techniques.',
        'Earn my trust by treating your animals right.',
      ],
      trustHigh: [
        'You take good care of your animals. Respect that. What do you need?',
        'For you? I\'ll give it my best work.',
      ],
      emergency: [
        'Animal emergency? Bring it here NOW!',
        'Critically injured? I\'m on it. Move!',
      ],
      departingSoon: [
        'Heading to the next ranch tomorrow. Animals need me everywhere.',
        'Moving on soon. Other horses to tend.',
      ],
      busy: [
        'Can\'t you see I\'m working? Wait!',
        'In the middle of surgery. Come back.',
      ],
    },

    specialAbilities: [
      'Heals companion animals',
      'Improves horse stats permanently',
      'Emergency care always available',
      'Loves animals more than people',
    ],

    trustBonuses: [
      {
        trustLevel: 2,
        benefits: {
          discountPercentage: 10,
          unlockServices: [
            'service_animal_healing',
            'service_horse_care',
            'service_companion_treatment',
          ],
        },
      },
      {
        trustLevel: 3,
        benefits: {
          discountPercentage: 15,
          unlockServices: ['service_horse_upgrade'],
        },
      },
      {
        trustLevel: 4,
        benefits: {
          discountPercentage: 20,
          unlockServices: ['service_emergency_vet'],
          priorityService: true,
        },
      },
      {
        trustLevel: 5,
        benefits: {
          discountPercentage: 25,
          exclusiveServices: ['service_legendary_horse_breeding'],
          canTeachAbilities: true,
        },
      },
    ],
  },
];

/**
 * Get service provider by ID
 */
export function getServiceProviderById(
  id: string
): WanderingServiceProvider | undefined {
  return WANDERING_SERVICE_PROVIDERS.find((provider) => provider.id === id);
}

/**
 * Get service providers by profession
 */
export function getServiceProvidersByProfession(
  profession: ServiceProviderProfession
): WanderingServiceProvider[] {
  return WANDERING_SERVICE_PROVIDERS.filter(
    (provider) => provider.profession === profession
  );
}

/**
 * Get service providers by faction
 */
export function getServiceProvidersByFaction(
  faction: string
): WanderingServiceProvider[] {
  return WANDERING_SERVICE_PROVIDERS.filter(
    (provider) => provider.faction === faction
  );
}

/**
 * Get service providers currently at a location
 * Based on day of week and hour
 */
export function getServiceProvidersAtLocation(
  locationId: string,
  dayOfWeek: number,
  hour: number
): WanderingServiceProvider[] {
  return WANDERING_SERVICE_PROVIDERS.filter((provider) => {
    // Check if provider is on route to this location
    const routeStop = provider.route.find(
      (stop) => stop.locationId === locationId
    );
    if (!routeStop) return false;

    // Check if current time is within stay duration
    const isAtLocation =
      (dayOfWeek > routeStop.arrivalDay ||
        (dayOfWeek === routeStop.arrivalDay && hour >= routeStop.arrivalHour)) &&
      (dayOfWeek < routeStop.departureDay ||
        (dayOfWeek === routeStop.departureDay &&
          hour <= routeStop.departureHour));

    return isAtLocation;
  });
}

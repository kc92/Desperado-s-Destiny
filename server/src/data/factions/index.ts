/**
 * Factions Data Index
 * Phase 19.2: Extended faction system with sub-factions and NPC factions
 *
 * Main Playable Factions:
 * - Settler Alliance (American settlers, corporations)
 * - Nahi Coalition (5 native tribes with internal politics)
 * - Frontera (Mexican border communities)
 *
 * NPC Factions:
 * - Railroad Tycoons (antagonist faction)
 * - Pinkerton Agency (mercenary faction)
 */

export { RAILROAD_TYCOONS, RailroadTycoonsService } from './railroadTycoons';
export { NAHI_TRIBES, NahiTribesService } from './nahiTribes';
export type { NahiTribe, TribeRelationship } from './nahiTribes';

/**
 * Headline Generator Service
 * Phase 12, Wave 12.1 - Desperados Destiny
 *
 * Generates dynamic article headlines and content based on world events
 */

import {
  ArticleGenerationParams,
  NewsArticle,
  NewsBias,
  WorldEventType,
} from '@desperados/shared';
import { getTemplatesForEvent } from '../data/headlineTemplates';
import { getNewspaperById, getRandomByline } from '../data/newspapers';
import { ObjectId } from 'mongodb';

interface TemplateVars {
  [key: string]: string | number;
}

export class HeadlineGeneratorService {
  /**
   * Generate article from event parameters
   */
  generateArticle(params: ArticleGenerationParams): Partial<NewsArticle> {
    const newspaper = getNewspaperById(params.newspaperId);
    if (!newspaper) {
      throw new Error(`Unknown newspaper: ${params.newspaperId}`);
    }

    const template = getTemplatesForEvent(params.eventType);
    if (!template) {
      throw new Error(`No template for event type: ${params.eventType}`);
    }

    const headline = this.generateHeadline(template, newspaper.biases, params.details);
    const content = this.generateContent(params);
    const byline = getRandomByline(params.newspaperId);

    return {
      newspaperId: params.newspaperId,
      headline,
      byline,
      content,
      category: params.category,
      publishDate: params.timestamp,
      eventType: params.eventType,
      involvedCharacters: params.involvedCharacters.map((c) => c.id),
      involvedFactions: params.involvedCharacters
        .map((c) => c.faction)
        .filter((f): f is any => f !== undefined),
      location: params.location,
      readBy: [],
      reactionsCount: 0,
      featured: false,
      reputationEffects: new Map(),
    };
  }

  /**
   * Generate headline from template and biases
   */
  private generateHeadline(
    template: any,
    biases: NewsBias[],
    details: Record<string, any>
  ): string {
    let templates = template.templates;

    // Apply bias modifiers
    for (const bias of biases) {
      const modifier = template.biasModifiers.find((m: any) => m.bias === bias);
      if (modifier && modifier.alternativeTemplates.length > 0) {
        templates = modifier.alternativeTemplates;
        break; // Use first matching bias
      }
    }

    // Pick random template
    const templateStr = templates[Math.floor(Math.random() * templates.length)];

    // Replace variables
    return this.replaceTemplateVars(templateStr, details);
  }

  /**
   * Replace template variables with actual values
   */
  private replaceTemplateVars(template: string, vars: TemplateVars): string {
    let result = template;

    for (const [key, value] of Object.entries(vars)) {
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
      result = result.replace(regex, String(value));
    }

    return result;
  }

  /**
   * Generate article content based on event type
   */
  private generateContent(params: ArticleGenerationParams): string {
    const newspaper = getNewspaperById(params.newspaperId);
    if (!newspaper) {
      return '';
    }

    // Generate content based on event type
    switch (params.eventType) {
      case 'bank-robbery':
        return this.generateBankRobberyContent(params, newspaper.biases);

      case 'train-heist':
        return this.generateTrainHeistContent(params, newspaper.biases);

      case 'murder':
        return this.generateMurderContent(params, newspaper.biases);

      case 'legendary-kill':
        return this.generateLegendaryKillContent(params, newspaper.biases);

      case 'duel':
        return this.generateDuelContent(params, newspaper.biases);

      case 'territory-change':
        return this.generateTerritoryChangeContent(params, newspaper.biases);

      case 'arrest':
        return this.generateArrestContent(params, newspaper.biases);

      case 'escape':
        return this.generateEscapeContent(params, newspaper.biases);

      case 'gang-war':
        return this.generateGangWarContent(params, newspaper.biases);

      case 'bounty-claimed':
        return this.generateBountyClaimedContent(params, newspaper.biases);

      case 'supernatural-sighting':
        return this.generateSupernaturalContent(params, newspaper.biases);

      case 'achievement-unlock':
        return this.generateAchievementContent(params, newspaper.biases);

      case 'election':
        return this.generateElectionContent(params, newspaper.biases);

      case 'business-opening':
        return this.generateBusinessContent(params, newspaper.biases);

      case 'market-change':
        return this.generateMarketContent(params, newspaper.biases);

      default:
        return this.generateGenericContent(params, newspaper.biases);
    }
  }

  private generateBankRobberyContent(
    params: ArticleGenerationParams,
    biases: NewsBias[]
  ): string {
    const { location, details } = params;
    const amount = details.amount || '$5,000';
    const isPro = biases.includes('pro-law');
    const isSensational = biases.includes('sensationalist');

    let content = `${location} - `;

    if (isSensational) {
      content += `In a scene straight from a dime novel, daring bandits struck the ${location} Bank in broad daylight, making off with ${amount} in cold hard cash! Eyewitnesses report GUNFIRE and CHAOS as the desperados stormed the establishment. `;
    } else if (isPro) {
      content += `Criminal elements struck the ${location} Bank earlier today, stealing approximately ${amount} before fleeing. Local law enforcement has mounted an aggressive pursuit. `;
    } else {
      content += `The ${location} Bank was robbed today, with thieves escaping with approximately ${amount}. `;
    }

    if (params.involvedCharacters.length > 0) {
      const names = params.involvedCharacters.map((c) => c.name).join(', ');
      content += `Authorities have identified ${names} as suspects in the robbery. `;
    } else {
      content += 'The perpetrators remain at large. ';
    }

    if (isPro) {
      content += `Marshal has vowed swift justice and urges citizens to report any information. The safety of our community depends on bringing these criminals to account.`;
    } else if (isSensational) {
      content += `Could this be the work of the legendary GHOST GANG? Sources say the robbers vanished without a trace! More on this SHOCKING story as it develops!`;
    } else {
      content += `The investigation continues. Citizens are advised to remain vigilant.`;
    }

    return content;
  }

  private generateTrainHeistContent(
    params: ArticleGenerationParams,
    biases: NewsBias[]
  ): string {
    const { details } = params;
    const trainName = details.trainName || 'Western Express';
    const amount = details.amount || '$10,000';
    const isSensational = biases.includes('sensationalist');

    let content = `The ${trainName} was stopped and robbed yesterday, with bandits making off with ${amount} in cash and valuables. `;

    if (isSensational) {
      content += `Passengers report TERRIFYING scenes as masked gunmen boarded the train at gunpoint! `;
    } else {
      content += `Passengers were held at gunpoint while the robbers looted the train's safe. `;
    }

    if (params.involvedCharacters.length > 0) {
      content += `Witnesses have identified ${params.involvedCharacters[0].name} among the robbers. `;
    }

    content += `Railroad officials are cooperating with authorities. `;

    if (biases.includes('pro-military')) {
      content += `The Army has dispatched cavalry units to pursue the outlaws and ensure railroad security.`;
    } else {
      content += `The investigation is ongoing.`;
    }

    return content;
  }

  private generateMurderContent(params: ArticleGenerationParams, biases: NewsBias[]): string {
    const { location, details } = params;
    const victim = details.victim || 'a local citizen';
    const isSensational = biases.includes('sensationalist');

    let content = `${location} - A body was discovered this morning, identified as ${victim}. `;

    if (isSensational) {
      content += `The GRUESOME scene has shocked the entire territory! Sources claim the killing bears the marks of DARK FORCES! `;
    } else {
      content += `Authorities are treating the death as suspicious. `;
    }

    if (params.involvedCharacters.length > 0) {
      content += `${params.involvedCharacters[0].name} is wanted for questioning. `;
    } else {
      content += `No suspects have been identified at this time. `;
    }

    if (biases.includes('pro-law')) {
      content += `The Marshal's office is pursuing all leads and will bring the perpetrator to justice. Citizens can rest assured that law and order will prevail.`;
    } else {
      content += `The investigation continues. Anyone with information is urged to contact authorities.`;
    }

    return content;
  }

  private generateLegendaryKillContent(
    params: ArticleGenerationParams,
    biases: NewsBias[]
  ): string {
    const { details, involvedCharacters } = params;
    const creature = details.creature || 'legendary beast';
    const hunter = involvedCharacters[0]?.name || 'an unknown hunter';
    const isSensational = biases.includes('sensationalist');

    let content = `In a feat that will be told around campfires for generations, ${hunter} has slain the legendary ${creature}. `;

    if (isSensational) {
      content += `WITNESSES report an EPIC battle lasting hours, with the beast displaying SUPERNATURAL strength! Some claim to have seen the ${creature} breathe FIRE before its demise! `;
    } else {
      content += `The creature had terrorized the area for months, with several sightings and near-encounters reported. `;
    }

    content += `${hunter} tracked the beast to its lair and emerged victorious after a fierce confrontation. `;

    const reward = details.reward as string | undefined;
    if (reward) {
      content += `A reward of ${reward} has been paid to ${hunter} for ending the threat. `;
    }

    content += `Local residents are celebrating the end of this menace, and ${hunter}'s name will surely become legend.`;

    return content;
  }

  private generateDuelContent(params: ArticleGenerationParams, biases: NewsBias[]): string {
    const { location, details } = params;
    const winner = details.winner || 'the survivor';
    const loser = details.loser || 'their opponent';
    const isSensational = biases.includes('sensationalist');

    let content = `${location} - A duel took place today between ${winner} and ${loser}. `;

    if (isSensational) {
      content += `The LIGHTNING-FAST showdown lasted mere SECONDS, with ${winner} proving to be the FASTEST GUN this territory has ever seen! Onlookers were LEFT SPEECHLESS! `;
    } else {
      content += `The confrontation ended with ${winner} victorious. `;
    }

    if (details.fatal) {
      content += `${loser} was killed in the exchange. `;
    } else {
      content += `${loser} was wounded but survived. `;
    }

    if (biases.includes('pro-law')) {
      content += `While dueling remains technically legal, the Marshal's office reminds citizens that civilized dispute resolution is preferable to gunplay.`;
    } else {
      content += `The duel was conducted according to frontier tradition.`;
    }

    return content;
  }

  private generateTerritoryChangeContent(
    params: ArticleGenerationParams,
    biases: NewsBias[]
  ): string {
    const { details } = params;
    const territory = details.territory || 'the territory';
    const faction = details.faction || 'new forces';
    const previousFaction = details.previousFaction || 'previous holders';

    let content = `${territory} has fallen under the control of ${faction} after ${previousFaction} was driven out. `;

    if (biases.includes('pro-law')) {
      content += `This illegal seizure of territory will not stand. Government forces are preparing a response. `;
    } else if (biases.includes('pro-frontera') && faction.includes('Frontera')) {
      content += `The people of ${territory} welcomed their liberators with open arms. `;
    } else if (biases.includes('sensationalist')) {
      content += `BLOODY BATTLE sees ${territory} CONQUERED! Witnesses report CARNAGE! `;
    } else {
      content += `The transfer of power occurred after several days of conflict. `;
    }

    content += `Residents of ${territory} are adjusting to new leadership. The long-term implications remain to be seen.`;

    return content;
  }

  private generateArrestContent(params: ArticleGenerationParams, biases: NewsBias[]): string {
    const { details } = params;
    const criminal = details.criminal || 'a wanted outlaw';
    const crime = details.crime || 'various crimes';

    let content = `${criminal} was arrested today by law enforcement, ending a manhunt for ${crime}. `;

    if (biases.includes('pro-law')) {
      content += `This arrest demonstrates the inevitable triumph of justice over lawlessness. The Marshal's tireless efforts have made our territory safer. `;
    } else if (biases.includes('pro-frontera')) {
      content += `Many question whether ${criminal} received fair treatment during the arrest. `;
    } else {
      content += `The arrest was made without incident. `;
    }

    content += `${criminal} is being held pending trial. `;

    if (details.bounty) {
      content += `A bounty of ${details.bounty} was paid to the arresting party.`;
    }

    return content;
  }

  private generateEscapeContent(params: ArticleGenerationParams, biases: NewsBias[]): string {
    const { location, details } = params;
    const criminal = details.criminal || 'a prisoner';
    const isSensational = biases.includes('sensationalist');

    let content = `${criminal} escaped from ${location} last night in a daring breakout. `;

    if (isSensational) {
      content += `SHOCKING reports suggest the escape was IMPOSSIBLE! Some claim ${criminal} had SUPERNATURAL help! `;
    } else {
      content += `Details of the escape are still being investigated. `;
    }

    if (biases.includes('pro-law')) {
      content += `This embarrassing failure raises serious questions about jail security. The Marshal has launched an investigation into how this happened. `;
    }

    content += `${criminal} is considered extremely dangerous. A manhunt is underway, and citizens are warned not to approach the fugitive.`;

    return content;
  }

  private generateGangWarContent(params: ArticleGenerationParams, biases: NewsBias[]): string {
    const { location, details } = params;
    const gang1 = details.gang1 || 'one gang';
    const gang2 = details.gang2 || 'another gang';

    let content = `Violence erupted in ${location} as ${gang1} and ${gang2} engaged in open warfare over territory. `;

    if (biases.includes('sensationalist')) {
      content += `GUNFIRE echoed through the streets! Witnesses report DOZENS of shots fired! The town ran RED with blood! `;
    } else {
      content += `Multiple casualties were reported from both sides. `;
    }

    if (biases.includes('pro-law')) {
      content += `This lawlessness cannot continue. The Marshal has vowed to arrest all participants and restore order. Law-abiding citizens demand protection from these criminal elements.`;
    } else {
      content += `The conflict appears to be over control of local criminal operations. Authorities are investigating.`;
    }

    return content;
  }

  private generateBountyClaimedContent(
    params: ArticleGenerationParams,
    biases: NewsBias[]
  ): string {
    const { details } = params;
    const hunter = details.hunter || 'a bounty hunter';
    const criminal = details.criminal || 'a wanted outlaw';
    const bounty = details.bounty || '$500';

    let content = `${hunter} successfully claimed the bounty on ${criminal}, bringing the outlaw to justice and collecting ${bounty}. `;

    if (biases.includes('pro-law')) {
      content += `This is exactly the kind of cooperation between law enforcement and private citizens that makes our territory safer. ${hunter} should be commended for this public service. `;
    }

    content += `${criminal} had been wanted for numerous crimes. The successful capture demonstrates that outlaws cannot escape justice forever.`;

    return content;
  }

  private generateSupernaturalContent(
    params: ArticleGenerationParams,
    biases: NewsBias[]
  ): string {
    const { location, details } = params;
    const creature = details.creature || 'a strange entity';
    const isSensational = biases.includes('sensationalist');

    let content = `Multiple witnesses in ${location} report sightings of ${creature}. `;

    if (isSensational) {
      content += `TERRIFIED locals describe the creature as OTHERWORLDLY! Could this be proof of the SUPERNATURAL? We spoke to witnesses who were LEFT SHAKING! "I've never seen anything like it," said one traumatized observer. `;
    } else if (biases.includes('pro-law')) {
      content += `While authorities take all reports seriously, officials urge calm and rational thinking. Mass hysteria and tall tales are common on the frontier. `;
    } else {
      content += `The sightings have caused considerable unease among residents. `;
    }

    content += `Whether ${creature} is real or merely frontier legend remains to be seen.`;

    return content;
  }

  private generateAchievementContent(
    params: ArticleGenerationParams,
    biases: NewsBias[]
  ): string {
    const { involvedCharacters, details } = params;
    const player = involvedCharacters[0]?.name || 'a frontier legend';
    const achievement = details.achievement || 'a remarkable achievement';

    let content = `${player} has achieved what few thought possible, earning the title of "${achievement}". `;

    if (biases.includes('sensationalist')) {
      content += `This INCREDIBLE feat places ${player} among the GREATEST legends of the frontier! `;
    }

    content += `The accomplishment required ${details.description || 'exceptional skill and determination'}. `;
    content += `${player}'s name will be remembered in frontier history.`;

    return content;
  }

  private generateElectionContent(params: ArticleGenerationParams, biases: NewsBias[]): string {
    const { location, details } = params;
    const winner = details.winner || 'the winner';
    const position = details.position || 'mayor';

    let content = `${location} has elected ${winner} as the new ${position} in yesterday's voting. `;

    if (biases.includes('pro-military') && details.militaryBacked) {
      content += `${winner}'s platform of law and order resonated with voters seeking stability. `;
    } else if (biases.includes('pro-frontera') && details.reformCandidate) {
      content += `${winner}'s promises of reform and representation for all citizens won the day. `;
    }

    content += `The new ${position} takes office next week and has promised to ${details.promise || 'serve all citizens faithfully'}.`;

    return content;
  }

  private generateBusinessContent(params: ArticleGenerationParams, biases: NewsBias[]): string {
    const { location, details } = params;
    const business = details.business || 'a new establishment';
    const owner = details.owner || 'an entrepreneur';

    let content = `${business} opened its doors in ${location} today, with owner ${owner} welcoming the first customers. `;

    if (biases.includes('pro-law')) {
      content += `This new business represents the civilizing influence spreading across the frontier. Legitimate commerce is the foundation of prosperity. `;
    }

    content += `The establishment offers ${details.services || 'various goods and services'} to the community.`;

    return content;
  }

  private generateMarketContent(params: ArticleGenerationParams, biases: NewsBias[]): string {
    const { details } = params;
    const commodity = details.commodity || 'goods';
    const change = details.change || 'fluctuated';
    const price = details.price || 'new levels';

    let content = `Market prices for ${commodity} have ${change}, with current rates at ${price}. `;

    content += `Traders attribute the change to ${details.reason || 'various market factors'}. `;
    content += `Merchants and consumers should adjust their plans accordingly.`;

    return content;
  }

  private generateGenericContent(params: ArticleGenerationParams, biases: NewsBias[]): string {
    const { location, details, eventType } = params;

    let content = `${location} - An event of significance occurred today. `;

    if (details.description) {
      content += details.description + ' ';
    }

    if (params.involvedCharacters.length > 0) {
      const names = params.involvedCharacters.map((c) => c.name).join(', ');
      content += `${names} was involved. `;
    }

    content += `Further details are being investigated.`;

    return content;
  }
}

export const headlineGeneratorService = new HeadlineGeneratorService();

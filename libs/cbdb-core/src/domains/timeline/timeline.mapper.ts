/**
 * Timeline Mapper
 * Transforms database records into timeline models
 */

import { TimelineEvent, RelatedEntity, TimelineLocation } from './models';
import { isNoDatePlaceholder, hasValidTimelineDates } from './utils/date-validator';

export const timelineMapper = {
  /**
   * Create a timeline event from birth/death data
   */
  createBirthDeathEvent(person: any, type: 'birth' | 'death'): TimelineEvent | null {
    const yearField = type === 'birth' ? 'c_birthyear' : 'c_deathyear';
    const year = person[yearField];

    if (!year) return null;

    return new TimelineEvent({
      personId: person.c_personid,
      year: year,
      eventType: type,
      title: type === 'birth' ? 'Birth' : 'Death',
      description: `${type === 'birth' ? 'Born' : 'Died'} in year ${year}`
    });
  },

  /**
   * Create timeline event from office appointment
   */
  createOfficeEvent(office: any): TimelineEvent | null {
    // After mapping by cbdbMapper, fields are camelCase without c_ prefix
    // Use actual year, NOT reign year (NH year is relative to reign period, not absolute)
    const startYear = office.firstYear;
    const endYear = office.lastYear;

    // Use reusable date validator
    if (isNoDatePlaceholder(startYear) && isNoDatePlaceholder(endYear)) {
      return null;
    }

    // Check if dates are within valid historical range
    const tempEvent = { startYear, endYear };
    if (!hasValidTimelineDates(tempEvent)) {
      return null;
    }

    // Get office name from the officeInfo relation (OfficeWithFullRelations)
    const officeName = office.officeInfo?.nameChn ||
                      office.officeInfo?.nameEng ||
                      `Office ${office.officeId}`;

    // Build a detailed description
    let description = '';
    if (office.officeInfo) {
      description = `${office.officeInfo.nameChn || office.officeInfo.nameEng}`;
      if (office.officeInfo.category || office.officeInfo.categoryChn) {
        description += ` (${office.officeInfo.categoryChn || office.officeInfo.category})`;
      }
      if (startYear || endYear) {
        description += ` - ${startYear || '?'} to ${endYear || '?'}`;
      }
      if (office.appointmentInfo?.typeDescChn || office.appointmentInfo?.typeDesc) {
        description += `. Appointment type: ${office.appointmentInfo.typeDescChn || office.appointmentInfo.typeDesc}`;
      }
    } else {
      description = `Served from ${startYear || '?'} to ${endYear || '?'}`;
    }

    return new TimelineEvent({
      personId: office.personId,
      startYear: startYear,
      endYear: endYear,
      eventType: 'office',
      title: officeName,
      description: description,
      location: office.address ? new TimelineLocation({
        name: office.address.nameChn || office.address.name,
        coordinates: office.address.xCoord && office.address.yCoord ? {
          x: office.address.xCoord,
          y: office.address.yCoord
        } : undefined
      }) : undefined
    });
  },

  /**
   * Create timeline event from kinship relation
   */
  createKinshipEvent(kinship: any): TimelineEvent | null {
    // Check if kinship has temporal data
    if (!kinship.c_year && !kinship.c_firstyear) return null;

    const year = kinship.c_year || kinship.c_firstyear;
    const kinType = kinship.c_kinship_desc || kinship.c_kincode_chn || 'Kinship';

    return new TimelineEvent({
      personId: kinship.c_personid,
      year: year,
      eventType: 'kinship',
      title: kinType,
      relatedEntities: kinship.c_kin_id ? [
        new RelatedEntity({
          type: 'person',
          id: kinship.c_kin_id,
          name: kinship.c_kin_name || `Person ${kinship.c_kin_id}`,
          relationDescription: kinType
        })
      ] : undefined
    });
  },

  /**
   * Create timeline event from association relation
   */
  createAssociationEvent(association: any): TimelineEvent | null {
    // After mapping by cbdbMapper, Association model has typed fields
    const startYear = association.firstYear;
    const endYear = association.lastYear;

    // Use reusable date validator
    if (isNoDatePlaceholder(startYear) && isNoDatePlaceholder(endYear)) {
      return null;
    }

    // Check if dates are within valid historical range
    const tempEvent = { startYear, endYear };
    if (!hasValidTimelineDates(tempEvent)) {
      return null;
    }

    // Get association type description from the Model (includes trivial joins)
    const assocType = association.assocTypeDescriptionChn ||
                     association.assocTypeDescription ||
                     `Association type ${association.assocCode}`;

    // Get associated person name
    const assocPersonName = association.assocPersonNameChn ||
                           association.assocPersonName ||
                           association.assocPerson?.nameChn ||
                           association.assocPerson?.name ||
                           `Person ${association.assocId}`;

    // Pure data mapping - pass raw data
    // Store person name in metadata for service/UI layer to format
    return new TimelineEvent({
      personId: association.personId,
      startYear: startYear !== -1 ? startYear : undefined,
      endYear: endYear && endYear !== -1 ? endYear : undefined,
      eventType: 'association',
      title: assocType,  // Raw association type (may contain Y)
      description: association.notes || undefined,
      relatedEntities: association.assocId && association.assocId !== 0 ? [
        new RelatedEntity({
          type: 'person',
          id: association.assocId,
          name: assocPersonName,
          relationDescription: assocType
        })
      ] : undefined,
      // Store metadata for rendering layer
      metadata: {
        assocPersonName: assocPersonName,
        textTitle: association.textTitle !== '[n/a]' ? association.textTitle : undefined
      }
    });
  },

  /**
   * Create timeline event from entry/examination data
   */
  createEntryEvent(entry: any): TimelineEvent | null {
    // After mapping by cbdbMapper, fields are camelCase without c_ prefix
    // Use actual year, NOT reign year (NH year is relative to reign period, not absolute)
    const year = entry.year;

    // Use reusable date validator
    if (isNoDatePlaceholder(year)) return null;

    const tempEvent = { year };
    if (!hasValidTimelineDates(tempEvent)) {
      return null;
    }

    const entryName = entry.entryCode?.entryDesc || entry.entryCode?.entryDescChn || 'Examination';

    return new TimelineEvent({
      personId: entry.personId,
      year: year,
      eventType: 'entry',
      title: `${entryName}`,
      description: entry.examRank ? `Rank: ${entry.examRank}` : undefined,
      location: entry.entryAddrId ? new TimelineLocation({
        name: `Location ${entry.entryAddrId}`
      }) : undefined,
      relatedEntities: entry.kinId && entry.kinId !== 0 ? [
        new RelatedEntity({
          type: 'person',
          id: entry.kinId,
          name: `Person ${entry.kinId}`,
          relationDescription: 'Related to entry'
        })
      ] : undefined
    });
  },

  /**
   * Create timeline event from text composition/authorship
   */
  createTextEvent(text: any): TimelineEvent | null {
    // After mapping by cbdbMapper, fields are camelCase without c_ prefix
    // Use actual year, NOT reign year (NH year is relative to reign period, not absolute)
    const year = text.year;

    // Use reusable date validator
    if (isNoDatePlaceholder(year)) return null;

    const tempEvent = { year };
    if (!hasValidTimelineDates(tempEvent)) {
      return null;
    }

    const roleMap: { [key: number]: string } = {
      1: 'Authored',
      2: 'Edited',
      3: 'Compiled',
      4: 'Translated'
    };

    const role = roleMap[text.roleId] || 'Related to';
    const textTitle = text.textCode?.title || text.textCode?.titleChn || `Text ${text.textid}`;

    return new TimelineEvent({
      personId: text.personId,
      year: year,
      eventType: 'text',
      title: `${role} "${textTitle}"`,
      description: text.notes || undefined
    });
  },

  /**
   * Create timeline event from address/residence data
   */
  createAddressEvent(address: any): TimelineEvent | null {
    // After mapping by cbdbMapper, fields are camelCase without c_ prefix
    // Use actual year, NOT reign year (NH year is relative to reign period, not absolute)
    const startYear = address.firstyear;
    const endYear = address.lastyear;

    if (!startYear && !endYear) return null;

    const addrTypeMap: { [key: number]: string } = {
      1: 'Birth Place',
      2: 'Death Place',
      3: 'Ancestral Home',
      4: 'Residence',
      5: 'Temporary Residence',
      6: 'Administrative Post',
      7: 'Travel',
      8: 'Burial Place'
    };

    const addrType = addrTypeMap[address.addrType] || 'Location';
    const locationName = address.addressCode?.nameChn || address.addressCode?.name || `Place ${address.addrId}`;

    return new TimelineEvent({
      personId: address.personId,
      startYear: startYear,
      endYear: endYear,
      eventType: 'address',
      title: `${addrType}: ${locationName}`,
      description: address.natal === 1 ? 'Natal address' : undefined,
      location: new TimelineLocation({
        name: locationName,
        coordinates: address.addressCode?.xCoord && address.addressCode?.yCoord ? {
          x: address.addressCode.xCoord,
          y: address.addressCode.yCoord
        } : undefined
      })
    });
  },

  /**
   * Create enhanced birth event from PersonBirthDeathView data
   */
  createEnhancedBirthEvent(birthDeathData: any): TimelineEvent | null {
    // PersonBirthDeathView returns camelCase field names
    if (!birthDeathData.birthYear) return null;

    const details: string[] = [];

    // Add dynasty and reign information
    if (birthDeathData.birthNianHaoChn) {
      details.push(`Reign: ${birthDeathData.birthNianHaoChn}`);
    }
    if (birthDeathData.birthNhYear) {
      details.push(`Reign Year: ${birthDeathData.birthNhYear}`);
    }
    if (birthDeathData.birthMonth && birthDeathData.birthDay) {
      details.push(`Date: Month ${birthDeathData.birthMonth}, Day ${birthDeathData.birthDay}`);
    }

    return new TimelineEvent({
      personId: birthDeathData.personId,
      year: birthDeathData.birthYear,
      eventType: 'birth',
      title: 'Birth',
      description: details.length > 0 ? details.join('; ') : `Born in year ${birthDeathData.birthYear}`
    });
  },

  /**
   * Create enhanced death event from PersonBirthDeathView data
   */
  createEnhancedDeathEvent(birthDeathData: any): TimelineEvent | null {
    // PersonBirthDeathView returns camelCase field names
    if (!birthDeathData.deathYear) return null;

    const details: string[] = [];

    // Add dynasty and reign information
    if (birthDeathData.deathNianHaoChn) {
      details.push(`Reign: ${birthDeathData.deathNianHaoChn}`);
    }
    if (birthDeathData.deathNhYear) {
      details.push(`Reign Year: ${birthDeathData.deathNhYear}`);
    }
    if (birthDeathData.deathMonth && birthDeathData.deathDay) {
      details.push(`Date: Month ${birthDeathData.deathMonth}, Day ${birthDeathData.deathDay}`);
    }
    if (birthDeathData.deathAge) {
      details.push(`Age: ${birthDeathData.deathAge}`);
    }

    return new TimelineEvent({
      personId: birthDeathData.personId,
      year: birthDeathData.deathYear,
      eventType: 'death',
      title: 'Death',
      description: details.length > 0 ? details.join('; ') : `Died in year ${birthDeathData.deathYear}`
    });
  }
};
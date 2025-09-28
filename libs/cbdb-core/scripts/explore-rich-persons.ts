#!/usr/bin/env tsx

/**
 * CBDB Rich Persons Explorer
 *
 * This script explores well-documented historical figures in the CBDB database,
 * demonstrating the comprehensive biographical data available including:
 * - Basic biographical information
 * - Alternative names and titles
 * - Geographic associations
 * - Kinship relationships
 * - Official positions and appointments
 * - Text associations and literary works
 * - Social institutions
 * - Events and activities
 */

import Database from 'better-sqlite3';
import { resolve, join } from 'path';

// Use environment variable or relative path
const DB_PATH = process.env.CBDB_PATH || join(__dirname, '../../../cbdb_sql_db/latest.db');

interface Person {
  c_personid: number;
  c_name_chn: string;
  c_name: string;
  c_surname_chn: string;
  c_mingzi_chn: string;
  c_birthyear: number;
  c_deathyear: number;
  c_index_year: number;
  c_dy: number;
  c_female: number;
}

interface DataCounts {
  altnames: number;
  addresses: number;
  kinships: number;
  offices: number;
  texts: number;
  institutions: number;
  associations: number;
  events: number;
  statuses: number;
}

class CBDBExplorer {
  private db: Database.Database;

  constructor() {
    this.db = new Database(DB_PATH, { readonly: true });
    console.log('✅ Connected to CBDB database');
  }

  /**
   * Find persons with the richest data by counting related records
   */
  findRichlyDocumentedPersons(): Person[] {
    const sql = `
      WITH person_data_counts AS (
        SELECT
          bm.c_personid,
          bm.c_name_chn,
          bm.c_name,
          bm.c_surname_chn,
          bm.c_mingzi_chn,
          bm.c_birthyear,
          bm.c_deathyear,
          bm.c_index_year,
          bm.c_dy,
          bm.c_female,
          -- Count related data
          COALESCE((SELECT COUNT(*) FROM ALTNAME_DATA WHERE c_personid = bm.c_personid), 0) as alt_count,
          COALESCE((SELECT COUNT(*) FROM BIOG_ADDR_DATA WHERE c_personid = bm.c_personid), 0) as addr_count,
          COALESCE((SELECT COUNT(*) FROM KIN_DATA WHERE c_personid = bm.c_personid), 0) as kin_count,
          COALESCE((SELECT COUNT(*) FROM POSTED_TO_OFFICE_DATA WHERE c_personid = bm.c_personid), 0) as office_count,
          COALESCE((SELECT COUNT(*) FROM BIOG_TEXT_DATA WHERE c_personid = bm.c_personid), 0) as text_count,
          COALESCE((SELECT COUNT(*) FROM BIOG_INST_DATA WHERE c_personid = bm.c_personid), 0) as inst_count,
          COALESCE((SELECT COUNT(*) FROM ASSOC_DATA WHERE c_personid = bm.c_personid), 0) as assoc_count,
          COALESCE((SELECT COUNT(*) FROM EVENTS_DATA WHERE c_personid = bm.c_personid), 0) as event_count,
          COALESCE((SELECT COUNT(*) FROM STATUS_DATA WHERE c_personid = bm.c_personid), 0) as status_count
        FROM BIOG_MAIN bm
        WHERE bm.c_name_chn IS NOT NULL
          AND bm.c_name IS NOT NULL
          AND bm.c_birthyear > 0
          AND bm.c_deathyear > 0
      )
      SELECT *,
        (alt_count + addr_count + kin_count + office_count + text_count +
         inst_count + assoc_count + event_count + status_count) as total_data_count
      FROM person_data_counts
      WHERE total_data_count >= 20  -- Filter for well-documented persons
      ORDER BY total_data_count DESC
      LIMIT 20
    `;

    return this.db.prepare(sql).all() as (Person & { total_data_count: number })[];
  }

  /**
   * Get data counts for a specific person
   */
  getDataCounts(personId: number): DataCounts {
    const queries = {
      altnames: 'SELECT COUNT(*) as count FROM ALTNAME_DATA WHERE c_personid = ?',
      addresses: 'SELECT COUNT(*) as count FROM BIOG_ADDR_DATA WHERE c_personid = ?',
      kinships: 'SELECT COUNT(*) as count FROM KIN_DATA WHERE c_personid = ?',
      offices: 'SELECT COUNT(*) as count FROM POSTED_TO_OFFICE_DATA WHERE c_personid = ?',
      texts: 'SELECT COUNT(*) as count FROM BIOG_TEXT_DATA WHERE c_personid = ?',
      institutions: 'SELECT COUNT(*) as count FROM BIOG_INST_DATA WHERE c_personid = ?',
      associations: 'SELECT COUNT(*) as count FROM ASSOC_DATA WHERE c_personid = ?',
      events: 'SELECT COUNT(*) as count FROM EVENTS_DATA WHERE c_personid = ?',
      statuses: 'SELECT COUNT(*) as count FROM STATUS_DATA WHERE c_personid = ?'
    };

    const counts: any = {};
    for (const [key, query] of Object.entries(queries)) {
      const result = this.db.prepare(query).get(personId) as { count: number };
      counts[key] = result.count;
    }
    return counts as DataCounts;
  }

  /**
   * Get alternative names for a person
   */
  getAlternativeNames(personId: number) {
    const sql = `
      SELECT
        ad.c_alt_name,
        ad.c_alt_name_chn,
        ac.c_name_type_desc,
        ac.c_name_type_desc_chn,
        ad.c_sequence
      FROM ALTNAME_DATA ad
      LEFT JOIN ALTNAME_CODES ac ON ad.c_alt_name_type_code = ac.c_name_type_code
      WHERE ad.c_personid = ?
      ORDER BY ad.c_sequence, ad.c_alt_name_type_code
    `;
    return this.db.prepare(sql).all(personId);
  }

  /**
   * Get address associations for a person
   */
  getAddresses(personId: number) {
    const sql = `
      SELECT
        bad.c_addr_id,
        addr.c_name as addr_name,
        addr.c_name_chn as addr_name_chn,
        bac.c_addr_desc,
        bac.c_addr_desc_chn,
        bad.c_firstyear,
        bad.c_lastyear
      FROM BIOG_ADDR_DATA bad
      LEFT JOIN ADDRESSES addr ON bad.c_addr_id = addr.c_addr_id
      LEFT JOIN BIOG_ADDR_CODES bac ON bad.c_addr_type = bac.c_addr_type
      WHERE bad.c_personid = ?
      ORDER BY bad.c_firstyear, bad.c_sequence
    `;
    return this.db.prepare(sql).all(personId);
  }

  /**
   * Get kinship relationships for a person
   */
  getKinshipRelationships(personId: number) {
    const sql = `
      SELECT
        kd.c_kin_id,
        kin_person.c_name_chn as kin_name_chn,
        kin_person.c_name as kin_name,
        kc.c_kinrel_chn,
        kc.c_kinrel,
        kc.c_kinrel_alt
      FROM KIN_DATA kd
      LEFT JOIN BIOG_MAIN kin_person ON kd.c_kin_id = kin_person.c_personid
      LEFT JOIN KINSHIP_CODES kc ON kd.c_kin_code = kc.c_kincode
      WHERE kd.c_personid = ?
      ORDER BY kd.c_kin_code
    `;
    return this.db.prepare(sql).all(personId);
  }

  /**
   * Get official positions for a person
   */
  getOfficialPositions(personId: number) {
    const sql = `
      SELECT
        ptod.c_office_id,
        oc.c_office_chn,
        oc.c_office_pinyin,
        oc.c_office_trans,
        ptod.c_firstyear,
        ptod.c_lastyear,
        d.c_dynasty_chn,
        addr.c_name_chn as office_location,
        ac.c_appt_desc_chn as appointment_type
      FROM POSTED_TO_OFFICE_DATA ptod
      LEFT JOIN OFFICE_CODES oc ON ptod.c_office_id = oc.c_office_id
      LEFT JOIN DYNASTIES d ON ptod.c_dy = d.c_dy
      LEFT JOIN POSTED_TO_ADDR_DATA ptad ON ptod.c_posting_id = ptad.c_posting_id
      LEFT JOIN ADDRESSES addr ON ptad.c_addr_id = addr.c_addr_id
      LEFT JOIN APPOINTMENT_CODES ac ON ptod.c_appt_code = ac.c_appt_code
      WHERE ptod.c_personid = ?
      ORDER BY ptod.c_firstyear, ptod.c_sequence
    `;
    return this.db.prepare(sql).all(personId);
  }

  /**
   * Get text associations for a person
   */
  getTextAssociations(personId: number) {
    const sql = `
      SELECT
        btd.c_textid,
        tc.c_title_chn,
        tc.c_title,
        tc.c_title_trans,
        trc.c_role_desc,
        trc.c_role_desc_chn,
        btd.c_year
      FROM BIOG_TEXT_DATA btd
      LEFT JOIN TEXT_CODES tc ON btd.c_textid = tc.c_textid
      LEFT JOIN TEXT_ROLE_CODES trc ON btd.c_role_id = trc.c_role_id
      WHERE btd.c_personid = ?
      ORDER BY btd.c_year, btd.c_textid
    `;
    return this.db.prepare(sql).all(personId);
  }

  /**
   * Get social institution associations
   */
  getSocialInstitutions(personId: number) {
    const sql = `
      SELECT
        bid.c_inst_name_code,
        bid.c_inst_code,
        sinc.c_inst_name_hz,
        sinc.c_inst_name_py,
        bic.c_bi_role_desc,
        bic.c_bi_role_chn,
        bid.c_bi_begin_year,
        bid.c_bi_end_year
      FROM BIOG_INST_DATA bid
      LEFT JOIN SOCIAL_INSTITUTION_NAME_CODES sinc ON bid.c_inst_name_code = sinc.c_inst_name_code
      LEFT JOIN BIOG_INST_CODES bic ON bid.c_bi_role_code = bic.c_bi_role_code
      WHERE bid.c_personid = ?
      ORDER BY bid.c_bi_begin_year
    `;
    return this.db.prepare(sql).all(personId);
  }

  /**
   * Get association data (literary and social connections)
   */
  getAssociations(personId: number) {
    const sql = `
      SELECT
        ad.c_assoc_id,
        assoc_person.c_name_chn as assoc_name_chn,
        assoc_person.c_name as assoc_name,
        ac.c_assoc_desc_chn,
        ac.c_assoc_desc,
        ad.c_text_title,
        ad.c_assoc_first_year,
        ad.c_assoc_last_year
      FROM ASSOC_DATA ad
      LEFT JOIN BIOG_MAIN assoc_person ON ad.c_assoc_id = assoc_person.c_personid
      LEFT JOIN ASSOC_CODES ac ON ad.c_assoc_code = ac.c_assoc_code
      WHERE ad.c_personid = ?
      ORDER BY ad.c_assoc_first_year
      LIMIT 20  -- Limit to prevent overwhelming output
    `;
    return this.db.prepare(sql).all(personId);
  }

  /**
   * Get person's basic info with dynasty information
   */
  getPersonInfo(personId: number) {
    const sql = `
      SELECT
        bm.*,
        d.c_dynasty_chn,
        d.c_dynasty as dynasty_name,
        addr.c_name_chn as index_addr_name_chn,
        addr.c_name as index_addr_name
      FROM BIOG_MAIN bm
      LEFT JOIN DYNASTIES d ON bm.c_dy = d.c_dy
      LEFT JOIN ADDRESSES addr ON bm.c_index_addr_id = addr.c_addr_id
      WHERE bm.c_personid = ?
    `;
    return this.db.prepare(sql).get(personId);
  }

  /**
   * Generate comprehensive profile for a person
   */
  generatePersonProfile(personId: number) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📋 COMPREHENSIVE PROFILE: Person ID ${personId}`);
    console.log(`${'='.repeat(80)}`);

    // Basic info
    const person = this.getPersonInfo(personId);
    if (!person) {
      console.log('❌ Person not found');
      return;
    }

    console.log(`\n🏷️  BASIC INFORMATION`);
    console.log(`   Chinese Name: ${person.c_name_chn || 'N/A'}`);
    console.log(`   English Name: ${person.c_name || 'N/A'}`);
    console.log(`   Surname (漢字): ${person.c_surname_chn || 'N/A'}`);
    console.log(`   Given Name (漢字): ${person.c_mingzi_chn || 'N/A'}`);
    console.log(`   Birth Year: ${person.c_birthyear || 'Unknown'}`);
    console.log(`   Death Year: ${person.c_deathyear || 'Unknown'}`);
    console.log(`   Dynasty: ${person.c_dynasty_chn || 'N/A'} (${person.dynasty_name || 'N/A'})`);
    console.log(`   Gender: ${person.c_female ? 'Female' : 'Male'}`);
    console.log(`   Index Location: ${person.index_addr_name_chn || 'N/A'}`);

    // Data counts overview
    const counts = this.getDataCounts(personId);
    console.log(`\n📊 DATA RICHNESS OVERVIEW`);
    console.log(`   Alternative Names: ${counts.altnames}`);
    console.log(`   Address Associations: ${counts.addresses}`);
    console.log(`   Kinship Relations: ${counts.kinships}`);
    console.log(`   Official Positions: ${counts.offices}`);
    console.log(`   Text Associations: ${counts.texts}`);
    console.log(`   Institution Memberships: ${counts.institutions}`);
    console.log(`   Social Associations: ${counts.associations}`);
    console.log(`   Recorded Events: ${counts.events}`);
    console.log(`   Status Records: ${counts.statuses}`);
    console.log(`   Total Data Points: ${Object.values(counts).reduce((a, b) => a + b, 0)}`);

    // Alternative names
    if (counts.altnames > 0) {
      const altNames = this.getAlternativeNames(personId);
      console.log(`\n🏺 ALTERNATIVE NAMES AND TITLES`);
      altNames.forEach((alt: any, i: number) => {
        console.log(`   ${i + 1}. ${alt.c_alt_name_chn || alt.c_alt_name || 'N/A'}`);
        console.log(`      Type: ${alt.c_name_type_desc_chn || alt.c_name_type_desc || 'N/A'}`);
        if (alt.c_alt_name && alt.c_alt_name_chn) {
          console.log(`      Romanized: ${alt.c_alt_name}`);
        }
      });
    }

    // Geographic associations
    if (counts.addresses > 0) {
      const addresses = this.getAddresses(personId);
      console.log(`\n🗺️  GEOGRAPHIC ASSOCIATIONS`);
      addresses.forEach((addr: any, i: number) => {
        console.log(`   ${i + 1}. ${addr.addr_name_chn || addr.addr_name || 'N/A'}`);
        console.log(`      Relationship: ${addr.c_addr_desc_chn || addr.c_addr_desc || 'N/A'}`);
        if (addr.c_firstyear || addr.c_lastyear) {
          console.log(`      Years: ${addr.c_firstyear || '?'} - ${addr.c_lastyear || '?'}`);
        }
      });
    }

    // Kinship relationships
    if (counts.kinships > 0) {
      const kinships = this.getKinshipRelationships(personId);
      console.log(`\n👨‍👩‍👧‍👦 KINSHIP RELATIONSHIPS`);
      kinships.forEach((kin: any, i: number) => {
        console.log(`   ${i + 1}. ${kin.kin_name_chn || kin.kin_name || 'N/A'}`);
        console.log(`      Relationship: ${kin.c_kinrel_chn || kin.c_kinrel || kin.c_kinrel_alt || 'N/A'}`);
      });
    }

    // Official positions
    if (counts.offices > 0) {
      const offices = this.getOfficialPositions(personId);
      console.log(`\n🏛️  OFFICIAL POSITIONS`);
      offices.forEach((office: any, i: number) => {
        console.log(`   ${i + 1}. ${office.c_office_chn || office.c_office_pinyin || 'N/A'}`);
        if (office.c_office_trans) {
          console.log(`      Translation: ${office.c_office_trans}`);
        }
        if (office.c_firstyear || office.c_lastyear) {
          console.log(`      Period: ${office.c_firstyear || '?'} - ${office.c_lastyear || '?'}`);
        }
        if (office.c_dynasty_chn) {
          console.log(`      Dynasty: ${office.c_dynasty_chn}`);
        }
        if (office.office_location) {
          console.log(`      Location: ${office.office_location}`);
        }
        if (office.appointment_type) {
          console.log(`      Appointment Type: ${office.appointment_type}`);
        }
      });
    }

    // Text associations
    if (counts.texts > 0) {
      const texts = this.getTextAssociations(personId);
      console.log(`\n📚 TEXT ASSOCIATIONS`);
      texts.forEach((text: any, i: number) => {
        console.log(`   ${i + 1}. ${text.c_title_chn || text.c_title || 'N/A'}`);
        if (text.c_title_trans) {
          console.log(`      Translation: ${text.c_title_trans}`);
        }
        if (text.c_role_desc_chn || text.c_role_desc) {
          console.log(`      Role: ${text.c_role_desc_chn || text.c_role_desc}`);
        }
        if (text.c_year) {
          console.log(`      Year: ${text.c_year}`);
        }
      });
    }

    // Social institutions
    if (counts.institutions > 0) {
      const institutions = this.getSocialInstitutions(personId);
      console.log(`\n🏫 SOCIAL INSTITUTIONS`);
      institutions.forEach((inst: any, i: number) => {
        console.log(`   ${i + 1}. ${inst.c_inst_name_hz || inst.c_inst_name_py || 'N/A'}`);
        if (inst.c_bi_role_chn || inst.c_bi_role_desc) {
          console.log(`      Role: ${inst.c_bi_role_chn || inst.c_bi_role_desc}`);
        }
        if (inst.c_bi_begin_year || inst.c_bi_end_year) {
          console.log(`      Period: ${inst.c_bi_begin_year || '?'} - ${inst.c_bi_end_year || '?'}`);
        }
      });
    }

    // Social associations
    if (counts.associations > 0) {
      const associations = this.getAssociations(personId);
      console.log(`\n🤝 SOCIAL ASSOCIATIONS`);
      associations.slice(0, 10).forEach((assoc: any, i: number) => {
        console.log(`   ${i + 1}. ${assoc.assoc_name_chn || assoc.assoc_name || 'N/A'}`);
        if (assoc.c_assoc_desc_chn || assoc.c_assoc_desc) {
          console.log(`      Relationship: ${assoc.c_assoc_desc_chn || assoc.c_assoc_desc}`);
        }
        if (assoc.c_text_title) {
          console.log(`      Context: ${assoc.c_text_title}`);
        }
        if (assoc.c_assoc_first_year) {
          console.log(`      Year: ${assoc.c_assoc_first_year}`);
        }
      });
      if (associations.length > 10) {
        console.log(`   ... and ${associations.length - 10} more associations`);
      }
    }
  }

  /**
   * Main exploration function
   */
  exploreRichPersons() {
    console.log('🔍 CBDB Rich Persons Explorer');
    console.log('========================================');

    console.log('\n🔎 Finding persons with the richest biographical data...');
    const richPersons = this.findRichlyDocumentedPersons();

    console.log(`\n📊 Top ${richPersons.length} most documented persons:`);
    richPersons.forEach((person: any, i: number) => {
      console.log(`${i + 1}. ${person.c_name_chn} (${person.c_name}) - ID: ${person.c_personid}`);
      console.log(`   Birth-Death: ${person.c_birthyear}-${person.c_deathyear}`);
      console.log(`   Total Data Points: ${person.total_data_count}`);
    });

    // Generate detailed profiles for top 3 persons
    console.log(`\n📋 Generating detailed profiles for top 3 persons...`);
    const topThree = richPersons.slice(0, 3);

    topThree.forEach((person: any) => {
      this.generatePersonProfile(person.c_personid);
    });

    // Also specifically explore Wang Anshi and Su Shi if they're not in top 3
    const famousPersons = [
      { id: 1762, name: 'Wang Anshi 王安石' },
      { id: 3767, name: 'Su Shi 蘇軾' }
    ];

    const topThreeIds = topThree.map(p => p.c_personid);

    famousPersons.forEach(famous => {
      if (!topThreeIds.includes(famous.id)) {
        console.log(`\n🌟 Additionally exploring famous figure: ${famous.name}`);
        this.generatePersonProfile(famous.id);
      }
    });
  }

  close() {
    this.db.close();
    console.log('\n✅ Database connection closed');
  }
}

// Main execution
if (require.main === module) {
  const explorer = new CBDBExplorer();

  try {
    explorer.exploreRichPersons();
  } catch (error) {
    console.error('❌ Error during exploration:', error);
  } finally {
    explorer.close();
  }
}

export default CBDBExplorer;
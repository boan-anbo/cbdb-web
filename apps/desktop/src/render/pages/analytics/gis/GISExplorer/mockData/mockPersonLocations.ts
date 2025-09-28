/**
 * Mock CBDB person location data for testing
 */

import type { PersonLocation } from '../../types';
import { AddressTypeCode } from '../../types';

export const mockPersonLocations: PersonLocation[] = [
  // Wang Anshi (王安石) - Song Dynasty reformer
  {
    id: 'wang_anshi_birth',
    personId: 1,
    personName: 'Wang Anshi 王安石',
    addressId: 1001,
    addressType: AddressTypeCode.BIRTHPLACE,
    coordinates: {
      longitude: 115.9890,  // Fuzhou, Jiangxi
      latitude: 27.9544
    },
    firstYear: 1021,
    lastYear: 1021,
    properties: {
      addressTypeName: 'Birthplace',
      dynasty: 'Song',
      year: 1021,
      placeName: 'Fuzhou 撫州',
      admin_type: 'Prefecture'
    }
  },
  {
    id: 'wang_anshi_office',
    personId: 1,
    personName: 'Wang Anshi 王安石',
    addressId: 1002,
    addressType: AddressTypeCode.OFFICE_LOCATION,
    coordinates: {
      longitude: 118.7969,  // Nanjing
      latitude: 32.0603
    },
    firstYear: 1067,
    lastYear: 1074,
    properties: {
      addressTypeName: 'Office Location',
      dynasty: 'Song',
      year: 1067,
      placeName: 'Jiangning 江寧',
      admin_type: 'Prefecture'
    }
  },
  {
    id: 'wang_anshi_death',
    personId: 1,
    personName: 'Wang Anshi 王安石',
    addressId: 1003,
    addressType: AddressTypeCode.DEATH_PLACE,
    coordinates: {
      longitude: 118.7969,
      latitude: 32.0603
    },
    firstYear: 1086,
    lastYear: 1086,
    properties: {
      addressTypeName: 'Death Place',
      dynasty: 'Song',
      year: 1086,
      placeName: 'Jiangning 江寧',
      admin_type: 'Prefecture'
    }
  },

  // Su Shi (蘇軾/蘇東坡) - Song Dynasty poet
  {
    id: 'su_shi_birth',
    personId: 2,
    personName: 'Su Shi 蘇軾',
    addressId: 2001,
    addressType: AddressTypeCode.BIRTHPLACE,
    coordinates: {
      longitude: 104.7798,  // Meishan, Sichuan
      latitude: 30.0489
    },
    firstYear: 1037,
    lastYear: 1037,
    properties: {
      addressTypeName: 'Birthplace',
      dynasty: 'Song',
      year: 1037,
      placeName: 'Meishan 眉山',
      admin_type: 'Prefecture'
    }
  },
  {
    id: 'su_shi_office1',
    personId: 2,
    personName: 'Su Shi 蘇軾',
    addressId: 2002,
    addressType: AddressTypeCode.OFFICE_LOCATION,
    coordinates: {
      longitude: 120.1551,  // Hangzhou
      latitude: 30.2741
    },
    firstYear: 1071,
    lastYear: 1074,
    sequence: 1,
    properties: {
      addressTypeName: 'Office Location',
      dynasty: 'Song',
      year: 1071,
      placeName: 'Hangzhou 杭州',
      admin_type: 'Prefecture'
    }
  },
  {
    id: 'su_shi_office2',
    personId: 2,
    personName: 'Su Shi 蘇軾',
    addressId: 2003,
    addressType: AddressTypeCode.OFFICE_LOCATION,
    coordinates: {
      longitude: 116.6783,  // Mizhou (Zhucheng, Shandong)
      latitude: 36.0075
    },
    firstYear: 1074,
    lastYear: 1076,
    sequence: 2,
    properties: {
      addressTypeName: 'Office Location',
      dynasty: 'Song',
      year: 1074,
      placeName: 'Mizhou 密州',
      admin_type: 'Prefecture'
    }
  },
  {
    id: 'su_shi_exile',
    personId: 2,
    personName: 'Su Shi 蘇軾',
    addressId: 2004,
    addressType: AddressTypeCode.RESIDENCE,
    coordinates: {
      longitude: 110.4085,  // Hainan
      latitude: 19.2041
    },
    firstYear: 1097,
    lastYear: 1100,
    notes: 'Exiled to Hainan',
    properties: {
      addressTypeName: 'Residence (Exile)',
      dynasty: 'Song',
      year: 1097,
      placeName: 'Danzhou 儋州',
      admin_type: 'Prefecture'
    }
  },

  // Zhu Xi (朱熹) - Song Dynasty philosopher
  {
    id: 'zhu_xi_birth',
    personId: 3,
    personName: 'Zhu Xi 朱熹',
    addressId: 3001,
    addressType: AddressTypeCode.BIRTHPLACE,
    coordinates: {
      longitude: 117.9894,  // Youxi, Fujian
      latitude: 26.1698
    },
    firstYear: 1130,
    lastYear: 1130,
    properties: {
      addressTypeName: 'Birthplace',
      dynasty: 'Song',
      year: 1130,
      placeName: 'Youxi 尤溪',
      admin_type: 'County'
    }
  },
  {
    id: 'zhu_xi_academy',
    personId: 3,
    personName: 'Zhu Xi 朱熹',
    addressId: 3002,
    addressType: AddressTypeCode.OFFICE_LOCATION,
    coordinates: {
      longitude: 116.9903,  // Lushan, Jiangxi
      latitude: 29.5734
    },
    firstYear: 1179,
    lastYear: 1181,
    notes: 'White Deer Grotto Academy',
    properties: {
      addressTypeName: 'Office Location',
      dynasty: 'Song',
      year: 1179,
      placeName: 'Lushan 廬山',
      admin_type: 'Mountain'
    }
  },
  {
    id: 'zhu_xi_death',
    personId: 3,
    personName: 'Zhu Xi 朱熹',
    addressId: 3003,
    addressType: AddressTypeCode.DEATH_PLACE,
    coordinates: {
      longitude: 118.1776,  // Jianyang, Fujian
      latitude: 27.3319
    },
    firstYear: 1200,
    lastYear: 1200,
    properties: {
      addressTypeName: 'Death Place',
      dynasty: 'Song',
      year: 1200,
      placeName: 'Jianyang 建陽',
      admin_type: 'County'
    }
  },

  // Sima Guang (司馬光) - Song Dynasty historian
  {
    id: 'sima_guang_birth',
    personId: 4,
    personName: 'Sima Guang 司馬光',
    addressId: 4001,
    addressType: AddressTypeCode.BIRTHPLACE,
    coordinates: {
      longitude: 110.8647,  // Yuncheng, Shanxi
      latitude: 35.0264
    },
    firstYear: 1019,
    lastYear: 1019,
    properties: {
      addressTypeName: 'Birthplace',
      dynasty: 'Song',
      year: 1019,
      placeName: 'Xia County 夏縣',
      admin_type: 'County'
    }
  },
  {
    id: 'sima_guang_office',
    personId: 4,
    personName: 'Sima Guang 司馬光',
    addressId: 4002,
    addressType: AddressTypeCode.OFFICE_LOCATION,
    coordinates: {
      longitude: 113.6253,  // Kaifeng
      latitude: 34.7466
    },
    firstYear: 1070,
    lastYear: 1085,
    properties: {
      addressTypeName: 'Office Location',
      dynasty: 'Song',
      year: 1070,
      placeName: 'Kaifeng 開封',
      admin_type: 'Capital'
    }
  },

  // Yue Fei (岳飛) - Song Dynasty general
  {
    id: 'yue_fei_birth',
    personId: 5,
    personName: 'Yue Fei 岳飛',
    addressId: 5001,
    addressType: AddressTypeCode.BIRTHPLACE,
    coordinates: {
      longitude: 114.0255,  // Tangyin, Henan
      latitude: 35.9239
    },
    firstYear: 1103,
    lastYear: 1103,
    properties: {
      addressTypeName: 'Birthplace',
      dynasty: 'Song',
      year: 1103,
      placeName: 'Tangyin 湯陰',
      admin_type: 'County'
    }
  },
  {
    id: 'yue_fei_death',
    personId: 5,
    personName: 'Yue Fei 岳飛',
    addressId: 5002,
    addressType: AddressTypeCode.DEATH_PLACE,
    coordinates: {
      longitude: 120.1551,  // Hangzhou (Lin'an)
      latitude: 30.2741
    },
    firstYear: 1142,
    lastYear: 1142,
    notes: 'Executed on false charges',
    properties: {
      addressTypeName: 'Death Place',
      dynasty: 'Song',
      year: 1142,
      placeName: "Lin'an 臨安",
      admin_type: 'Capital'
    }
  },
  {
    id: 'yue_fei_burial',
    personId: 5,
    personName: 'Yue Fei 岳飛',
    addressId: 5003,
    addressType: AddressTypeCode.BURIAL_SITE,
    coordinates: {
      longitude: 120.1304,  // West Lake, Hangzhou
      latitude: 30.2489
    },
    firstYear: 1162,
    lastYear: 1162,
    notes: 'Yue Fei Tomb near West Lake',
    properties: {
      addressTypeName: 'Burial Site',
      dynasty: 'Song',
      year: 1162,
      placeName: 'West Lake 西湖',
      admin_type: 'Lake'
    }
  },
];

/**
 * Get mock locations filtered by person IDs
 */
export function getMockLocationsByPersons(personIds: number[]): PersonLocation[] {
  return mockPersonLocations.filter(loc => personIds.includes(loc.personId));
}

/**
 * Get mock locations filtered by time period
 */
export function getMockLocationsByPeriod(startYear: number, endYear: number): PersonLocation[] {
  return mockPersonLocations.filter(loc => {
    const locYear = loc.firstYear || loc.properties.year || 0;
    return locYear >= startYear && locYear <= endYear;
  });
}
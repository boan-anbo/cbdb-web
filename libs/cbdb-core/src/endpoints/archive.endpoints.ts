export const ArchiveEndpoints = {
  CONTROLLER_PATH: 'archive',

  GET_STATUS: {
    method: 'GET' as const,
    relativePath: 'status',
    fullPath: '/api/archive/status',
    description: 'Get archive and extraction status'
  },

  GET_INFO: {
    method: 'GET' as const,
    relativePath: 'info',
    fullPath: '/api/archive/info',
    description: 'Get detailed archive information'
  },

  OPEN_LOCATION: {
    method: 'POST' as const,
    relativePath: 'open-location',
    fullPath: '/api/archive/open-location',
    description: 'Open archive or extracted location in file explorer'
  },

  EXTRACT: {
    method: 'POST' as const,
    relativePath: 'extract',
    fullPath: '/api/archive/extract',
    description: 'Extract archive with progress streaming'
  },

  CLEAN_EXTRACTED: {
    method: 'DELETE' as const,
    relativePath: 'extracted',
    fullPath: '/api/archive/extracted',
    description: 'Clean up extracted files'
  }
} as const;
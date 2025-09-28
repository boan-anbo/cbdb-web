import { IsString, IsOptional, IsIn } from 'class-validator';

export class ArchiveStatusResponse {
  exists!: boolean;
  extracted!: boolean;
  archivePath!: string;
  extractedPath?: string;
  archiveSize!: number;
  extractedSize?: number;
  checksum?: string;
  lastModified!: Date;
}

export class ArchiveInfoResponse {
  archivePath!: string;
  fileName!: string;
  fileSize!: number;
  sizeFormatted!: string;
  compressionRatio?: number;
  contents!: {
    files: string[];
    totalFiles: number;
  };
}

export class OpenLocationRequest {
  @IsIn(['archive', 'extracted'])
  path!: 'archive' | 'extracted';
}

export class OpenLocationResponse {
  success!: boolean;
  path!: string;
}

export class ExtractArchiveRequest {
  @IsOptional()
  @IsString()
  targetName?: string;
}

export class ExtractArchiveResponse {
  success!: boolean;
  extractedPath?: string;
  duration?: number;
  error?: string;
}

export class ArchiveProgressEvent {
  type!: 'progress' | 'complete' | 'error';
  percent?: number;
  file?: string;
  speed?: string;
  extractedPath?: string;
  duration?: number;
  message?: string;
}

export class CleanExtractedResponse {
  success!: boolean;
  freedSpace!: number;
}
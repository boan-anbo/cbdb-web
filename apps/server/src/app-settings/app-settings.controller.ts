import { Controller, Get, Put, Body, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppSettingsService } from './app-settings.service';

@ApiTags('app-settings')
@Controller('app-settings')
export class AppSettingsController {
  constructor(private readonly appSettingsService: AppSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get app settings' })
  @ApiResponse({ status: 200, description: 'Returns app settings' })
  async getSettings() {
    return await this.appSettingsService.getSettings();
  }

  @Put()
  @ApiOperation({ summary: 'Update app settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  async updateSettings(@Body() updates: any) {
    return await this.appSettingsService.updateSettings(updates);
  }

  @Put('cbdb-path')
  @ApiOperation({ summary: 'Set last used CBDB path' })
  @ApiResponse({ status: 200, description: 'CBDB path updated' })
  async setLastUsedCbdbPath(@Body() body: { path: string }) {
    return await this.appSettingsService.setLastUsedCbdbPath(body.path);
  }

  @Get('recent-files')
  @ApiOperation({ summary: 'Get recent CBDB files' })
  @ApiResponse({ status: 200, description: 'Returns recent files list' })
  async getRecentFiles() {
    return await this.appSettingsService.getRecentFiles();
  }

  @Post('recent-files')
  @ApiOperation({ summary: 'Add a recent file' })
  @ApiResponse({ status: 201, description: 'File added to recent files' })
  async addRecentFile(
    @Body() body: { filePath: string; fileName: string; fileSize?: number },
  ) {
    return await this.appSettingsService.addRecentFile(
      body.filePath,
      body.fileName,
      body.fileSize,
    );
  }

  @Get('search-history')
  @ApiOperation({ summary: 'Get search history' })
  @ApiResponse({ status: 200, description: 'Returns search history' })
  async getSearchHistory() {
    return await this.appSettingsService.getSearchHistory();
  }

  @Post('search-history')
  @ApiOperation({ summary: 'Add search history entry' })
  @ApiResponse({ status: 201, description: 'Search added to history' })
  async addSearchHistory(
    @Body()
    body: {
      searchQuery: string;
      searchType: string;
      resultsCount: number;
      cbdbPath?: string;
    },
  ) {
    return await this.appSettingsService.addSearchHistory(
      body.searchQuery,
      body.searchType,
      body.resultsCount,
      body.cbdbPath,
    );
  }
}
import { Injectable, OnModuleInit } from '@nestjs/common';
import type { BrowserWindow, Menu as MenuType, MenuItem, dialog as DialogType, screen as ScreenType } from 'electron';

@Injectable()
export class Window implements OnModuleInit {
  private mainWindow: BrowserWindow;
  private isQuitting = false;
  private static instance: Window;

  constructor() {
    Window.instance = this;
  }

  async onModuleInit() {
    // Ensure Electron is ready before creating window
    const { app } = require('electron');
    if (!app.isReady()) {
      console.log('Waiting for Electron app to be ready...');
      await app.whenReady();
    }
    console.log('Electron app is ready, creating window...');

    try {
      this.setupAppEventHandlers();
      this.createApplicationMenu();
      await this.createWindow();
      console.log('Window created successfully');
    } catch (error) {
      console.error('Failed to create window:', error);
      // Don't crash the app if window creation fails
      // This allows us to see the error in logs
    }
  }

  private setupAppEventHandlers() {
    const { app } = require('electron');
    const isMac = process.platform === 'darwin';

    // Handle app quit properly
    app.on('before-quit', () => {
      this.isQuitting = true;
    });

    // Handle dock click on macOS - show window if hidden or create if closed
    if (isMac) {
      app.on('activate', async () => {
        // This event is fired when the dock icon is clicked on macOS
        await this.showWindow();
      });
    }
  }

  async createWindow() {
    // Prevent duplicate windows
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.focus();
      return;
    }

    const { app, BrowserWindow: ElectronBrowserWindow, screen } = require('electron');
    const isDev = !app.isPackaged;

    // Get the primary display's work area size (excludes taskbar/dock)
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    this.mainWindow = new ElectronBrowserWindow({
      width: width,
      height: height,
      x: 0,
      y: 0,
      show: false, // Don't show until ready
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: isDev
          ? require('path').join(__dirname, '../../dist/preload/index.js')
          : require('path').join(__dirname, '../preload/index.js'),
        // Disable cache to ensure fresh content
        webSecurity: isDev ? false : true,
      },
    });

    const url = isDev
      ? process.env.DS_RENDERER_URL || 'http://localhost:5173'  // Use Doubleshot's detected URL
      : `file://${require('path').join(__dirname, '../render/index.html')}`;

    // Debug logging (only in development)
    if (isDev && process.env.DEBUG_ELECTRON === 'true') {
      console.log(`[Window] Loading URL: ${url}`);
      console.log(`[Window] DS_RENDERER_URL env var: ${process.env.DS_RENDERER_URL}`);

      this.mainWindow.webContents.on('did-navigate', (event, url) => {
        console.log(`[Window] Did navigate to: ${url}`);
      });

      this.mainWindow.webContents.on('did-finish-load', () => {
        console.log(`[Window] Finished loading: ${this.mainWindow.webContents.getURL()}`);
      });
    }

    this.mainWindow.loadURL(url);

    // Show window when ready to prevent visual artifacts
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
      // Maximize the window after showing to ensure full size
      this.mainWindow.maximize();
    });

    // Open DevTools in development mode or when ELECTRON_BUILD_DEBUG_MODE is set
    if (isDev || process.env.ELECTRON_BUILD_DEBUG_MODE === '1') {
      this.mainWindow.webContents.openDevTools();
    }

    // Handle window close event differently on macOS
    const isMac = process.platform === 'darwin';

    // Prevent window from closing on macOS, hide instead
    this.mainWindow.on('close', (event) => {
      if (isMac && !this.isQuitting) {
        event.preventDefault();
        this.mainWindow.hide();
        return false;
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null as any;
    });
  }

  private createApplicationMenu() {
    const { app, Menu, dialog } = require('electron');
    const isMac = process.platform === 'darwin';

    const template: any[] = [
      // File menu
      {
        label: 'File',
        submenu: [
          ...(isMac ? [] : [
            {
              label: 'About CBDB Desktop',
              click: () => {
                dialog.showMessageBox({
                  type: 'info',
                  title: 'About CBDB Desktop',
                  message: 'CBDB Desktop Application',
                  detail: 'China Biographical Database Desktop\nVersion 1.0.0\n\nA desktop application for exploring the China Biographical Database.',
                  buttons: ['OK']
                });
              }
            },
            { type: 'separator' }
          ]),
          {
            label: isMac ? 'Quit CBDB Desktop' : 'Exit',
            accelerator: isMac ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      }
    ];

    // On macOS, add the app menu with About in it
    if (isMac) {
      template.unshift({
        label: app.getName(),
        submenu: [
          {
            label: 'About CBDB Desktop',
            click: () => {
              dialog.showMessageBox({
                type: 'info',
                title: 'About CBDB Desktop',
                message: 'CBDB Desktop Application',
                detail: 'China Biographical Database Desktop\nVersion 1.0.0\n\nA desktop application for exploring the China Biographical Database.',
                buttons: ['OK']
              });
            }
          },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          {
            label: 'Quit CBDB Desktop',
            accelerator: 'Cmd+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  // Static method to get the Window instance
  static getInstance(): Window | null {
    return Window.instance || null;
  }

  // Method to show window (for dock click on macOS)
  async showWindow() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.show();
      this.mainWindow.focus();
    } else {
      await this.createWindow();
    }
  }
}
export type WindowId = 'games' | 'cv' | 'settings' | 'scores';

export type OsPowerState = 'off' | 'booting' | 'desktop';

export type ZenOsTheme = 'zen-dark' | 'retro-amber' | 'matrix-green';

export interface WindowPosition {
  readonly x: number;
  readonly y: number;
}

export interface WindowSize {
  readonly width: number;
  readonly height: number;
}

export interface RetroWindow {
  readonly id: WindowId;
  readonly title: string;
  readonly icon: string;
  readonly isOpen: boolean;
  readonly isMinimized: boolean;
  readonly isMaximized?: boolean;
  readonly position: WindowPosition;
  readonly size: WindowSize;
  readonly zIndex: number;
  readonly minSize?: WindowSize;
}

export interface DesktopIcon {
  readonly id: string;
  readonly label: string;
  readonly windowId: WindowId;
  readonly iconType: 'gamepad' | 'document' | 'terminal' | 'gear' | 'trophy';
}

export interface ZenOsConfig {
  readonly theme: ZenOsTheme;
  readonly crtScanlinesEnabled: boolean;
  readonly soundMuted: boolean;
}

import { Context } from '@atlaskit/media-core';
import { UploadParams, MediaFile } from '@atlaskit/media-picker';

export type MediaStateStatus =
  | 'unknown'
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'error'
  | 'cancelled'
  | 'preview';

export interface MediaState {
  id: string;
  status?: MediaStateStatus;
  publicId?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  fileMimeType?: string;
  progress?: number;
  ready?: boolean;
  preview?: boolean;
  thumbnail?: {
    src: string;
    dimensions?: {
      width: number;
      height: number;
    };
  };
  error?: {
    name: string;
    description: string;
  };
}

export interface MediaStateManager {
  getState(tempId: string): MediaState | undefined;
  updateState(tempId: string, newState: Partial<MediaState>): void;
  newState(file: MediaFile, status: string, publicId?: string): MediaState;
  on(tempId: string, cb: (state: MediaState) => void);
  off(tempId: string, cb: (state: MediaState) => void): void;
  destroy(): void;
}

export interface FeatureFlags {
  useNewUploadService?: boolean;
}

export type Listener = (data: any) => void;

export interface CustomMediaPicker {
  on(event: string, cb: Listener): void;
  removeAllListeners(event: any);
  emit(event: string, data: any): void;
  destroy(): void;
  setUploadParams(uploadParams: UploadParams);
}

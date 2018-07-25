import {
  MediaStore,
  MediaStoreGetCollectionItemsParams,
  MediaCollectionItem,
  MediaCollectionItems,
  MediaCollectionItemFullDetails,
  MediaFile,
} from '@atlaskit/media-store';
import { FileItem, FileDetails, LinkItem, LinkDetails } from '../item';
import {
  FileState,
  apiProcessingStatusToFileStatus,
  mapMediaFileToFileState,
} from '../fileState';
import { FileStreamCache } from '../context/fileStreamCache';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

export interface MediaCollectionFileItemDetails extends FileDetails {
  occurrenceKey: string;
}

export interface MediaCollectionFileItem extends FileItem {
  details: MediaCollectionFileItemDetails;
}

export interface MediaCollectionLinkItemDetails extends LinkDetails {
  occurrenceKey: string;
}

export interface MediaCollectionLinkItem extends LinkItem {
  details: MediaCollectionLinkItemDetails;
}

// export type MediaCollectionItem =
//   | MediaCollectionFileItem
//   | MediaCollectionLinkItem;

export interface MediaCollection {
  id: string;
  items: Array<MediaCollectionItem>;
}

export class CollectionFetcher {
  private fileIds: string[];

  constructor(
    readonly mediaStore: MediaStore,
    readonly fileStreamCache: FileStreamCache,
  ) {
    this.fileIds = [];
  }

  private createFileStateObserver(
    id: string,
    details: MediaCollectionItemFullDetails,
  ): Observable<FileState> {
    const fileStream = new Observable<FileState>(observer => {
      const mediaFile: MediaFile = {
        id,
        ...details,
      };
      const fileState = mapMediaFileToFileState({ data: mediaFile });

      observer.next(fileState);
    }).publishReplay(1);

    fileStream.connect();

    return fileStream;
  }

  private populateCache(items: MediaCollectionItem[]) {
    const keyOptions = { collectionName: 'recents' };

    items.forEach(item => {
      const key = FileStreamCache.createKey(item.id, keyOptions);
      const fileStream = this.createFileStateObserver(
        item.id,
        item.details as MediaCollectionItemFullDetails,
      );

      this.fileStreamCache.set(key, fileStream);
    });
  }

  getUserRecentItems(
    params?: MediaStoreGetCollectionItemsParams,
  ): Observable<string[]> {
    const observable = Observable.create(
      async (observer: Observer<string[]>) => {
        if (this.fileIds.length) {
          setTimeout(() => {
            observer.next(this.fileIds);
          }, 1);
        } else {
          const items = await this.mediaStore.getUserRecentItems({
            ...params,
            details: 'full',
          });
          this.populateCache(items.data.contents);
          const ids = items.data.contents.map(item => item.id);
          this.fileIds = ids;

          observer.next(ids);
        }
      },
    ).publishReplay(1);

    observable.connect();
    return observable;
  }
}

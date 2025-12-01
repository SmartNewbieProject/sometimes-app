export abstract class ImageSourceStrategy {
  abstract loadImage(): string | number;
  abstract validateSource(): boolean;
}

export class LocalImageSource extends ImageSourceStrategy {
  constructor(private imageRequire: any) {
    super();
  }

  loadImage(): number {
    return this.imageRequire;
  }

  validateSource(): boolean {
    return !!this.imageRequire;
  }
}

export class RemoteImageSource extends ImageSourceStrategy {
  constructor(private imageUrl: string) {
    super();
  }

  loadImage(): string {
    return this.imageUrl;
  }

  validateSource(): boolean {
    return typeof this.imageUrl === 'string' && this.imageUrl.length > 0;
  }
}

export class ImageSourceFactory {
  static createImageSource(source: string | number): ImageSourceStrategy {
    if (typeof source === 'number') {
      return new LocalImageSource(source);
    } else if (typeof source === 'string') {
      return new RemoteImageSource(source);
    }
    throw new Error('Invalid image source type');
  }

  static createLocalSource(imageRequire: any): LocalImageSource {
    return new LocalImageSource(imageRequire);
  }

  static createRemoteSource(imageUrl: string): RemoteImageSource {
    return new RemoteImageSource(imageUrl);
  }
}
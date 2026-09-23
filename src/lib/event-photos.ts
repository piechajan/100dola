// Sdílené typy pro galerii fotek eventu po dnech (client-safe, bez server importů).

export interface EventPhoto {
  url: string;
  /** Blob download URL — vynutí stažení (Content-Disposition attachment) bez proxy. */
  downloadUrl: string;
  pathname: string;
  uploadedAt: string;
}

export interface EventPhotoDay {
  day: number;
  photos: EventPhoto[];
}

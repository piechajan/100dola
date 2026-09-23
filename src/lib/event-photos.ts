// Sdílené typy pro galerii fotek eventu po dnech (client-safe, bez server importů).

export interface EventPhoto {
  url: string;
  pathname: string;
  uploadedAt: string;
}

export interface EventPhotoDay {
  day: number;
  photos: EventPhoto[];
}

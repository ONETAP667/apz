export type UserReadModel = {
  ID: number;
  Username: string;
  email: string;
  Balance: number;
  DateJoined: Date;
  RestrictionType: number | null;
  RestrictedUntil: Date | null;
  RestrictionReason: string | null;
  Archive: boolean;
  Version: number;
};

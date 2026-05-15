export enum AvailabiltiesEnum{
    PUBLIC,
    FRIENDS_ONLY ,
    ONLY_ME 
}
export enum ReactionsEnum{
    LIKE,
    LOVE,
    HAHA,
    WOW,
    SAD,
    ANGRY
}

export const getEnumOptions = (enm: Record<string, string | number>) =>
  Object.entries(enm)
    .filter(([key]) => Number.isNaN(Number(key)))
    .map(([key, value]) => ({ key, value }));

export const AvailabilityOptions = getEnumOptions(AvailabiltiesEnum);
export const ReactionOptions = getEnumOptions(ReactionsEnum);
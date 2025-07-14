// A collection of Base64 encoded sounds for the application.
// This prevents needing to fetch external assets and ensures instant playback.

export const sounds = {
  // A soft, digital tick sound
  select: 'data:audio/wav;base64,UklGRjwAAABXQVZFZm10IBAAAAABAAIARKwAABCxAgAEABAAZGF0YSAAAAACAgEBAgEBAgIBAQECAQECAQECAQECAQECAgI=',
  // A positive, soft chime
  correct: 'data:audio/wav;base64,UklGRlAAAABXQVZFZm10IBAAAAABAAIARKwAABCxAgAEABAAZGF0YSQAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIA=',
  // A low, subtle buzz/error sound
  incorrect: 'data:audio/wav;base64,UklGRlAAAABXQVZFZm10IBAAAAABAAIARKwAABCxAgAEABAAZGF0YSQAAAAA////////////////////////////////////////AAAAAAAAAAAA',
  // A celebratory, rising sound for level up
  levelUp: 'data:audio/wav;base64,UklGRlgAAABXQVZFZm10IBAAAAABAAIARKwAABCxAgAEABAAZGF0YSA+AAAACgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BSUw==',
  // A short, digital sound for spending XP
  xpSpend: 'data:audio/wav;base64,UklGRkIAAABXQVZFZm10IBAAAAABAAIARKwAABCxAgAEABAAZGF0YSA2AAAA/v/8/v/9/v/++v/7+v/7+f/5+P/39v/18//y8O/u6ufo5eLh3tzb19LRz8vHyMbDvLq4t7Sxq6GefnNqYFpUUkxHRkJCQD49Ojg1MA==',
};

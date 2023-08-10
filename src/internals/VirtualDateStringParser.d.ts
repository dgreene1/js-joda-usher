/**
 * Essentially a virtual class so that we can make sure that every parser has the same methods, but allow for them to have different implementations
 */
export interface VirtualDateStringParser {
  toZonedDateTime: unknown;
  toInstant: unknown;
  toLocalDate: unknown;
  toLocalDateTime: unknown;
  toLocalTime: unknown;
}

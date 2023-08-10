import { DateTimeFormatter, LocalDate, ResolverStyle } from "@js-joda/core";
import { Locale } from "@js-joda/locale";
import { VirtualDateStringParser } from "./VirtualDateStringParser";

export class FromUserInputParser implements VirtualDateStringParser {
  toZonedDateTime: unknown;
  toInstant: unknown;

  /**
   * Unlike the toLocalDate function on FromServerParser, the FromUserInputParser version does not expect ISO-8601 but instead requires the format and locale information so that it can properly parse the diverse set of inputs that are possible give the variety of lengths of formats.
   */
  toLocalDate({
    dateStr,
    pattern,
    locale,
  }: {
    dateStr: string;
    pattern: string;
    locale: Locale;
  }): LocalDate {
    // Learn more about why we have to do this by reading: https://github.com/js-joda/js-joda/issues/691#issuecomment-1671814952
    const replacedPattern = pattern.replace(/y/g, "u");
    const formatter = DateTimeFormatter.ofPattern(replacedPattern)
      .withLocale(locale)
      .withResolverStyle(ResolverStyle.STRICT);

    return LocalDate.parse(dateStr, formatter);
  }

  toLocalDateTime: unknown;
  toLocalTime: unknown;
}

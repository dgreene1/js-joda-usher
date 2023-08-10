import { NotImplementedError } from "../helpers/NotImplementedError";
import { VirtualDateStringParser } from "./VirtualDateStringParser";
import {
  LocalDate,
  ZonedDateTime,
  Instant,
  LocalDateTime,
  LocalTime,
  ResolverStyle,
  DateTimeFormatter,
} from "@js-joda/core";

export class FromServerParser implements VirtualDateStringParser {
  /**
   * this method is not supported. Use toInstant instead
   */
  toZonedDateTime(): never {
    throw new NotImplementedError(
      "this method is not supported. Use toInstant instead"
    );
  }

  toInstant(input: string) {
    if (!input.includes("Z")) {
      throw new Error("It's not an Instant if the Z for Zulu isn't present");
    }
    return Instant.parse(input);
  }

  toLocalDate(input: string): LocalDate {
    const lengthOfAnISODate = 10; // '2023-08-10'.length
    // if not ISO8601 for a day only, then fail
    if (input.length !== lengthOfAnISODate && !input.includes("-")) {
    }
    return LocalDate.parse(input);
  }

  /**
   * It's bad practice to pass date strings that lack a zone or Z (for Zulu) since it removes the ability for the UI to know the offset which means that the UI will produce date math related errors. So this method is not supported. Use toInstant or toZonedDateTime instead. Note: this means that you will have to renegotiate the API schema with the server group to either ensure that they are passing a date string with the Z (i.e. the instant type) or ensure that they are passing the timezone (i.e. ZonedDateTime). Do NOT just add a Z to the end of the string.
   */
  toLocalDateTime(): never {
    throw new NotImplementedError(
      "It's bad practice to pass date strings that lack a zone or Z (for Zulu) since it removes the ability for the UI to know the offset which means that the UI will produce date math related errors. So this method is not supported. Use toInstant or toZonedDateTime instead. Note: this means that you will have to renegotiate the API schema with the server group to either ensure that they are passing a date string with the Z (i.e. the instant type) or ensure that they are passing the timezone (i.e. ZonedDateTime). Do NOT just add a Z to the end of the string."
    );
  }

  toLocalTime: unknown;
}

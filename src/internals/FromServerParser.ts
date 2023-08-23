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
  ZoneId,
} from "@js-joda/core";
import "@js-joda/timezone";

export class FromServerParser implements VirtualDateStringParser {
  private zoneIdOfUserForTestPurposes: ZoneId;

  constructor(zoneIdOfUserForTestPurposes?: ZoneId) {
    if (process.env.NODE_ENV === "test") {
      this.zoneIdOfUserForTestPurposes = !!zoneIdOfUserForTestPurposes
        ? zoneIdOfUserForTestPurposes
        : ZoneId.SYSTEM;
    } else {
      if (!!zoneIdOfUserForTestPurposes) {
        throw new Error(
          `You can not set the user's ZoneId unless you are running in a test. Process.env.NODE_ENV was expected to be 'test' but instead was '${process.env.NODE_ENV}'`
        );
      }
      this.zoneIdOfUserForTestPurposes = ZoneId.SYSTEM;
    }
  }
  /**
   * this method is not supported. Use toInstant instead
   */
  toZonedDateTime(): never {
    throw new NotImplementedError(
      "this method is not supported and will not be supported until https://github.com/tc39/proposal-temporal/issues/1450 is accepted and widely adopted. Use toInstant instead"
    );
  }

  /**
   * Very loose checking just so we know which branch to go down. Thankfully js-joda is the final arbiter of the truth
   * @param input
   * @returns
   */
  private smellsLikeAnInstantString(input: string): boolean {
    if (input.endsWith("Z")) {
      return true;
    }
    return false;
  }

  toInstant(input: string) {
    if (!this.smellsLikeAnInstantString(input)) {
      throw new Error("It's not an Instant if the Z for Zulu isn't present");
    }
    return Instant.parse(input);
  }

  /**
   * Very loose checking just so we know which branch to go down. Thankfully js-joda is the final arbiter of the truth
   * @param input
   * @returns
   */
  private smellsLikeALocalDateString(input: string): boolean {
    return /^(19[0-9]{2}|2[0-9]{3})-(0[1-9]|1[012])-([123]0|[012][1-9]|31)$/.test(
      input
    );
  }

  toLocalDate(input: string): LocalDate {
    if (!this.smellsLikeALocalDateString(input)) {
      throw new Error(
        `The input ("${input}") was not in ISO-8601 format for a day type.`
      );
    }
    return LocalDate.parse(input);
  }

  /**
   * If you are trying to use this function, you are likely trying to render a day picker from an Instant or ZonedDateTime. Instead, best practice would be to render a date/time picker instead. This function is dangerous since it is challenging to determine the correct day that an instant occurs within given the challenging math of when a day starts at any point on the Earth, relative to an individual human observer.
   * @param input a string representation of an Instant (given that Instants are the only string format allowed for date times in https://datatracker.ietf.org/doc/html/rfc3339#section-5.6)
   * @param zoneOfTheObserver this is the zone of the user and therefore it is not supposed to be the zone of the server
   * @returns
   */
  toLocalDateDANGEROUS(input: string, zoneOfTheObserver: ZoneId): LocalDate {
    if (!this.zoneIdOfUserForTestPurposes.equals(zoneOfTheObserver)) {
      throw new Error(
        `Since this function uses zoneOfTheObserver to determine how to accurately convert an Instant (from the server) to a LocalDate in the user's time, the zoneOfTheObserver must be the user's ZoneId. Use '${this.zoneIdOfUserForTestPurposes}' instead of '${zoneOfTheObserver.id}'`
      );
    }
    if (this.smellsLikeALocalDateString(input)) {
      return this.toLocalDate(input);
    }
    if (!this.smellsLikeAnInstantString(input)) {
      throw new Error(
        `this function only supports converting a stringified LocalDate or a stringified Instant to LocalDate, but we got ${input} instead`
      );
    }
    const inputAsInstant = this.toInstant(input);
    const inputAsZDT = ZonedDateTime.ofInstant(
      inputAsInstant,
      zoneOfTheObserver
    );

    return inputAsZDT.toLocalDate();
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

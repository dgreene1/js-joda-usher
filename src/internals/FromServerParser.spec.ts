import {
  ChronoUnit,
  Instant,
  LocalDate,
  MonthDay,
  ZoneId,
} from "@js-joda/core";
import { FromServerParser } from "./FromServerParser";

describe("FromServerParser", () => {
  describe(".toLocalDate", () => {
    interface TestCaseForATimezone {
      zoneIdOfUser: ZoneId;
    }

    const testCasesForTimezones: TestCaseForATimezone[] = [
      {
        zoneIdOfUser: ZoneId.of("Pacific/Honolulu"),
      },
      {
        zoneIdOfUser: ZoneId.of("America/New_York"),
      },
      {
        zoneIdOfUser: ZoneId.of("Europe/London"),
      },
      {
        zoneIdOfUser: ZoneId.of("Australia/Sydney"),
      },
    ];

    const testCaseKeys: Array<keyof TestCaseForATimezone> = ["zoneIdOfUser"];
    const strangeJestLiteralForTest = testCaseKeys
      .map((k) => `${k}: $${k}` as const)
      .join(", ");

    test.each(testCasesForTimezones)(
      `should work for the critical path. ${strangeJestLiteralForTest}`,
      ({ zoneIdOfUser }) => {
        // ACT
        const parser = new FromServerParser(zoneIdOfUser);

        const expectedLocalDate = LocalDate.of(2023, 8, 22);
        const serverDateTimeString = "2023-08-22";

        // ARRANGE
        const output = parser.toLocalDate(serverDateTimeString);

        // ASSERT
        expect(output.toString()).toEqual(expectedLocalDate.toString());
      }
    );
  });

  describe(".toLocalDateDANGEROUS", () => {
    it("should not allow the user to send in a ZoneId that is not the user's ZoneId", () => {
      // ACT
      const pretendZoneIdOfUser = ZoneId.SYSTEM;
      const parser = new FromServerParser(pretendZoneIdOfUser);

      // ARRANGE
      const shouldThrow = () =>
        parser.toLocalDateDANGEROUS(
          Instant.now().toString(),
          ZoneId.of("America/New_York")
        );

      // ASSERT
      expect(shouldThrow).toThrowError("ZoneId");
    });

    interface TestCaseForATimezone {
      serverDateTimeString: string;
      zoneIdOfUser: ZoneId;
      expectedLocalDate: LocalDate;
      scenario: "start of the day" | "end of the day" | "start of the NEXT day";
    }
    const augustTheEighthOf2023 = LocalDate.of(2023, 8, 22);
    const startOfDayInHawaii = "2023-08-22T10:00:00Z";
    const startOfDayInNewYork = "2023-08-22T04:00:00Z";
    const startOfDayInLondon = "2023-08-21T23:00:00Z";
    const startOfDayInAustralia = "2023-08-21T14:00:00Z";

    const testCasesForTimezones: TestCaseForATimezone[] = [
      {
        serverDateTimeString: startOfDayInHawaii,
        zoneIdOfUser: ZoneId.of("Pacific/Honolulu"),
        expectedLocalDate: augustTheEighthOf2023,
        scenario: "start of the day",
      },
      {
        serverDateTimeString: startOfDayInNewYork,
        zoneIdOfUser: ZoneId.of("America/New_York"),
        expectedLocalDate: augustTheEighthOf2023,
        scenario: "start of the day",
      },
      {
        serverDateTimeString: startOfDayInLondon,
        zoneIdOfUser: ZoneId.of("Europe/London"),
        expectedLocalDate: augustTheEighthOf2023,
        scenario: "start of the day",
      },
      {
        serverDateTimeString: startOfDayInAustralia,
        zoneIdOfUser: ZoneId.of("Australia/Sydney"),
        expectedLocalDate: augustTheEighthOf2023,
        scenario: "start of the day",
      },
      // Now try 23 hours and 59 minutes later
      {
        serverDateTimeString: Instant.parse(startOfDayInHawaii)
          .plus(1, ChronoUnit.DAYS)
          .minus(1, ChronoUnit.SECONDS)
          .toString(),
        zoneIdOfUser: ZoneId.of("Pacific/Honolulu"),
        expectedLocalDate: augustTheEighthOf2023,
        scenario: "end of the day",
      },
      {
        serverDateTimeString: Instant.parse(startOfDayInNewYork)
          .plus(1, ChronoUnit.DAYS)
          .minus(1, ChronoUnit.SECONDS)
          .toString(),
        zoneIdOfUser: ZoneId.of("America/New_York"),
        expectedLocalDate: augustTheEighthOf2023,
        scenario: "end of the day",
      },
      {
        serverDateTimeString: Instant.parse(startOfDayInLondon)
          .plus(1, ChronoUnit.DAYS)
          .minus(1, ChronoUnit.SECONDS)
          .toString(),
        zoneIdOfUser: ZoneId.of("Europe/London"),
        expectedLocalDate: augustTheEighthOf2023,
        scenario: "end of the day",
      },
      {
        serverDateTimeString: Instant.parse(startOfDayInAustralia)
          .plus(1, ChronoUnit.DAYS)
          .minus(1, ChronoUnit.SECONDS)
          .toString(),
        zoneIdOfUser: ZoneId.of("Australia/Sydney"),
        expectedLocalDate: augustTheEighthOf2023,
        scenario: "end of the day",
      },
      // Now try 24 hours and 1 minute later
      {
        serverDateTimeString: Instant.parse(startOfDayInHawaii)
          .plus(1, ChronoUnit.DAYS)
          .plus(1, ChronoUnit.SECONDS)
          .toString(),
        zoneIdOfUser: ZoneId.of("Pacific/Honolulu"),
        expectedLocalDate: augustTheEighthOf2023.plusDays(1),
        scenario: "start of the NEXT day",
      },
      {
        serverDateTimeString: Instant.parse(startOfDayInNewYork)
          .plus(1, ChronoUnit.DAYS)
          .plus(1, ChronoUnit.SECONDS)
          .toString(),
        zoneIdOfUser: ZoneId.of("America/New_York"),
        expectedLocalDate: augustTheEighthOf2023.plusDays(1),
        scenario: "start of the NEXT day",
      },
      {
        serverDateTimeString: Instant.parse(startOfDayInLondon)
          .plus(1, ChronoUnit.DAYS)
          .plus(1, ChronoUnit.SECONDS)
          .toString(),
        zoneIdOfUser: ZoneId.of("Europe/London"),
        expectedLocalDate: augustTheEighthOf2023.plusDays(1),
        scenario: "start of the NEXT day",
      },
      {
        serverDateTimeString: Instant.parse(startOfDayInAustralia)
          .plus(1, ChronoUnit.DAYS)
          .plus(1, ChronoUnit.SECONDS)
          .toString(),
        zoneIdOfUser: ZoneId.of("Australia/Sydney"),
        expectedLocalDate: augustTheEighthOf2023.plusDays(1),
        scenario: "start of the NEXT day",
      },
    ];

    const testCaseKeys: Array<keyof TestCaseForATimezone> = [
      "scenario",
      "serverDateTimeString",
      "expectedLocalDate",
      "zoneIdOfUser",
    ];
    const strangeJestLiteralForTest = testCaseKeys
      .map((k) => `${k}: $${k}` as const)
      .join(", ");

    test.each(testCasesForTimezones)(
      `should always be right no matter what zone the user is in. ${strangeJestLiteralForTest}`,
      ({ serverDateTimeString, zoneIdOfUser, expectedLocalDate }) => {
        // ACT
        const parser = new FromServerParser(zoneIdOfUser);

        // ARRANGE
        const output = parser.toLocalDateDANGEROUS(
          serverDateTimeString,
          zoneIdOfUser
        );

        // ASSERT
        expect(output.toString()).toEqual(expectedLocalDate.toString());
      }
    );
  });
});

import { FromServerParser } from "./internals/FromServerParser";
import { FromUserInputParser } from "./internals/FromUserInputParser";

export const makeParser = () => {
  return {
    fromServerValue: new FromServerParser(),
    fromUserInput: new FromUserInputParser(),
  };
};

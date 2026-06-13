import { GraphQLString } from "graphql";

export const searchProfile = {
  search: {
    type: GraphQLString,
    description: "search for a user",
    defaultValue: "",
  },
};

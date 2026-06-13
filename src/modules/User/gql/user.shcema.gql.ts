import { userResolver, UserResolver } from "./user.reslover";
import * as userGraphQlArgs from "./user.arg.gql";
import * as userGraphQlTypes from "./user.types.gql";

class UserGqlSchema {
  private readonly resolver: UserResolver;
  constructor() {
    this.resolver = userResolver;
  }

  registerQuery() {
    return {
      profile: {
        type: userGraphQlTypes.profileResponse,
        args: userGraphQlArgs.searchProfile,
        resolve: this.resolver.getProfile,
      },
    };
  }

  registerMutation() {
    return {
      // Fields
    };
  }
}

export const userGqlSchema = new UserGqlSchema();

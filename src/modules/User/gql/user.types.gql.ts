import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import {
  PROVIDER,
  UserGender,
  UserRole,
} from "../../../utils/enums/User.enums";
import { HUserDocument, IUser } from "../../../DB/models/user/User.model";

export const genderEnumType = new GraphQLEnumType({
  name: "genderEnumType",
  values: {
    MALE: { value: UserGender.MALE },
    FEMALE: { value: UserGender.FEMALE },
  },
});
export const roleEnumType = new GraphQLEnumType({
  name: "roleEnumType",
  values: {
    ADMIN: { value: UserRole.ADMIN },
    USER: { value: UserRole.USER },
  },
});

export const providerEnumType = new GraphQLEnumType({
  name: "providerEnumType",
  values: {
    SYSTEM: { value: PROVIDER.SYSTEM },
    GOOGLE: { value: PROVIDER.GOOGLE },
  },
});
export const graphqlUserType: GraphQLObjectType<HUserDocument> =
  new GraphQLObjectType({
    name: "userType",
    fields: () => ({
      _id: { type: GraphQLID },
      firstName: { type: new GraphQLNonNull(GraphQLString) },
      lastName: { type: new GraphQLNonNull(GraphQLString) },
      userName: {
        type: GraphQLString,
        resolve: (parent: HUserDocument) => {
          return parent.userName === UserGender.MALE
            ? `MR::${parent.userName}`
            : `MS ${parent.userName}`;
        },
      },
      email: { type: new GraphQLNonNull(GraphQLString) },
      confirmEmailOTP: { type: GraphQLString },
      confirmEmail: { type: GraphQLString },
      password: { type: GraphQLString },
      resetPasswordOTP: { type: GraphQLString },
      phoneNumber: { type: GraphQLString },
      address: { type: GraphQLString },
      gender: { type: new GraphQLNonNull(genderEnumType) },
      role: { type: new GraphQLNonNull(roleEnumType) },
      createdAt: { type: new GraphQLNonNull(GraphQLString) },
      updatedAt: { type: GraphQLString },
      changeCredentialsTime: { type: GraphQLString },
      profilePic: { type: GraphQLString },
      provider: { type: new GraphQLNonNull(providerEnumType) },
      deletedAt: { type: GraphQLString },
    }),
  });
export const profileResponse = new GraphQLObjectType({
  name: "profileResponse",
  fields: {
    message: { type: new GraphQLNonNull(GraphQLString) },
    user: { type: graphqlUserType },
  },
});

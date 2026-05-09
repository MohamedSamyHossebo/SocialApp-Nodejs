export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}
export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANNED = "BANNED",
}
export enum UserGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}
export enum SignatureEnum {
  USER = 0,
  ADMIN = 1,
}

export enum TokenTypeEnum{
  ACCESS="ACCESS",
  REFRESH="REFRESH"
}
export enum LogoutTypeEnum{
  LOG_OUT="LOG_OUT",
  LOG_OUT_FROM_ALL="LOG_OUT_FROM_ALL"
}
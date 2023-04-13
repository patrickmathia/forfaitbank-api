import { Injectable } from "@nestjs/common"
import { CreateUserDto } from "./../user/dto"
import { CreateOperationDto } from "./../operation/dto/create-operation.dto"
import { faker } from "@faker-js/faker"

@Injectable()
export class MockService {
  user(): CreateUserDto {
    const fname = faker.name.firstName()
    const lname = faker.name.lastName()
    const fullName = `${fname} ${lname}`
    const email = faker.internet
      .email(fname, lname, "forfaitbank.com")
      .toLowerCase()
    const address = `${faker.address.streetAddress()}, ${faker.address.cityName()}`
    const birthdate = faker.date.birthdate().toString()

    return {
      name: fullName,
      email,
      address,
      birthdate,
      cpf: "000.000.000-00",
      password: "password",
    }
  }

  operation = {
    concluded(): CreateOperationDto {
      return {
        name: "a concluded operation",
        billType: 100,
        value: 5000,
      }
    },
    reserved(): CreateOperationDto {
      return {
        name: "a reserved operation",
        billType: 10,
        value: 3499,
      }
    },
    parent(): CreateOperationDto {
      return {
        name: "a parent operation",
        billType: 50,
        value: 20000,
      }
    },
  }
}

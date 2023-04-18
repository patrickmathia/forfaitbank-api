import { Injectable } from "@nestjs/common"
import { CreateUserDto } from "./../user/dto"
import { CreateOperationDto } from "./../operation/dto/create-operation.dto"
import { faker } from "@faker-js/faker"
import { generate as generateRandomCpf } from "gerador-validador-cpf"

@Injectable()
export class MockService {
  user(): CreateUserDto {
    const firstName = faker.name.firstName()
    const lastName = faker.name.lastName()
    const fullName = `${firstName} ${lastName}`
    const email = faker.internet
      .email(firstName, lastName, "forfaitbank.com")
      .toLowerCase()
    const address = `${faker.address.streetAddress()}, ${faker.address.cityName()}`
    const birthdate = faker.date.birthdate().toString()
    const cpf = generateRandomCpf({ format: true })

    return {
      name: fullName,
      email,
      address,
      birthdate,
      cpf,
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

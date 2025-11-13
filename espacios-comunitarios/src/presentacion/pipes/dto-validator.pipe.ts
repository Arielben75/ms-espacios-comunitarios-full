import { ArgumentMetadata, HttpException, Injectable, PipeTransform } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate, ValidationError, ValidationArguments } from "class-validator";
import { ResponseDTO, ValidationErrorsType } from "src/shared/dto/response.dto";

@Injectable()
export class DtoValidatorPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
      const { metatype } = metadata;
      if(!metatype || !this.toValidate(metatype)) {
        return value;
      }
      if(value == undefined) {
        return value;
      }
      const object = plainToInstance(metatype, value);
      const errors = await validate(object);
      if (errors.length > 0) {
        const messages = formatValidationErrorsToResponseDto(errors);
      throw new HttpException(messages, messages.status);
      }
      const metadataClass = Reflect.getMetadata('dto-pipe-class-transform-options', metatype);

    const dataValue = plainToInstance(metatype, value, {
      exposeUnsetFields: false,
      enableImplicitConversion: true,
      ...metadataClass,
    });
    return dataValue;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}

// ==================================== //
// ===SMS WITH VALIDATOR, FieldName === //
// ==================================== //

export const formatValidationErrorsToResponseDto = <T>(
  errors: ValidationError[],
): ResponseDTO<T> => {
  const errorSms: Partial<ValidationErrorsType<T>> = errors.reduce((objErrors, err) => {
    if (!!err.children?.length) {
      const tempDAta = formatValidationErrorsToResponseDto(err.children);
      objErrors[err.property] = tempDAta.response?.validationErrors;
    } else {
      objErrors[err.property] = Object.values(err.constraints ?? '');
    }
    return { ...objErrors };
  }, {});

  return {
    error: true,
    message: 'hay un error de validación, por favor verifique los datos ingresados',
    response: {
      validationErrors: errorSms as ValidationErrorsType<T>,
    },
    status: 406,
  };
};
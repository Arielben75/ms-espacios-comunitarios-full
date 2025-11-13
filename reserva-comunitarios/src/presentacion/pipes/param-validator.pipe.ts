/* eslint-disable @typescript-eslint/ban-types */
import { PipeTransform, Injectable, ArgumentMetadata, HttpException } from '@nestjs/common';
import { isNumber } from 'class-validator';

/**
 * Pipe for validate data input in body into mutation or query
 * use mode, us   getOne(@Args('Input', MyValidatorPipe) inputDto: ChangeStatusCompilationInput)
 * use auxiliar method for validate
 */
@Injectable()
export class ParamValidatorPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;
    if (!metatype || this.toValidate(metatype)) {
      return value;
    }
    return paramTypeValidator(value, metatype);
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}

const MapTypes = {
  string: (str: string): string => str,
  boolean: (str: string) => {
    if (str === 'true' || str === 'false') return str === 'true';
    else
      throw new HttpException(
        {
          error: true,
          message: 'El parámetro es de tipo boolean',
          response: null,
          status: 400,
        },
        400,
      );
  },
  number: (str: string) => {
    if (isNumber(Number(str), { allowInfinity: false, allowNaN: false })) return Number(str);
    else
      throw new HttpException(
        {
          error: true,
          message: 'El parámetro es de tipo entero',
          response: null,
          status: 400,
        },
        400,
      );
  },
  object: (value: any) => {
    return value;
  },
};

export const paramTypeValidator = (value: string | undefined, metaType: any) => {
  if (value === undefined && value === null) {
    return value;
  } else {
    return MapTypes[typeof metaType()](value);
  }
};
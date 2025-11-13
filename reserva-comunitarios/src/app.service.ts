import { Injectable } from '@nestjs/common';
import { dataResponseSuccess, ResponseDTO } from './shared/dto/response.dto';
import { DateTime } from 'luxon';
import { ConfigService } from '@nestjs/config';
import { IPackageJson } from './shared/dto/interface';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getPing():ResponseDTO<{
    author: string;
    dateTimeServer: Date;
    nameApp: string;
    version: string;
  }> {
    const packageJson = this.configService.get<IPackageJson>('packageJson');

    return dataResponseSuccess({
      data: {
        author: packageJson?.author || 'ARIEL',
        dateTimeServer: DateTime.now().toJSDate(),
        nameApp: packageJson?.name || 'ARIEL',
        version: packageJson?.version || '1',
      },
    });
  }
}

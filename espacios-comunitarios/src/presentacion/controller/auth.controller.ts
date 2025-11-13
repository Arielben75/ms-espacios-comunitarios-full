import { Controller, Post, Body, Patch, Param, ParseIntPipe, HttpStatus, Delete } from '@nestjs/common';
import { AuthService } from '../../aplicacion/services/auth.service';
import { ApiTags } from '@nestjs/swagger';
import { loginDto } from '../dtos/auth.dto';
import { BearerAuthToken, VersionDescription } from '../decorators/controller.decorator';
import { CreateUsuariosDto, FilterDto, UpdateUsuariosDto } from '../dtos/usuarios.dto';

@ApiTags('[auth] Usuarios'.toUpperCase())
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: loginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('registrar')
  @VersionDescription('1','Servico para crear de los Usuarios')
  async register(@Body() registerDto: CreateUsuariosDto) {
    return await this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.nombres,
      registerDto.primerApellido,
      registerDto.segundoApellido,
      registerDto.fechaNacimiento,
      registerDto.nacionalidad,
      registerDto.userName,
      registerDto.celular,
    );
  }

  @Patch('update/:id')
  @BearerAuthToken()
  @VersionDescription(
    '1',
    'Servico para actualizar de los Usuarios',
  )
  updateUsuarios(@Param(
    'id',
    new ParseIntPipe({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  )
  id: number,
  @Body() body:CreateUsuariosDto) {
    return this.authService.updateUsuarios(
      id,
      body.email,
      body.password,
      body.nombres,
      body.primerApellido,
      body.segundoApellido,
      body.fechaNacimiento,
      body.nacionalidad,
      body.userName,
      body.celular,);
  }

  @Delete('delete/:id')
  @BearerAuthToken()
  @VersionDescription(
    '1',
    'Servico para eliminar de los Usuarios',
  )
  deleteUsuarios(@Param(
    'id',
    new ParseIntPipe({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  )
  id: number,) {
    return this.authService.deleteUser(id);
  }

  @Post('list')
  @BearerAuthToken()
  @VersionDescription(
    '1',
    'Servico para crear de los Usuarios',
  )
  listadoUsuarios(@Body() body: FilterDto) {
    return this.authService.listUsuarios(body);
  }
}
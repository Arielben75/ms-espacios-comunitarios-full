import { Password } from '../value-objects/password.vo';

export class User {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly _password: Password,
    public readonly nombres: string,
    public readonly primerApellido: string,
    public readonly segundoApellido: string,
    public readonly fechaNacimiento: Date,
    public readonly nacionalidad: string,
    public readonly userName: string,
    public readonly celular: string,
    public readonly estado: number,
    public readonly creadoEn: Date,
  ) {}

  get password(): string {
    return this._password.getValue();
  }

  set password(value: string) {
    this._password.setValue(value);
  }

  vericarPassword(plainPassword: string): boolean {
    try {
      const passwordToVerify = Password.fromString(plainPassword);
      return this._password.equals(passwordToVerify);
    } catch {
      return false;
    }
  }

  static create(
    email: string,
    password: string,
    nombres: string,
    primerApellido: string,
    segundoApellido: string,
    fechaNacimiento: Date,
    nacionalidad: string,
    userName: string,
    celular: string,
    estado: number,
  ): User {
    const passwordVO = Password.fromString(password);

    return new User(
      1,
      email,
      passwordVO,
      nombres,
      primerApellido,
      segundoApellido,
      fechaNacimiento,
      nacionalidad,
      userName,
      celular,
      estado,
      new Date(),
    );
  }

  static update(
    id: number,
    email: string,
    password: string,
    nombres: string,
    primerApellido: string,
    segundoApellido: string,
    fechaNacimiento: Date,
    nacionalidad: string,
    userName: string,
    celular: string,
    estado: number,
  ): User {
    const passwordVO = Password.fromString(password);

    return new User(
      id,
      email,
      passwordVO,
      nombres,
      primerApellido,
      segundoApellido,
      fechaNacimiento,
      nacionalidad,
      userName,
      celular,
      estado,
      new Date(),
    );
  }

  static fromPersistence(
    id: number,
    email: string,
    hashedPassword: string, // Ya está hasheado desde BD
    nombres: string,
    primerApellido: string,
    segundoApellido: string,
    fechaNacimiento: Date,
    nacionalidad: string,
    userName: string,
    celular: string,
    estado: number,
    creadoEn: Date,
  ): User {
    const passwordVO = Password.fromHash(hashedPassword);

    return new User(
      id,
      email,
      passwordVO,
      nombres,
      primerApellido,
      segundoApellido,
      fechaNacimiento,
      nacionalidad,
      userName,
      celular,
      estado,
      creadoEn,
    );
  }

  isNew(): boolean {
    return this.id === 1;
  }

  withId(newId: number): User {
    return new User(
      newId,
      this.email,
      this._password,
      this.nombres,
      this.primerApellido,
      this.segundoApellido,
      this.fechaNacimiento,
      this.nacionalidad,
      this.userName,
      this.celular,
      this.estado,
      this.creadoEn,
    );
  }
}

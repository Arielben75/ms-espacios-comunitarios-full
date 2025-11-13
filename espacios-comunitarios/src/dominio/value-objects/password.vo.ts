export class Password {
  private value: string;

  constructor(password: string, skipValidation: boolean = false) {
    if (!skipValidation) {
      this.validate(password);
    }
    this.value = password;
  }

  private validate(password: string): void {
    if (!password || password.trim().length === 0) {
      throw new Error('La contraseña es requerida');
    }

    if (password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    // Validar al menos una letra minúscula
    if (!/(?=.*[a-z])/.test(password)) {
      throw new Error('La contraseña debe contener al menos una letra minúscula');
    }

    // Validar al menos una letra mayúscula
    if (!/(?=.*[A-Z])/.test(password)) {
      throw new Error('La contraseña debe contener al menos una letra mayúscula');
    }

    // Validar al menos un número
    if (!/(?=.*\d)/.test(password)) {
      throw new Error('La contraseña debe contener al menos un número');
    }

    // Validar al menos un carácter especial (incluyendo @)
    if (!/(?=.*[@$!%*?&#+\-_=])/.test(password)) {
      throw new Error('La contraseña debe contener al menos un carácter especial (@, $, !, %, *, ?, &, #, +, -, _, =)');
    }

    // Validación completa con regex
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_=])[A-Za-z\d@$!%*?&#+\-_=]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error('La contraseña no cumple con los requisitos de seguridad');
    }
  }

  getValue(): string {
    return this.value;
  }

  setValue(value: string) {
    this.value = value;
  }

  // Método para verificar si dos contraseñas son iguales
  equals(other: Password): boolean {
    return this.value === other.value;
  }

  // Método estático para crear desde string
  static fromString(password: string): Password {
    return new Password(password);
  }

  static fromHash(hashedPassword: string): Password {
    return new Password(hashedPassword, true); // true = NO validar
  }
}
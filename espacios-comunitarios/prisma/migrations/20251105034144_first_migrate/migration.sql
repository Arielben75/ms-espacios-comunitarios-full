-- CreateTable
CREATE TABLE "Usuarios" (
    "id" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "primerApellido" TEXT NOT NULL,
    "segundoApellido" TEXT NOT NULL,
    "fechaNacimiento" TEXT NOT NULL,
    "nacionalidad" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "estado" INTEGER NOT NULL DEFAULT 1,
    "creadoEn" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3),

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TiposEspacios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" INTEGER NOT NULL DEFAULT 1,
    "creadoEn" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3),

    CONSTRAINT "TiposEspacios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Espacios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipoEspacioId" INTEGER NOT NULL,
    "descripcion" TEXT,
    "capacidad" INTEGER NOT NULL,
    "tarifaHora" DOUBLE PRECISION NOT NULL,
    "tarifaDia" DOUBLE PRECISION NOT NULL,
    "estado" INTEGER NOT NULL DEFAULT 1,
    "creadoEn" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3),

    CONSTRAINT "Espacios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_email_key" ON "Usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_userName_key" ON "Usuarios"("userName");

-- AddForeignKey
ALTER TABLE "Espacios" ADD CONSTRAINT "Espacios_tipoEspacioId_fkey" FOREIGN KEY ("tipoEspacioId") REFERENCES "TiposEspacios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

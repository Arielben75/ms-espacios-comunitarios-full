-- CreateTable
CREATE TABLE "TiposReservacion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "estado" INTEGER NOT NULL DEFAULT 1,
    "creadoEn" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3),

    CONSTRAINT "TiposReservacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservaciones" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "espacioId" INTEGER NOT NULL,
    "fechaInicial" TIMESTAMP(3) NOT NULL,
    "fechaFinal" TIMESTAMP(3) NOT NULL,
    "horasReserva" INTEGER NOT NULL,
    "importeTotal" DOUBLE PRECISION NOT NULL,
    "estadoReservacionId" INTEGER NOT NULL,
    "transaccionId" TEXT,
    "eventoCalendarioId" TEXT,
    "estado" INTEGER NOT NULL DEFAULT 1,
    "creadoEn" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3),

    CONSTRAINT "Reservaciones_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reservaciones" ADD CONSTRAINT "Reservaciones_estadoReservacionId_fkey" FOREIGN KEY ("estadoReservacionId") REFERENCES "TiposReservacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Espacios" (
    "id" INTEGER NOT NULL,
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

-- AddForeignKey
ALTER TABLE "Reservaciones" ADD CONSTRAINT "Reservaciones_espacioId_fkey" FOREIGN KEY ("espacioId") REFERENCES "Espacios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

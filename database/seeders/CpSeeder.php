<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use ZipArchive;

class CpSeeder extends Seeder
{
    private const COLUMNS = [
        'd_codigo', 'd_asenta', 'd_tipo_asenta', 'D_mnpio', 'd_estado',
        'd_ciudad', 'd_CP', 'c_estado', 'c_oficina', 'c_CP',
        'c_tipo_asenta', 'c_mnpio', 'id_asenta_cpcons', 'd_zona',
        'c_cve_ciudad',
    ];

    public function run(): void
    {
        DB::table('postal_codes')->delete();
        $fuente = $this->resolverFuente();
        $this->command?->info("Importando códigos postales desde {$fuente}...");

        [$handle, $esSql] = $this->abrirFuente($fuente);
        if ($esSql) {
            $this->importarSql($handle);
            fclose($handle);
            return;
        }

        $insertados = 0;
        $lote = [];
        $separador = $this->detectarSeparador($handle);

        while (($fila = fgetcsv($handle, 0, $separador)) !== false) {
            if ($this->esEncabezado($fila)) {
                continue;
            }

            $registro = $this->normalizarFila($fila);
            if ($registro === null) {
                continue;
            }

            $lote[] = $registro;
            if (count($lote) === 1000) {
                DB::table('postal_codes')->insert($lote);
                $insertados += count($lote);
                $lote = [];
            }
        }

        fclose($handle);

        if ($lote !== []) {
            DB::table('postal_codes')->insert($lote);
            $insertados += count($lote);
        }

        $this->command?->info("{$insertados} códigos postales importados.");
    }

    private function resolverFuente(): string
    {
        foreach ([
            database_path('seeders/catalogo_codigos_postales.sql'),
            database_path('data/cp.zip'),
            database_path('data/cp.sql'),
            database_path('data/postal_codes.csv'),
        ] as $fuente) {
            if (is_file($fuente)) {
                return $fuente;
            }
        }

        throw new RuntimeException(
            'No se encontró la fuente postal. Coloca cp.zip, cp.sql o postal_codes.csv en database/data.'
        );
    }

    private function abrirFuente(string $fuente): array
    {
        $extension = strtolower(pathinfo($fuente, PATHINFO_EXTENSION));
        if ($extension !== 'zip') {
            return [fopen($fuente, 'rb'), $extension === 'sql'];
        }

        $zip = new ZipArchive();
        if ($zip->open($fuente) !== true) {
            throw new RuntimeException("No se pudo abrir {$fuente}.");
        }

        for ($indice = 0; $indice < $zip->numFiles; $indice++) {
            $nombre = $zip->getNameIndex($indice);
            if ($nombre !== false && !str_ends_with($nombre, '/')) {
                $contenido = $zip->getFromIndex($indice);
                $esSql = strtolower(pathinfo($nombre, PATHINFO_EXTENSION)) === 'sql';
                $zip->close();
                $temporal = tmpfile();
                fwrite($temporal, $contenido);
                rewind($temporal);

                return [$temporal, $esSql];
            }
        }

        $zip->close();
        throw new RuntimeException("El archivo {$fuente} no contiene un archivo de datos.");
    }

    private function importarSql($handle): void
    {
        $lote = [];
        $insertados = 0;

        while (($linea = fgets($handle)) !== false) {
            if (!preg_match('/^INSERT\\s+INTO\\s+`?postal_codes`?.*?VALUES\\s*\\((.*)\\)\\s*;?\\s*$/i', trim($linea), $coincidencias)) {
                continue;
            }

            $fila = $this->parsearValoresSql($coincidencias[1]);
            if (count($fila) !== count(self::COLUMNS)) {
                continue;
            }

            $registro = $this->normalizarFila($fila);
            if ($registro === null) {
                continue;
            }

            $lote[] = $registro;
            if (count($lote) === 1000) {
                DB::table('postal_codes')->insert($lote);
                $insertados += count($lote);
                $lote = [];
            }
        }

        if ($lote !== []) {
            DB::table('postal_codes')->insert($lote);
            $insertados += count($lote);
        }

        $this->command?->info("{$insertados} códigos postales importados.");
    }

    private function parsearValoresSql(string $valores): array
    {
        $resultado = [];
        $valor = '';
        $enCadena = false;
        $longitud = strlen($valores);

        for ($indice = 0; $indice < $longitud; $indice++) {
            $caracter = $valores[$indice];

            if ($caracter === "'") {
                if ($enCadena && $indice + 1 < $longitud && $valores[$indice + 1] === "'") {
                    $valor .= "'";
                    $indice++;
                    continue;
                }

                $enCadena = !$enCadena;
                continue;
            }

            if (!$enCadena && $caracter === ',') {
                $resultado[] = $this->normalizarValorSql($valor);
                $valor = '';
                continue;
            }

            $valor .= $caracter;
        }

        $resultado[] = $this->normalizarValorSql($valor);

        return $resultado;
    }

    private function normalizarValorSql(string $valor): ?string
    {
        $valor = trim($valor);

        return strtoupper($valor) === 'NULL' ? null : $valor;
    }

    private function detectarSeparador($handle): string
    {
        $posicion = ftell($handle);
        $linea = fgets($handle) ?: '';
        fseek($handle, $posicion);

        return substr_count($linea, '|') >= substr_count($linea, ',') ? '|' : ',';
    }

    private function esEncabezado(array $fila): bool
    {
        $primeraColumna = strtolower(trim((string) ($fila[0] ?? '')));

        return in_array($primeraColumna, ['d_codigo', 'codigo postal', 'codigo_postal'], true);
    }

    private function normalizarFila(array $fila): ?array
    {
        $fila = array_pad(array_map(static fn ($valor) => $valor === null ? null : trim((string) $valor), $fila), count(self::COLUMNS), null);
        $fila = array_slice($fila, 0, count(self::COLUMNS));

        if (($fila[0] ?? '') === '' || ($fila[1] ?? '') === '' || ($fila[4] ?? '') === '') {
            return null;
        }

        return array_combine(self::COLUMNS, $fila) + [
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
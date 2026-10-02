<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaisSeeder extends Seeder
{
    public function run(): void
    {
        $paises = [
            ['Afganistán', 'AF', 'AFG'], ['Albania', 'AL', 'ALB'], ['Alemania', 'DE', 'DEU'],
            ['Andorra', 'AD', 'AND'], ['Angola', 'AO', 'AGO'], ['Antigua y Barbuda', 'AG', 'ATG'],
            ['Arabia Saudita', 'SA', 'SAU'], ['Argelia', 'DZ', 'DZA'], ['Argentina', 'AR', 'ARG'],
            ['Armenia', 'AM', 'ARM'], ['Australia', 'AU', 'AUS'], ['Austria', 'AT', 'AUT'],
            ['Azerbaiyán', 'AZ', 'AZE'], ['Bahamas', 'BS', 'BHS'], ['Bangladés', 'BD', 'BGD'],
            ['Barbados', 'BB', 'BRB'], ['Baréin', 'BH', 'BHR'], ['Bélgica', 'BE', 'BEL'],
            ['Belice', 'BZ', 'BLZ'], ['Benín', 'BJ', 'BEN'], ['Bielorrusia', 'BY', 'BLR'],
            ['Bolivia', 'BO', 'BOL'], ['Bosnia y Herzegovina', 'BA', 'BIH'], ['Botsuana', 'BW', 'BWA'],
            ['Brasil', 'BR', 'BRA'], ['Brunéi', 'BN', 'BRN'], ['Bulgaria', 'BG', 'BGR'],
            ['Burkina Faso', 'BF', 'BFA'], ['Burundi', 'BI', 'BDI'], ['Bután', 'BT', 'BTN'],
            ['Cabo Verde', 'CV', 'CPV'], ['Camboya', 'KH', 'KHM'], ['Camerún', 'CM', 'CMR'],
            ['Canadá', 'CA', 'CAN'], ['Catar', 'QA', 'QAT'], ['Chad', 'TD', 'TCD'],
            ['Chile', 'CL', 'CHL'], ['China', 'CN', 'CHN'], ['Chipre', 'CY', 'CYP'],
            ['Colombia', 'CO', 'COL'], ['Comoras', 'KM', 'COM'], ['Congo', 'CG', 'COG'],
            ['Corea del Norte', 'KP', 'PRK'], ['Corea del Sur', 'KR', 'KOR'], ['Costa de Marfil', 'CI', 'CIV'],
            ['Costa Rica', 'CR', 'CRI'], ['Croacia', 'HR', 'HRV'], ['Cuba', 'CU', 'CUB'],
            ['Dinamarca', 'DK', 'DNK'], ['Dominica', 'DM', 'DMA'], ['Ecuador', 'EC', 'ECU'],
            ['Egipto', 'EG', 'EGY'], ['El Salvador', 'SV', 'SLV'], ['Emiratos Árabes Unidos', 'AE', 'ARE'],
            ['Eritrea', 'ER', 'ERI'], ['Eslovaquia', 'SK', 'SVK'], ['Eslovenia', 'SI', 'SVN'],
            ['España', 'ES', 'ESP'], ['Estados Unidos', 'US', 'USA'], ['Estonia', 'EE', 'EST'],
            ['Esuatini', 'SZ', 'SWZ'], ['Etiopía', 'ET', 'ETH'], ['Fiji', 'FJ', 'FJI'],
            ['Filipinas', 'PH', 'PHL'], ['Finlandia', 'FI', 'FIN'], ['Francia', 'FR', 'FRA'],
            ['Gabón', 'GA', 'GAB'], ['Gambia', 'GM', 'GMB'], ['Georgia', 'GE', 'GEO'],
            ['Ghana', 'GH', 'GHA'], ['Granada', 'GD', 'GRD'], ['Grecia', 'GR', 'GRC'],
            ['Guatemala', 'GT', 'GTM'], ['Guinea', 'GN', 'GIN'], ['Guinea-Bisáu', 'GW', 'GNB'],
            ['Guinea Ecuatorial', 'GQ', 'GNQ'], ['Guyana', 'GY', 'GUY'], ['Haití', 'HT', 'HTI'],
            ['Honduras', 'HN', 'HND'], ['Hungría', 'HU', 'HUN'], ['India', 'IN', 'IND'],
            ['Indonesia', 'ID', 'IDN'], ['Irak', 'IQ', 'IRQ'], ['Irán', 'IR', 'IRN'],
            ['Irlanda', 'IE', 'IRL'], ['Islandia', 'IS', 'ISL'], ['Islas Marshall', 'MH', 'MHL'],
            ['Islas Salomón', 'SB', 'SLB'], ['Israel', 'IL', 'ISR'], ['Italia', 'IT', 'ITA'],
            ['Jamaica', 'JM', 'JAM'], ['Japón', 'JP', 'JPN'], ['Jordania', 'JO', 'JOR'],
            ['Kazajistán', 'KZ', 'KAZ'], ['Kenia', 'KE', 'KEN'], ['Kirguistán', 'KG', 'KGZ'],
            ['Kiribati', 'KI', 'KIR'], ['Kuwait', 'KW', 'KWT'], ['Laos', 'LA', 'LAO'],
            ['Lesoto', 'LS', 'LSO'], ['Letonia', 'LV', 'LVA'], ['Líbano', 'LB', 'LBN'],
            ['Liberia', 'LR', 'LBR'], ['Libia', 'LY', 'LBY'], ['Liechtenstein', 'LI', 'LIE'],
            ['Lituania', 'LT', 'LTU'], ['Luxemburgo', 'LU', 'LUX'], ['Macedonia del Norte', 'MK', 'MKD'],
            ['Madagascar', 'MG', 'MDG'], ['Malasia', 'MY', 'MYS'], ['Malaui', 'MW', 'MWI'],
            ['Maldivas', 'MV', 'MDV'], ['Malí', 'ML', 'MLI'], ['Malta', 'MT', 'MLT'],
            ['Marruecos', 'MA', 'MAR'], ['Mauricio', 'MU', 'MUS'], ['Mauritania', 'MR', 'MRT'],
            ['México', 'MX', 'MEX'], ['Micronesia', 'FM', 'FSM'], ['Moldavia', 'MD', 'MDA'],
            ['Mónaco', 'MC', 'MCO'], ['Mongolia', 'MN', 'MNG'], ['Montenegro', 'ME', 'MNE'],
            ['Mozambique', 'MZ', 'MOZ'], ['Myanmar', 'MM', 'MMR'], ['Namibia', 'NA', 'NAM'],
            ['Nauru', 'NR', 'NRU'], ['Nepal', 'NP', 'NPL'], ['Nicaragua', 'NI', 'NIC'],
            ['Níger', 'NE', 'NER'], ['Nigeria', 'NG', 'NGA'], ['Noruega', 'NO', 'NOR'],
            ['Nueva Zelanda', 'NZ', 'NZL'], ['Omán', 'OM', 'OMN'], ['Países Bajos', 'NL', 'NLD'],
            ['Pakistán', 'PK', 'PAK'], ['Palaos', 'PW', 'PLW'], ['Panamá', 'PA', 'PAN'],
            ['Papúa Nueva Guinea', 'PG', 'PNG'], ['Paraguay', 'PY', 'PRY'], ['Perú', 'PE', 'PER'],
            ['Polonia', 'PL', 'POL'], ['Portugal', 'PT', 'PRT'], ['Reino Unido', 'GB', 'GBR'],
            ['República Centroafricana', 'CF', 'CAF'], ['República Checa', 'CZ', 'CZE'], ['República Democrática del Congo', 'CD', 'COD'],
            ['República Dominicana', 'DO', 'DOM'], ['Ruanda', 'RW', 'RWA'], ['Rumania', 'RO', 'ROU'],
            ['Rusia', 'RU', 'RUS'], ['Samoa', 'WS', 'WSM'], ['San Cristóbal y Nieves', 'KN', 'KNA'],
            ['San Marino', 'SM', 'SMR'], ['San Vicente y las Granadinas', 'VC', 'VCT'], ['Santa Lucía', 'LC', 'LCA'],
            ['Santo Tomé y Príncipe', 'ST', 'STP'], ['Senegal', 'SN', 'SEN'], ['Serbia', 'RS', 'SRB'],
            ['Seychelles', 'SC', 'SYC'], ['Sierra Leona', 'SL', 'SLE'], ['Singapur', 'SG', 'SGP'],
            ['Siria', 'SY', 'SYR'], ['Somalia', 'SO', 'SOM'], ['Sri Lanka', 'LK', 'LKA'],
            ['Sudáfrica', 'ZA', 'ZAF'], ['Sudán', 'SD', 'SDN'], ['Sudán del Sur', 'SS', 'SSD'],
            ['Suecia', 'SE', 'SWE'], ['Suiza', 'CH', 'CHE'], ['Surinam', 'SR', 'SUR'],
            ['Tailandia', 'TH', 'THA'], ['Tanzania', 'TZ', 'TZA'], ['Tayikistán', 'TJ', 'TJK'],
            ['Timor-Leste', 'TL', 'TLS'], ['Togo', 'TG', 'TGO'], ['Tonga', 'TO', 'TON'],
            ['Trinidad y Tobago', 'TT', 'TTO'], ['Túnez', 'TN', 'TUN'], ['Turkmenistán', 'TM', 'TKM'],
            ['Turquía', 'TR', 'TUR'], ['Tuvalu', 'TV', 'TUV'], ['Ucrania', 'UA', 'UKR'],
            ['Uganda', 'UG', 'UGA'], ['Uruguay', 'UY', 'URY'], ['Uzbekistán', 'UZ', 'UZB'],
            ['Vanuatu', 'VU', 'VUT'], ['Venezuela', 'VE', 'VEN'], ['Vietnam', 'VN', 'VNM'],
            ['Yemen', 'YE', 'YEM'], ['Yibuti', 'DJ', 'DJI'], ['Zambia', 'ZM', 'ZMB'], ['Zimbabue', 'ZW', 'ZWE'],
            ['Ciudad del Vaticano', 'VA', 'VAT'], ['Palestina', 'PS', 'PSE'],
        ];

        $ahora = now();
        DB::table('vaai_paises')->upsert(
            array_map(static fn ($pais) => [
                'nombre' => $pais[0], 'codigo_iso2' => $pais[1], 'codigo_iso3' => $pais[2],
                'created_at' => $ahora, 'updated_at' => $ahora,
            ], $paises),
            ['nombre'], ['codigo_iso2', 'codigo_iso3', 'updated_at']
        );
    }
}
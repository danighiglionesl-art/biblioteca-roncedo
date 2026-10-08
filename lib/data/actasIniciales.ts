import { ActaHistorica, FolioArchivo } from '@/types';

/**
 * Genera el índice completo de los 102 folios escaneados presentes en:
 * material/Libros de Actas (Libro Nb0 1-1.jpg a Libro Nb0 1-102.jpg)
 */
export function generarFoliosIniciales(): FolioArchivo[] {
  const folios: FolioArchivo[] = [];

  for (let i = 1; i <= 102; i++) {
    // Cálculo de folio histórico (2 páginas por folio: Debe y Haber)
    // Pág 1: Preliminar / Carátula de Apertura
    // Pág 2 y 3: Folio 1 (Debe / Haber)
    // Pág 4 y 5: Folio 2 (Debe / Haber)
    let folioNum = 1;
    let lado: 'Debe' | 'Haber' | 'Único' = 'Debe';

    if (i === 1) {
      folioNum = 1;
      lado = 'Haber';
    } else {
      folioNum = Math.floor(i / 2);
      lado = i % 2 === 0 ? 'Debe' : 'Haber';
    }

    // Estimación cronológica por progresión del libro (1926 a 1932)
    let anioEstimado = 1926;
    if (i > 95) anioEstimado = 1932;
    else if (i > 80) anioEstimado = 1931;
    else if (i > 65) anioEstimado = 1930;
    else if (i > 50) anioEstimado = 1929;
    else if (i > 35) anioEstimado = 1928;
    else if (i > 20) anioEstimado = 1927;

    let resumen = `Folio manuscrito #${folioNum} (${lado}) correspondiente al Libro N° 1 de Actas de la institución.`;
    let actaAsocId: string | undefined;
    let numActaAsoc: number | string | undefined;

    if (i >= 1 && i <= 3) {
      actaAsocId = 'acta-001';
      numActaAsoc = 1;
      resumen = 'Acta Fundacional del Club y Elección de la Primera Comisión Directiva (15/03/1926).';
    } else if (i === 4 || i === 5) {
      actaAsocId = 'acta-002';
      numActaAsoc = 2;
      resumen = 'Acta 2ª: Moción de Homenaje al Dr. Lautaro Roncedo, Te Déum y Lápida (26/03/1926).';
    } else if (i === 6 || i === 7) {
      actaAsocId = 'acta-003';
      numActaAsoc = 3;
      resumen = 'Acta 3ª: Tratamiento de renuncias y convocatoria a asamblea (07/04/1926).';
    } else if (i === 8 || i === 9) {
      actaAsocId = 'acta-004';
      numActaAsoc = 4;
      resumen = 'Acta 4ª: Elección de nueva Comisión Directiva, asume Ángel Baggini y firmas (18/04/1926).';
    } else if (i === 10) {
      actaAsocId = 'acta-005';
      numActaAsoc = 5;
      resumen = 'Acta 5ª: Compra de camisetas, medias y partido con Berrotarán (22/04/1926).';
    } else if (i === 11) {
      actaAsocId = 'acta-006';
      numActaAsoc = 6;
      resumen = 'Acta 6ª: Trato con C.A. Gigena, bombas de estruendo 9 de Julio y buffet (17/06/1926).';
    } else if (i === 102) {
      actaAsocId = 'acta-010';
      numActaAsoc = 'Cierre L1';
      resumen = 'Folio 51: Remate y adjudicación del Bar Buffet a R. Gramajo con pliego de condiciones (02/10/1932).';
    }

    folios.push({
      id: `folio-p-${i}`,
      numero_pagina: i,
      folio: folioNum,
      lado,
      libro: 'Libro N° 1 de Actas (1926 - 1932)',
      archivo: `Libro Nb0 1-${i}.jpg`,
      imagen_url: `/api/actas/image?file=Libro%20Nb0%201-${i}.jpg`,
      anio_estimado: anioEstimado,
      acta_id_asociada: actaAsocId,
      numero_acta_asociada: numActaAsoc,
      resumen_breve: resumen,
      estado_conservacion: 'Excelente',
    });
  }

  return folios;
}

export const FOLIOS_INICIALES: FolioArchivo[] = generarFoliosIniciales();

export const ACTAS_HISTORICAS_INICIALES: ActaHistorica[] = [
  {
    id: 'acta-001',
    numero_acta: 1,
    libro: 'Libro N° 1 de Actas',
    folio_inicio: 1,
    folio_fin: 1,
    pagina_archivo_inicio: 1,
    pagina_archivo_fin: 3,
    fecha: '1926-03-15',
    anio: 1926,
    titulo: 'Acta Fundacional del Club y Elección de la Primera Comisión Directiva',
    tipo_reunion: 'Asamblea General Constitutiva',
    lugar: 'Hotel del Sr. B. Marquez, Alcira Gigena',
    asistentes_count: 23,
    resumen:
      'Asamblea constitutiva de fundación de la institución en el Hotel del Sr. B. Marquez con 23 vecinos y aficionados presentes. Se aprueba denominar a la entidad "Club Sportivo Doctor Lautaro Roncedo" en gratitud a su obra por la comunidad. Se elige la primera Comisión Directiva encabezada por Francisco Fagiano y se realiza la histórica primera colecta voluntaria de $19,30 para la compra del primer balón de fútbol.',
    transcripcion_completa: `[Página 1 - Folio 1 Haber]
En Gigena a quince de Marzo de 1926, Reunidos en asamblea general provocada por varios aficionados al deporte, En el Hotel del Sr B Marquez y en número de 23 asistentes a la misma, todos en perfectas condiciones de sus facultades mentales, y tres partes de ellos mayores de edad.
Entre otras cosas resuelven, en primer término nombrar una Comisión, que será de carácter "Directiva" o sea siempre dentro del buen gobierno para la misma, no habrá motivos ningunos para su renovación íntegra, hasta tanto se finalice la temporada próxima, o sea, un año después de su nombramiento, y siempre que haya mayoría de votos por parte de la Comisión Directiva ella se llevará a cabo.
Llevará como nombre de Epígrafe nuestra institución...

[Página 2 - Folio 1 Debe]
...el nombre de aquella ilustrísima personalidad, que colaboró por tanto tiempo en beneficio de este apacible pueblo, y en gratitud y homenaje a ello: Será: Club Sportivo, Doctor, Lautaro Roncedo.
Llevada la votación de práctica, se nombró para la dirección Directiva:
- Presidente: Francisco Fagiano
- Vice pte: Cándido Amaya
- Secretario: José W. Fagiano
- Pró styo: Diego Peralta
- Tesorero: Badi Estrella
- Pró tro: Jorge Estrella
- Vocal 1º: Serafín Fernández

[Página 3 - Folio 1 Haber]
- Vocal 2º: Camilo Estrella
- Vocal 3º: Carlos Álvarez
- Vocal 4º: Victoriano Álvarez
- Vocal 5º: Marcial Chávez
- Para revisador de Cuentas: Alfredo Gonzales

Todos, excepto el señor Gonzales por no estar presente, firman constancia de lo arriba expuesto.
En este mismo acto, y en presencia de los asistentes, se hace moción para que, con la cooperación de todos, se sufraguen para los gastos que demandare un foot-ball, para su iniciación.
Y así se resuelve, colectando para ello, Diecinueve pesos con treinta cts ($19,30), que quedan ya en poder del tesorero.
Siendo las 23:45 se resuelve levantar la sesión, hasta nuevo aviso.`,
    firmantes: [
      { nombre: 'Francisco Fagiano', cargo: 'Presidente Electo' },
      { nombre: 'Cándido Amaya', cargo: 'Vicepresidente' },
      { nombre: 'José W. Fagiano', cargo: 'Secretario' },
      { nombre: 'Diego Peralta', cargo: 'Prosecretario' },
      { nombre: 'Badi Estrella', cargo: 'Tesorero' },
      { nombre: 'Jorge Estrella', cargo: 'Protesorero' },
      { nombre: 'Serafín Fernández', cargo: 'Vocal 1º' },
      { nombre: 'Camilo Estrella', cargo: 'Vocal 2º' },
      { nombre: 'Carlos Álvarez', cargo: 'Vocal 3º' },
      { nombre: 'Victoriano Álvarez', cargo: 'Vocal 4º' },
      { nombre: 'Marcial Chávez', cargo: 'Vocal 5º' },
      { nombre: 'Alfredo Gonzales', cargo: 'Revisor de Cuentas' },
      { nombre: 'B. Marquez', cargo: 'Anfitrión y Asistente' },
    ],
    temas_tratados: [
      'Fundación oficial de la Institución',
      'Denominación en honor al Dr. Lautaro Roncedo',
      'Elección de la Primera Comisión Directiva',
      'Primera Colecta para Pelota de Fútbol ($19,30)',
    ],
    archivos: ['Libro Nb0 1-1.jpg', 'Libro Nb0 1-2.jpg', 'Libro Nb0 1-3.jpg'],
    imagenes_urls: [
      '/api/actas/image?file=Libro%20Nb0%201-1.jpg',
      '/api/actas/image?file=Libro%20Nb0%201-2.jpg',
      '/api/actas/image?file=Libro%20Nb0%201-3.jpg',
    ],
    estado_conservacion: 'Excelente',
    es_destacada: true,
    notas_archivista:
      'Documento fundacional primigenio. Manuscrito en tinta sepia con encabezado caligráfico de Debe y Haber. Conservación íntegra y legible.',
  },
  {
    id: 'acta-002',
    numero_acta: 2,
    libro: 'Libro N° 1 de Actas',
    folio_inicio: 2,
    folio_fin: 2,
    pagina_archivo_inicio: 4,
    pagina_archivo_fin: 5,
    fecha: '1926-03-26',
    anio: 1926,
    titulo: 'Moción de Homenaje al Dr. Lautaro Roncedo, Misa Te Déum y Colecta para Lápida',
    tipo_reunion: 'Reunión de Comisión Directiva',
    lugar: 'Sede Social, Alcira Gigena',
    asistentes_count: 14,
    resumen:
      'Reunión de la comisión directiva para conmemorar el primer aniversario del fallecimiento del Dr. Lautaro Roncedo. Se aprueba realizar un solemne Te Déum en la Iglesia local oficiado por el párroco y abrir una colecta pública en la comunidad para colocar una lápida en su sepulcro.',
    transcripcion_completa: `[Página 4 - Folio 2 Debe]
Acta 2ª
En Gigena a 26 de Marzo de 1926, Reunida la comisión en asamblea a los fines de tratar asuntos de incumbencia y orden social, resuelve en primer término, aprobar la moción presentada por el vocal Sr Chaves, en homenaje conmemorativo, respecto al epígrafe que lleva nuestra institución, símbolo de nobleza y gratitud.
Con un Te Déum, oficiado por el párroco, y en la iglesia local, para conmemorar y hacer culto a la memoria del primer aniversario de la muerte de aquella eminencia y de espíritu y tendencia filantrópica, que en vida fue Lautaro Roncedo, y que hoy honramos su nombre colocándolo de epígrafe a nuestra institución.
Como así también nombrar una comisión para que se ocupe en hacer...

[Página 5 - Folio 2 Haber]
...una colecta pública, a los efectos de hacer grabar una lápida conmemorativa a su memoria, para ser colocada en la morada donde descansan sus restos.`,
    firmantes: [
      { nombre: 'Francisco Fagiano', cargo: 'Presidente' },
      { nombre: 'Marcial Chávez', cargo: 'Vocal Proponente' },
      { nombre: 'José W. Fagiano', cargo: 'Secretario' },
      { nombre: 'Diego Peralta', cargo: 'Prosecretario' },
    ],
    temas_tratados: [
      'Homenaje póstumo al Dr. Lautaro Roncedo',
      'Celebración de Te Déum en Iglesia Local',
      'Colecta comunitaria para Lápida Conmemorativa',
    ],
    archivos: ['Libro Nb0 1-4.jpg', 'Libro Nb0 1-5.jpg'],
    imagenes_urls: [
      '/api/actas/image?file=Libro%20Nb0%201-4.jpg',
      '/api/actas/image?file=Libro%20Nb0%201-5.jpg',
    ],
    estado_conservacion: 'Excelente',
    es_destacada: true,
  },
  {
    id: 'acta-003',
    numero_acta: 3,
    libro: 'Libro N° 1 de Actas',
    folio_inicio: 3,
    folio_fin: 3,
    pagina_archivo_inicio: 6,
    pagina_archivo_fin: 7,
    fecha: '1926-04-07',
    anio: 1926,
    titulo: 'Tratamiento de Renuncias y Convocatoria a Elección de Nueva Comisión',
    tipo_reunion: 'Asamblea General Extraordinaria',
    lugar: 'Alcira Gigena',
    asistentes_count: 18,
    resumen:
      'Asamblea para tratar temas disciplinarios y dimisiones en cargos directivos (tesorero Badi Estrella, pro tesorero Jorge Estrella, revisor Alfredo Gonzales, vocal Camilo Estrella). Se resuelve en común acuerdo convocar a Asamblea General para el 17 de abril para elegir nuevos miembros.',
    transcripcion_completa: `[Página 6 - Folio 3 Debe]
Acta 3ª
En Gigena a 7 de Abril de 1926, Reunidos en asamblea general por resolución de la comisión, se resuelve dar entrada a los asuntos presentados a secretaría, se da lectura de ellos y sus aprobaciones, y quedan sancionados los asuntos que forman y constan en la presente Acta.
Se da lectura de la renuncia presentada por el vocal Camilo Estrella, puesta a votación queda aceptada por mayoría.
Presentada la renuncia del pró tesorero Sr Jorge Estrella, puesta a consideración de la asamblea, queda aprobada por mayoría.
Moción presentada por el vocal Sr Chavez sobre destitución del cargo que ocupa como así también la expulsión de socio de la institución del Sr C. Álvarez, se resuelve para su investigación sobre calumnias e injurias provocadas a algunos miembros de la comisión, nombrar tres miembros para su ejecución y resolución.

[Página 7 - Folio 3 Haber]
Renuncia presentada por el revisador de cuentas Sr A. Gonzales como miembro de la comisión, queda aprobada por mayoría, a tal efecto pasa al archivo.
Presentada la renuncia del tesorero Sr Badi Estrella como de carácter indeclinable, queda aprobada y aceptada por mayoría.
Dada la lectura de la renuncia presentada por el secretario Sr José Fagiano de carácter indeclinable, por resolución de la asamblea pasa su aprobación a cargo y juicio de la Comisión Directiva.
Se resuelve de común acuerdo la comisión designar para el día 17 del cte llamar Asamblea General para la elección de los miembros que integrarán la nueva Comisión.
Siendo las 23 horas se levanta la sesión por indicación de varios miembros de la misma.`,
    firmantes: [
      { nombre: 'Francisco Fagiano', cargo: 'Presidente' },
      { nombre: 'Diego Peralta', cargo: 'Prosecretario' },
    ],
    temas_tratados: [
      'Tratamiento de renuncias en Tesorería y Comisión',
      'Comisión investigadora de disciplina social',
      'Convocatoria a Asamblea General para nueva Comisión',
    ],
    archivos: ['Libro Nb0 1-6.jpg', 'Libro Nb0 1-7.jpg'],
    imagenes_urls: [
      '/api/actas/image?file=Libro%20Nb0%201-6.jpg',
      '/api/actas/image?file=Libro%20Nb0%201-7.jpg',
    ],
    estado_conservacion: 'Excelente',
  },
  {
    id: 'acta-004',
    numero_acta: 4,
    libro: 'Libro N° 1 de Actas',
    folio_inicio: 4,
    folio_fin: 4,
    pagina_archivo_inicio: 8,
    pagina_archivo_fin: 9,
    fecha: '1926-04-18',
    anio: 1926,
    titulo: 'Asamblea General de Reorganización y Asunción de Nueva Comisión Directiva',
    tipo_reunion: 'Asamblea General Ordinaria',
    lugar: 'Alcira Gigena',
    asistentes_count: 25,
    resumen:
      'Asamblea general para completar los cuadros directivos. Resulta electo como Tesorero el Sr. Ángel Baggini, asumiendo la entrega del activo y pasivo. Como protesorero es electo Santiago Bocco. Se incorporan seis nuevos vocales. Al pie del acta figuran las firmas autógrafas originales de los fundadores.',
    transcripcion_completa: `[Página 8 - Folio 4 Debe]
Acta 4ª
En Gigena a 18 de Abril de 1926, Reunidos en asamblea general convocada por la comisión directiva para selección a los miembros integrantes a la comisión, se resuelve a su efecto llevar a cabo tal elección por voto y resulta electo para la misma:
Para tesorero por mayoría resulta electo y aprobada al Sr Ángel Baggini, estando presente da asentimiento a su candidatura, a tal efecto asume al cargo y se responsabiliza como tal, haciéndosele entrega del activo y pasivo en el mismo acto y firma constancia de lo expuesto.
Se continúa con la elección de pró tesorero y resulta por mayoría de votos electo para el mismo el Sr Santiago Bocco, estando de acuerdo forma parte integrante para la misma.
Llevada a cabo la elección para vocales resultan para ellos electos:
- Vocal 2º: Antonio Schurtkens
- Vocal 3º: Enrique Touzo
- Vocal 4º: Pablo Marianeli
- Vocal 5º: José Salcatti
- Vocal 6º: Marcelo Barrotto
- Vocal 7º: Juan Balverdi
Quedando constituida la comisión...

[Página 9 - Folio 4 Haber]
...como lo atestigua la presente Acta.
Siendo las 23 horas del mismo día se resuelve por asentimiento general levantar la sesión.
La comisión Firma:
- Presidente: Francisco Fagiano
- Tesorero: Ángel Baggini
- Secretario: José Fagiano
- Pro Styo: Diego Peralta
- Vocales: Serafín Fernández, Antonio Schurtkens, Enrique Touzo, Juan Balverdi, José Salcatti, Santiago Bocco.`,
    firmantes: [
      { nombre: 'Francisco Fagiano', cargo: 'Presidente' },
      { nombre: 'Ángel Baggini', cargo: 'Tesorero Electo' },
      { nombre: 'Santiago Bocco', cargo: 'Protesorero Electo' },
      { nombre: 'Diego Peralta', cargo: 'Prosecretario' },
      { nombre: 'Serafín Fernández', cargo: 'Vocal' },
      { nombre: 'Antonio Schurtkens', cargo: 'Vocal' },
      { nombre: 'Enrique Touzo', cargo: 'Vocal' },
      { nombre: 'Juan Balverdi', cargo: 'Vocal' },
      { nombre: 'José Salcatti', cargo: 'Vocal' },
    ],
    temas_tratados: [
      'Elección de Ángel Baggini como Tesorero',
      'Elección de Santiago Bocco como Protesorero',
      'Constitución de nuevo cuerpo de Vocales',
      'Firmas autógrafas conservadas en el acta original',
    ],
    archivos: ['Libro Nb0 1-8.jpg', 'Libro Nb0 1-9.jpg'],
    imagenes_urls: [
      '/api/actas/image?file=Libro%20Nb0%201-8.jpg',
      '/api/actas/image?file=Libro%20Nb0%201-9.jpg',
    ],
    estado_conservacion: 'Excelente',
    es_destacada: true,
    notas_archivista:
      'Contiene firmas autógrafas nítidas de Francisco Fagiano, Ángel Baggini y los primeros directivos.',
  },
  {
    id: 'acta-005',
    numero_acta: 5,
    libro: 'Libro N° 1 de Actas',
    folio_inicio: 5,
    folio_fin: 5,
    pagina_archivo_inicio: 10,
    pagina_archivo_fin: 10,
    fecha: '1926-04-22',
    anio: 1926,
    titulo: 'Compra de Camisetas y Medias Oficiales, e Invitación al Club Berrotarán',
    tipo_reunion: 'Reunión de Comisión Directiva',
    lugar: 'Sala de Deliberaciones, Alcira Gigena',
    asistentes_count: 12,
    resumen:
      'Se aprueba la compra de las camisetas y pares de medias que faltaren para equipar a los planteles. Se encomienda cursar invitación formal al Club Berrotarán para jugar un partido de fútbol amistoso en el field local el 1º de Mayo.',
    transcripcion_completa: `[Página 10 - Folio 5 Debe]
Acta Nº 5
En Gigena a 22 de Abril de 1926, Reunidos en la sala de deliberaciones y en particular la comisión directiva, se resuelve y se aprueba lo siguiente:
1º Comprar las camisetas que faltaren hasta completar los equipos.
2º Adquirir los pares de medias necesarias hasta completar los equipos.
3º Pasar por intermedio de Secretaría una nota invitación al Club Berrotarán para que baje a nuestro field a disputar un match de foott-ball de carácter amistoso, el que en caso de afirmativa se llevará a cabo el día 1º de Mayo de cte año.
Habiendo asentimiento general de lo expuesto se resuelve levantar la sesión a tal efecto la presente, siendo las 23 horas del mismo día.
Comuníquese y dése al registro general. (Hay firmas)`,
    firmantes: [
      { nombre: 'Francisco Fagiano', cargo: 'Presidente' },
      { nombre: 'Ángel Baggini', cargo: 'Tesorero' },
      { nombre: 'Diego Peralta', cargo: 'Prosecretario' },
    ],
    temas_tratados: [
      'Compra de camisetas oficiales',
      'Compra de medias deportivas',
      'Invitación a Club Berrotarán para el 1º de Mayo',
    ],
    archivos: ['Libro Nb0 1-10.jpg'],
    imagenes_urls: ['/api/actas/image?file=Libro%20Nb0%201-10.jpg'],
    estado_conservacion: 'Excelente',
  },
  {
    id: 'acta-006',
    numero_acta: 6,
    libro: 'Libro N° 1 de Actas',
    folio_inicio: 5,
    folio_fin: 5,
    pagina_archivo_inicio: 11,
    pagina_archivo_fin: 11,
    fecha: '1926-06-17',
    anio: 1926,
    titulo: 'Convenio con Atlético Gigena, Refuerzos Deportivos y Festejos del 9 de Julio',
    tipo_reunion: 'Reunión de Comisión Directiva',
    lugar: 'Pueblo Alcira, F.C.C.A.',
    asistentes_count: 15,
    resumen:
      'Convenio con el Club Atlético Gigena para solicitar arpilleras de cerramiento de cancha. Organización de cotejo amistoso con la 2ª categoría de C.A.G. y pedido de dos jugadores (José y Ricardo Cornaglia) para reforzar el cuadro. Compra de 10 docenas de bombas de estruendo para el 9 de Julio y designación de Francisco Baggini para subasta pública del Buffet.',
    transcripcion_completa: `[Página 11 - Folio 5 Haber]
Acta Nº 6
En Gigena, Pueblo Alcira, F.C.C.A. a 17 de Junio de 1926, reunidos en asamblea ordinaria la C.D. del C. S. Dr. L. R. Se resuelve y aprueba lo siguiente:
1º Solicitar del Club A. Gigena las arpilleras y demás material que circunda la cancha de su procedencia como así la misma.
2º Invitar a los componentes de segunda categoría del C. A. G. a un match de football a disputarse el día 11 de Julio.
3º Solicitar del C. A. G. dos jugadores para integrar nuestro cuadro, ellos serán José y Ricardo Cornaglia.
4º Hacer entre los componentes de la comisión presente una subscripción para formar fondos.
5º Adquirir 10 docenas de bombas de estruendo para los festejos del 9 de Julio.
6º Queda designado el Sr Fco Baggini para que el día 20 del cte lleve a subasta pública del Buffet.`,
    firmantes: [
      { nombre: 'Francisco Fagiano', cargo: 'Presidente' },
      { nombre: 'Ángel Baggini', cargo: 'Tesorero' },
      { nombre: 'Francisco Baggini', cargo: 'Comisionado de Buffet' },
    ],
    temas_tratados: [
      'Préstamo de cerramiento con Club Atlético Gigena',
      'Partido amistoso para el 11 de Julio',
      'Refuerzos deportivos: José y Ricardo Cornaglia',
      'Festejos Patrios del 9 de Julio con bombas de estruendo',
      'Subasta pública del Buffet social',
    ],
    archivos: ['Libro Nb0 1-11.jpg'],
    imagenes_urls: ['/api/actas/image?file=Libro%20Nb0%201-11.jpg'],
    estado_conservacion: 'Excelente',
    es_destacada: true,
  },
  {
    id: 'acta-010',
    numero_acta: 'Cierre Libro 1',
    libro: 'Libro N° 1 de Actas',
    folio_inicio: 51,
    folio_fin: 51,
    pagina_archivo_inicio: 102,
    pagina_archivo_fin: 102,
    fecha: '1932-10-02',
    anio: 1932,
    titulo: 'Remate y Concesión Oficial del Bar Buffet del Club Roncedo',
    tipo_reunion: 'Reunión de Comisión Directiva',
    lugar: 'Gigena, Córdoba',
    asistentes_count: 5,
    resumen:
      'Reunión de comisionados del Club Roncedo (J. D. Fagiano, Carlos Acuña y Pedro Mellano) para llevar a cabo el remate público del Bar Buffet de la institución. Tras la lectura de las bases y condiciones, se adjudican los derechos al Sr. R. Gramajo previa aceptación del pliego.',
    transcripcion_completa: `[Página 102 - Folio 51 Debe]
En Gigena a 2 días del mes de Octubre de 1932, Reunidos los Sres J. D. Fagiano, Carlos Acuña y Pedro Mellano como miembros comisionados del Club Roncedo a los efectos de Rematar el Bar Buffet, cuyas bases fueron leídas y como no había más interesados que el Sr R. Gramajo al que se le adjudicaron los derechos previa aceptación del pliego de condiciones presentado.
Gigena Oct 2/32
(Firmas de J. D. Fagiano, Carlos Acuña, Pedro Mellano)`,
    firmantes: [
      { nombre: 'J. D. Fagiano', cargo: 'Comisionado' },
      { nombre: 'Carlos Acuña', cargo: 'Comisionado' },
      { nombre: 'Pedro Mellano', cargo: 'Comisionado' },
      { nombre: 'R. Gramajo', cargo: 'Adjudicatario Buffet' },
    ],
    temas_tratados: [
      'Remate y licitación del Bar Buffet',
      'Pliego de bases y condiciones',
      'Cierre del Libro N° 1 de Actas (1926-1932)',
    ],
    archivos: ['Libro Nb0 1-102.jpg'],
    imagenes_urls: ['/api/actas/image?file=Libro%20Nb0%201-102.jpg'],
    estado_conservacion: 'Excelente',
    es_destacada: true,
    notas_archivista: 'Último folio registrado en el Libro N° 1 de Actas.',
  },
];

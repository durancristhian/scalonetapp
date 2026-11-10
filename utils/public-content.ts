export const siteUrl = "https://www.scalonet.app";
export const publicContact = {
  name: "Cristhian Duran",
  email: "durancristhiandev@gmail.com",
};

export const publicPages = {
  "/about": {
    title: "Acerca de Scalonet.app",
    sections: [
      {
        title: "Equipos para el próximo partido",
        text: "Scalonet.app es una aplicación web creada por Cristhian Duran para organizar equipos de fútbol entre amigos. El organizador carga los nombres de los jugadores, decide quién juega con quién y guarda las formaciones para compartirlas con el grupo. Se puede trabajar desde el navegador, sin instalar una aplicación. La cuenta permite volver a los partidos guardados y seguir preparando la próxima fecha.",
      },
      {
        title: "Cómo se usa",
        text: "Cada partido tiene dos equipos y admite hasta 100 jugadores. Podés agregar nombres uno por uno o pegar una lista de hasta 50 por vez. La asignación puede ser manual, al azar o teniendo en cuenta nivel y posición. Los equipos pueden tener distinta cantidad de jugadores; también podés dejar jugadores libres. Al compartir, los libres no aparecen en las formaciones. Podés copiar los equipos como texto o descargar una imagen con avatares o fotos.",
      },
    ],
  },
  "/contact": {
    title: "Contacto",
    sections: [
      {
        title: "Consultas sobre la aplicación",
        text: "Scalonet.app es un proyecto de Cristhian Duran. Para consultas sobre el funcionamiento, problemas de acceso o preguntas sobre tus datos, usá el correo publicado al final de esta página. Contá qué intentabas hacer, en qué paso apareció el problema y si estabas usando un teléfono o una computadora. No envíes contraseñas, códigos de ingreso ni fotos de otras personas para describir un error.",
      },
      {
        title: "Feedback desde tu cuenta",
        text: "Si ya ingresaste a la aplicación, también podés usar la opción Feedback para enviar una sugerencia o informar un problema. Ese mensaje se envía al responsable del proyecto junto con el identificador y los correos de tu cuenta para dar contexto a la consulta. Para un problema visual, indicá el navegador y el tamaño aproximado de la pantalla. No hay un plazo de respuesta garantizado: el canal sirve para recibir consultas y sugerencias sobre Scalonet.app.",
      },
    ],
  },
  "/privacy": {
    title: "Privacidad",
    sections: [
      {
        title: "Cuenta y partidos",
        text: "Scalonet.app usa Clerk para gestionar el ingreso y las sesiones. La aplicación guarda el identificador de tu cuenta asociado a los partidos que creás. Cada partido puede incluir nombres, nivel, posición, avatares o fotos de jugadores y las asignaciones a los dos equipos. Estos datos permiten guardar los cambios, volver a abrir el partido y preparar las formaciones. Cargá solamente datos y fotos que tengas autorización para usar.",
      },
      {
        title: "Fotos y contenido compartido",
        text: "Las fotos que subís se almacenan mediante Vercel Blob. Las imágenes exportadas pueden incluir nombres y fotos: revisalas antes de compartirlas con otras personas. Quien recibe un texto o una imagen puede conservar una copia fuera de Scalonet.app. Evitá incluir información sensible en los nombres de los partidos o de los jugadores.",
      },
      {
        title: "Medición y consultas",
        text: "En Producción, la aplicación puede medir visitas y acciones de uso mediante Umami, como agregar jugadores o descargar una formación. La medición de acciones usa categorías y cantidades, sin enviar los nombres ni las fotos de los jugadores en sus propiedades. La opción Feedback envía tu mensaje, identificador y correos de la cuenta al responsable mediante Telegram. Para consultar sobre acceso o eliminación de datos, escribí al contacto publicado; no hay una eliminación automática de cuenta disponible en esta página.",
      },
    ],
  },
} as const;

export type PublicPath = keyof typeof publicPages;

export const homeDetails = [
  {
    title: "¿Para qué partidos sirve?",
    text: "Usá Scalonet.app para preparar el fútbol de la semana, organizar un amistoso o repartir un grupo de amigos en dos equipos. El organizador puede decidir cada asignación o probar una distribución al azar, por nivel y posición. Después puede ajustar los equipos antes de guardar. No hace falta que todos los jugadores tengan una cuenta: una persona carga la lista y comparte el resultado con el grupo.",
  },
  {
    title: "¿Cuántos jugadores puedo cargar?",
    text: "Cada partido admite hasta 100 jugadores. Podés agregarlos de a uno o pegar hasta 50 nombres por vez. Siempre hay dos equipos, pero pueden tener distinta cantidad de jugadores o estar incompletos. Si alguien todavía no tiene equipo, puede quedar libre dentro del partido. Esos jugadores siguen en la lista para que puedas asignarlos más adelante y no aparecen en la formación que compartís.",
  },
  {
    title: "¿Cómo guardo y comparto los equipos?",
    text: "Ingresá con tu cuenta para crear un partido y volver a encontrarlo después. Cargá los jugadores, armá las formaciones y guardá los cambios. Para pasarlas a tu grupo, copiá los equipos como texto o descargá una imagen. La vista previa permite revisar nombres, fotos, avatares y el fondo antes de descargar. También podés guardar o exportar equipos parciales mientras terminás de confirmar quiénes juegan.",
  },
  {
    title: "¿Qué necesito para empezar?",
    text: "Abrí Scalonet.app en el navegador y elegí Armar mi partido para ingresar. Tené a mano los nombres de quienes van a jugar; las fotos son opcionales. Podés editar la lista y cambiar las asignaciones mientras preparás el encuentro. Si necesitás ayuda con la cuenta, querés enviar una sugerencia o tenés una consulta sobre tus datos, encontrás los canales disponibles en Contacto y el detalle del tratamiento de datos en Privacidad.",
  },
];

export function pageMarkdown(path: PublicPath) {
  const page = publicPages[path];
  return `# ${page.title}\n\n${page.sections.map((section) => `## ${section.title}\n\n${section.text}`).join("\n\n")}\n\n${path === "/contact" ? "Correo: [${publicContact.email}](mailto:${publicContact.email})\n\n" : ""}[Inicio](/) · [Contacto](/contact) · [Privacidad](/privacy)\n`;
}

export const homeMarkdown = `# Scalonet.app — Armá equipos de fútbol\n\nCargá los jugadores, elegí quién juega con quién y compartí las formaciones con tu grupo.\n\n## Cómo funciona\n\n1. Agregá jugadores uno por uno o pegá una lista de nombres. Las fotos son opcionales.\n2. Armá dos equipos manualmente, al azar o por nivel y posición.\n3. Guardá las formaciones y compartilas como texto o imagen.\n\n${homeDetails.map((section) => `## ${section.title}\n\n${section.text}`).join("\n\n")}\n\n[Armar mi partido](/) · [Acerca de](/about) · [Contacto](/contact) · [Privacidad](/privacy)\n`;

export const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Scalonet.app",
  description:
    "Aplicación web para armar dos equipos de fútbol, guardar las formaciones y compartirlas como texto o imagen.",
  url: `${siteUrl}/`,
  applicationCategory: "SportsApplication",
  operatingSystem: "Web",
  inLanguage: "es",
  featureList: [
    "Asignación manual de jugadores",
    "Dos equipos por partido",
    "Exportación de formaciones como texto o imagen",
  ],
  author: {
    "@type": "Person",
    name: publicContact.name,
    email: publicContact.email,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "support",
      email: publicContact.email,
      availableLanguage: "es",
      url: `${siteUrl}/contact`,
    },
    url: "https://github.com/durancristhian",
  },
};

export class SeedResearchGroup {
  name: string;
  acronym: string; // ^[A-Z]{2,5}$
  maxMembers: number;
  /** Emails de estudiantes de seed-student.data.ts que pertenecerán al grupo */
  memberEmails: string[];
}

interface SeedResearchGroupData {
  researchGroups: SeedResearchGroup[];
}

export const researchGroupData: SeedResearchGroupData = {
  researchGroups: [
    {
      // Grupo LLENO (6/6): útil para probar el 409 de límite excedido
      name: 'Grupo de Investigación en Ingeniería de Software',
      acronym: 'GIIS',
      maxMembers: 6,
      memberEmails: [
        'valentina@gmail.com',
        'miguel@gmail.com',
        'mateo@gmail.com',
        'gabriela@gmail.com',
        'david@gmail.com',
        'catalina@gmail.com',
      ],
    },
    {
      name: 'Grupo de Física y Materiales',
      acronym: 'FISMA',
      maxMembers: 8,
      memberEmails: [
        'jonathan@gmail.com',
        'leidy@gmail.com',
        'laura@gmail.com',
        'tomas@gmail.com',
        'juliana@gmail.com',
        'luciana@gmail.com',
      ],
    },
    {
      // Grupo LLENO (7/7)
      name: 'Grupo de Biología y Biotecnología',
      acronym: 'BIOTEC',
      maxMembers: 7,
      memberEmails: [
        'sofia@gmail.com',
        'santiago@gmail.com',
        'sebastian@gmail.com',
        'camila@gmail.com',
        'diego@gmail.com',
        'sam@gmail.com',
        'robin@gmail.com',
      ],
    },
    {
      // Grupo LLENO (5/5)
      name: 'Grupo de Química Aplicada',
      acronym: 'QUIMA',
      maxMembers: 5,
      memberEmails: [
        'daniela@gmail.com',
        'juan.pablo@gmail.com',
        'esteban@gmail.com',
        'ariel@gmail.com',
        'alex@gmail.com',
      ],
    },
    {
      // Con cupo disponible (5/6)
      name: 'Grupo de Matemáticas Aplicadas',
      acronym: 'MATAP',
      maxMembers: 6,
      memberEmails: [
        'isabella@gmail.com',
        'mariana@gmail.com',
        'andres@gmail.com',
        'paula@gmail.com',
        'sara@gmail.com',
      ],
    },
    {
      // Grupo VACÍO: útil para probar asignaciones desde cero
      name: 'Grupo de Educación Física y Deporte',
      acronym: 'EDFIS',
      maxMembers: 3,
      memberEmails: [],
    },
  ],
};

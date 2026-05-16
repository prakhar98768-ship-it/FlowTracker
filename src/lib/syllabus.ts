import { SubjectId } from "./constants";

export interface ChapterInfo {
  name: string;
  subject: SubjectId;
  classNumber: 11 | 12;
}

export interface SubjectSyllabus {
  subject: SubjectId;
  label: string;
  class11: string[];
  class12: string[];
}

export const SYLLABUS: SubjectSyllabus[] = [
  {
    subject: "biology",
    label: "Biology",
    class11: [
      "The Living World",
      "Biological Classification",
      "Plant Kingdom",
      "Animal Kingdom",
      "Morphology of Flowering Plants",
      "Anatomy of Flowering Plants",
      "Structural Organisation in Animals",
      "Cell: The Unit of Life",
      "Biomolecules",
      "Cell Cycle and Cell Division",
      "Photosynthesis in Higher Plants",
      "Respiration in Plants",
      "Plant Growth and Development",
      "Breathing and Exchange of Gases",
      "Body Fluids and Circulation",
      "Excretory Products and Their Elimination",
      "Locomotion and Movement",
      "Neural Control and Coordination",
      "Chemical Coordination and Integration",
    ],
    class12: [
      "Sexual Reproduction in Flowering Plants",
      "Human Reproduction",
      "Reproductive Health",
      "Principles of Inheritance and Variation",
      "Molecular Basis of Inheritance",
      "Evolution",
      "Human Health and Diseases",
      "Microbes in Human Welfare",
      "Biotechnology: Principles and Processes",
      "Biotechnology and its Applications",
      "Organisms and Populations",
      "Ecosystem",
      "Biodiversity and Conservation",
    ],
  },
  {
    subject: "physics",
    label: "Physics",
    class11: [
      "Units and Measurements",
      "Motion in a Straight Line",
      "Motion in a Plane",
      "Laws of Motion",
      "Work, Energy, and Power",
      "System of Particles and Rotational Motion",
      "Gravitation",
      "Mechanical Properties of Solids",
      "Mechanical Properties of Fluids",
      "Thermal Properties of Matter",
      "Thermodynamics",
      "Kinetic Theory",
      "Oscillations",
      "Waves",
    ],
    class12: [
      "Electric Charges and Fields",
      "Electrostatic Potential and Capacitance",
      "Current Electricity",
      "Moving Charges and Magnetism",
      "Magnetism and Matter",
      "Electromagnetic Induction",
      "Alternating Current",
      "Electromagnetic Waves",
      "Ray Optics and Optical Instruments",
      "Wave Optics",
      "Dual Nature of Radiation and Matter",
      "Atoms",
      "Nuclei",
      "Semiconductor Electronics: Materials, Devices and Simple Circuits",
    ],
  },
  {
    subject: "chemistry",
    label: "Chemistry",
    class11: [
      "Some Basic Concepts of Chemistry",
      "Structure of Atom",
      "Classification of Elements and Periodicity in Properties",
      "Chemical Bonding and Molecular Structure",
      "Chemical Thermodynamics",
      "Equilibrium",
      "Redox Reactions",
      "Organic Chemistry: Some Basic Principles and Techniques",
      "Hydrocarbons",
    ],
    class12: [
      "Solutions",
      "Electrochemistry",
      "Chemical Kinetics",
      "p-Block Elements (Groups 13 to 18)",
      "d and f Block Elements",
      "Coordination Compounds",
      "Haloalkanes and Haloarenes",
      "Alcohols, Phenols, and Ethers",
      "Aldehydes, Ketones, and Carboxylic Acids",
      "Amines",
      "Biomolecules",
    ],
  },
];

// Flat list of all chapters for seeding
export function getAllChapters(): ChapterInfo[] {
  const chapters: ChapterInfo[] = [];
  for (const s of SYLLABUS) {
    for (const name of s.class11) {
      chapters.push({ name, subject: s.subject, classNumber: 11 });
    }
    for (const name of s.class12) {
      chapters.push({ name, subject: s.subject, classNumber: 12 });
    }
  }
  return chapters;
}

export const TOTAL_CHAPTERS = SYLLABUS.reduce(
  (sum, s) => sum + s.class11.length + s.class12.length,
  0
);

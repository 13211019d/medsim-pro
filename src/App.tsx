import React, { useState, useEffect, useRef } from 'react';
import {
  Stethoscope,
  MessageSquare,
  Activity,
  Brain,
  User,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Send,
  Heart,
  ArrowLeft,
  ClipboardList,
  X,
  Zap,
  ClipboardCheck,
  Microscope,
  Info,
  ShieldCheck,
  Droplet,
  Utensils,
  Activity as EndoIcon,
  Loader2,
  PlusSquare,
  FileHeart,
  Gauge,
  Flame,
  Skull,
  TrendingUp,
  BarChart3,
  Award,
  GraduationCap,
} from 'lucide-react';

// --- IMPORTS DE FIREBASE (Base de Datos y Memoria en la Nube) ---
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithCustomToken,
  signInAnonymously,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
} from 'firebase/firestore';

// =====================================================================
// 1. CONFIGURACIÓN DE FIREBASE (Para la memoria de los alumnos)
// =====================================================================
const firebaseConfig = {
  apiKey: 'AIzaSyBLqZr1Feedr41LnszAq_h0n7v5ZKXcZ3U',
  authDomain: 'medsim-pro-aaba3.firebaseapp.com',
  projectId: 'medsim-pro-aaba3',
  storageBucket: 'medsim-pro-aaba3.firebasestorage.app',
  messagingSenderId: '560405271772',
  appId: '1:560405271772:web:65991e0b0a2c16ec805019',
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'medsim-pro-id';

// =====================================================================
// 2. CONFIGURACIÓN DE GEMINI IA (El cerebro de la aplicación)
// Aquí la dejamos en blanco porque el entorno de pruebas inyecta la suya.
// Cuando subas la app a internet, pegarás la tuya aquí.
// =====================================================================
const apiKey = 'AIzaSyBps2wUxhyqGJBR0IZ2_vv2IeX9Mil2wxo';

// --- Iconos SVG ---
const LungsIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7 12c.5 0 2.5-.5 2.5-3.5S7.5 5 7 5s-2.5.5-2.5 3.5S6.5 12 7 12z" />
    <path d="M17 12c-.5 0-2.5-.5-2.5-3.5S16.5 5 17 5s2.5.5 2.5 3.5S17.5 12 17 12z" />
    <path d="M7 12c0 4.5 2 6 5 6s5-1.5 5-6" />
    <path d="M12 5v13" />
    <path d="M12 8l-3-2" />
    <path d="M12 8l3-2" />
  </svg>
);

const NeuroIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2a8 8 0 0 0-8 8c0 4.5 3 6.5 3 11h10c0-4.5 3-6.5 3-11a8 8 0 0 0-8-8z" />
    <path d="M9 21h6" />
    <path d="M12 6v6" />
    <path d="M12 16h.01" />
  </svg>
);

// --- BASE DE DATOS CLÍNICA ---
const MEDICAL_INDEX = {
  RESPIRATORIO: [
    'EPOC (Exacerbación Aguda)',
    'Neumonía Adquirida en la Comunidad',
    'Asma Bronquial (Crisis Severa)',
    'Derrame Pleural Paraneumónico',
    'Neumotórax Espontáneo Primario',
    'Tromboembolismo Pulmonar (TEP) Agudo',
  ],
  CARDIOVASCULAR: [
    'Síndrome Coronario Agudo (IAMCEST)',
    'Insuficiencia Cardíaca (Edema Agudo de Pulmón)',
    'Estenosis Aórtica Severa Sintomática',
    'Pericarditis Aguda',
    'Fibrilación Auricular (Respuesta Ventricular Rápida)',
    'Taponamiento Cardíaco',
  ],
  GASTROENTEROLOGIA: [
    'Hemorragia Digestiva Alta (Úlcera Péptica)',
    'Cirrosis Hepática Descompensada (Ascitis/Encefalopatía)',
    'Pancreatitis Aguda Biliar',
    'Colecistitis Aguda',
    'Enfermedad Inflamatoria Intestinal (Brote Severo)',
    'Isquemia Mesentérica Aguda',
  ],
  NEFROLOGIA: [
    'Lesión Renal Aguda (Necrosis Tubular Aguda)',
    'Síndrome Nefrótico',
    'Síndrome Nefrítico (Postinfecciosa)',
    'Pielonefritis Aguda Complicada',
    'Cólico Nefroureteral (Litiasis Renal)',
    'Hiperpotasemia Severa',
  ],
  NEUROLOGIA: [
    'Accidente Cerebrovascular (ACV) Isquémico Agudo',
    'Accidente Cerebrovascular (ACV) Hemorrágico',
    'Meningitis Bacteriana Aguda',
    'Estatus Epiléptico',
    'Síndrome de Guillain-Barré',
    'Miastenia Gravis (Crisis Miasténica)',
  ],
  ENDOCRINOLOGIA: [
    'Cetoacidosis Diabética (CAD)',
    'Estado Hiperosmolar Hiperglucémico (EHH)',
    'Hipoglucemia Severa',
    'Tormenta Tiroidea (Tirotoxicosis Aguda)',
    'Insuficiencia Suprarrenal Aguda (Crisis Addisoniana)',
    'Feocromocitoma (Crisis Hipertensiva)',
  ],
};

const getAllPathologies = () => {
  let all = [];
  Object.values(MEDICAL_INDEX).forEach((list) => {
    all = all.concat(list);
  });
  return all;
};

// CONEXIÓN DIRECTA A GEMINI (Sin bloqueo de seguridad local)
const fetchGemini = async (prompt, systemPrompt = '', isJson = false) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: isJson ? { responseMimeType: 'application/json' } : {},
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      (isJson ? '{}' : 'Error en la consulta.')
    );
  } catch (e) {
    return isJson ? '{}' : 'Error de red.';
  }
};

const App = () => {
  const [activeSystem, setActiveSystem] = useState('URGENCIAS');
  const [view, setView] = useState('dashboard');
  const [isLoadingDynamic, setIsLoadingDynamic] = useState(false);

  const [user, setUser] = useState(null);
  const [casesHistory, setCasesHistory] = useState([]);
  const [mentorFeedback, setMentorFeedback] = useState(null);
  const [isMentorLoading, setIsMentorLoading] = useState(false);

  const [activeCase, setActiveCase] = useState(null);
  const [difficulty, setDifficulty] = useState('media');
  const [caseStep, setCaseStep] = useState('anamnesis');
  const [examTab, setExamTab] = useState('inspeccion');
  const [chat, setChat] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [studyName, setStudyName] = useState('');
  const [studyJust, setStudyJust] = useState('');
  const [orderedStudies, setOrderedStudies] = useState([]);
  const [diagnostics, setDiagnostics] = useState([]);
  const [finalReport, setFinalReport] = useState('');
  const [evaluation, setEvaluation] = useState(null);

  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== 'undefined' &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error('Auth error:', error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const casesRef = collection(
      db,
      'artifacts',
      appId,
      'users',
      user.uid,
      'clinical_cases'
    );
    const unsubscribe = onSnapshot(
      casesRef,
      (snapshot) => {
        const history = [];
        snapshot.forEach((doc) => history.push({ id: doc.id, ...doc.data() }));
        history.sort((a, b) => b.timestamp - a.timestamp);
        setCasesHistory(history);
      },
      (error) => {
        console.error('Firestore error:', error);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const generatePatientDNA = () => {
    const age = Math.floor(Math.random() * (85 - 20) + 20);
    const isMale = Math.random() > 0.5;
    const names = isMale
      ? [
          'Sr. Roberto',
          'Don Carlos',
          'Joven Marcos',
          'Sr. Alberto',
          'Don Julio',
        ]
      : [
          'Sra. Carmen',
          'Doña Rosa',
          'Sra. Beatriz',
          'Joven Laura',
          'Doña Elena',
        ];
    const patientName = names[Math.floor(Math.random() * names.length)];
    const occupations = [
      'jubilado/a',
      'trabajador/a de la construcción',
      'oficinista',
      'chofer',
      'docente',
      'comerciante',
    ];
    const occupation =
      occupations[Math.floor(Math.random() * occupations.length)];
    const triggers = [
      'durante la madrugada',
      'después de un esfuerzo físico',
      'tras automedicarse por un cuadro viral',
      'de forma súbita mientras comía',
      'durante su jornada laboral',
      'luego de un evento muy estresante',
    ];
    const trigger = triggers[Math.floor(Math.random() * triggers.length)];
    return { patientName, age, isMale, occupation, trigger };
  };

  const startDynamicSimulation = async (pathology = null, diff = 'media') => {
    let diseaseName = pathology;
    setDifficulty(diff);

    if (!diseaseName) {
      if (activeSystem === 'URGENCIAS') {
        const allPathologies = getAllPathologies();
        diseaseName =
          allPathologies[Math.floor(Math.random() * allPathologies.length)];
      } else {
        const list = MEDICAL_INDEX[activeSystem];
        diseaseName = list[Math.floor(Math.random() * list.length)];
      }
    }

    setIsLoadingDynamic(true);
    setView('loading_case');

    const dna = generatePatientDNA();
    let difficultyInstruction = '';
    if (diff === 'baja')
      difficultyInstruction =
        "Genera un caso 'de libro', presentación muy típica. Fácil de diagnosticar.";
    else if (diff === 'media')
      difficultyInstruction =
        'Genera un caso realista. Algún síntoma puede ser atípico o tener un distractor menor de acuerdo a su edad.';
    else if (diff === 'avanzada')
      difficultyInstruction =
        'NIVEL EXPERTO. El paciente tiene la patología principal PERO COEXISTE O SE COMPLICA con una patología aguda grave de otro sistema. El examen físico debe mostrar signos de ambas.';

    const systemInstruction = `Eres un creador de casos clínicos universitarios. La fisiopatología debe ser fiel al Manual MSD. CREA UN CASO ÚNICO Y DIFERENTE A CUALQUIER OTRO BASADO EN LA SEMILLA ALEATORIA.`;

    const prompt = `Genera un caso clínico agudo para la patología principal: ${diseaseName}.
    DIFICULTAD REQUERIDA: ${difficultyInstruction}
    INSTRUCCIONES DEL PACIENTE (USA ESTOS DATOS):
    Nombre: ${dna.patientName} | Edad: ${dna.age} | Ocupación: ${dna.occupation} | Inicio: ${dna.trigger}
    
    Devuelve un objeto JSON con las siguientes claves exactas:
    {
      "nombre_enfermedad": "Diagnóstico Real completo (Si es avanzada, incluye la complicación)",
      "anamnesis_detallada": "Relato en 3ra persona integrando su edad, ocupación y el contexto de inicio",
      "inspeccion": "Hallazgos de inspección general",
      "palpacion": "Hallazgos de palpación",
      "percusion": "Hallazgos de percusión",
      "auscultacion": "Auscultación y/o examen neurológico/abdominal",
      "estudios_clave": "Hallazgos exactos en Lab, Rx, EKG, etc.",
      "tratamiento_msd": "Pautas de tratamiento inicial según MSD"
    }`;

    const resRaw = await fetchGemini(prompt, systemInstruction, true);

    try {
      const generatedCase = JSON.parse(
        resRaw.replace(/```json/g, '').replace(/```/g, '')
      );
      setActiveCase({
        ...generatedCase,
        patientName: dna.patientName,
        age: dna.age,
        nivel: diff,
      });
      setChat([
        {
          role: 'patient',
          content: `Doctor/a, soy ${dna.patientName}... me siento muy mal, empezó ${dna.trigger} y ya no aguanto.`,
        },
      ]);
      setOrderedStudies([]);
      setDiagnostics([]);
      setFinalReport('');
      setEvaluation(null);
      setCaseStep('anamnesis');
      setView('simulation');
    } catch (e) {
      alert(
        'Error al conectar con la base de datos clínica. Intenta de nuevo.'
      );
      setView('dashboard');
    }
    setIsLoadingDynamic(false);
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isAiLoading) return;
    const msg = userInput;
    setUserInput('');
    setChat([...chat, { role: 'user', content: msg }]);
    setIsAiLoading(true);

    const sys = `Eres el paciente ${activeCase.patientName}. Diagnóstico secreto: ${activeCase.nombre_enfermedad}. TUS SÍNTOMAS (Basados en MSD): ${activeCase.anamnesis_detallada}. Responde con lenguaje coloquial. NUNCA digas tu diagnóstico.`;
    const res = await fetchGemini(msg, sys);
    setChat((prev) => [...prev, { role: 'patient', content: res }]);
    setIsAiLoading(false);
  };

  const handleRequestStudy = async () => {
    if (!studyName.trim() || !studyJust.trim() || isAiLoading) return;
    setIsAiLoading(true);

    const sys = `Eres Jefe de Diagnóstico. Evalúa si "${studyName}" es útil para un paciente con: ${activeCase.nombre_enfermedad} según MSD. HALLAZGOS REALES: ${activeCase.estudios_clave}. Responde JSON: { "status": "aprobado"|"rechazado", "feedback": "explicación académica", "resultado": "hallazgo técnico si es aprobado" }`;
    const resRaw = await fetchGemini(
      `Solicitud: ${studyName} Justificación: ${studyJust}`,
      sys,
      true
    );

    try {
      const res = JSON.parse(
        resRaw.replace(/```json/g, '').replace(/```/g, '')
      );
      setOrderedStudies([
        { name: studyName, justificacion: studyJust, ...res },
        ...orderedStudies,
      ]);
      setStudyName('');
      setStudyJust('');
    } catch (e) {}
    setIsAiLoading(false);
  };

  const submitDiagnosis = async () => {
    setIsAiLoading(true);

    const userQuestions = chat
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join(' | ');
    const userStudies = orderedStudies
      .map((s) => `${s.name} (Justificó: ${s.justificacion})`)
      .join(' | ');
    const userDifferentials = diagnostics.join(', ');

    const sys = `Eres un Catedrático evaluando a un alumno basándote ESTRICTAMENTE en el Manual MSD. Responde obligatoriamente en JSON con esta estructura exacta:
    {
      "puntaje": "Número del 0 al 100",
      "feedback_anamnesis": "Breve crítica de sus preguntas.",
      "feedback_estudios": "Breve crítica de sus estudios pedidos y justificaciones.",
      "feedback_diagnostico": "Breve crítica de sus diagnósticos diferenciales y tratamiento final.",
      "mejoras_msd": "Consejo concreto de estudio basado en el Manual MSD."
    }`;

    const prompt = `DATOS DEL CASO REAL:
    Patología: ${activeCase.nombre_enfermedad}
    Tratamiento MSD: ${activeCase.tratamiento_msd}

    DESEMPEÑO DEL ALUMNO A EVALUAR:
    Preguntas hechas: ${userQuestions || 'Ninguna.'}
    Estudios solicitados: ${userStudies || 'Ninguno.'}
    Diferenciales anotados: ${userDifferentials || 'Ninguno.'}
    Informe Final: ${finalReport}`;

    const resRaw = await fetchGemini(prompt, sys, true);
    try {
      const evalJson = JSON.parse(
        resRaw.replace(/```json/g, '').replace(/```/g, '')
      );
      setEvaluation(evalJson);

      if (user) {
        const casesRef = collection(
          db,
          'artifacts',
          appId,
          'users',
          user.uid,
          'clinical_cases'
        );
        await addDoc(casesRef, {
          timestamp: Date.now(),
          disease: activeCase.nombre_enfermedad,
          difficulty: activeCase.nivel,
          score: parseInt(evalJson.puntaje),
          feedback_anamnesis: evalJson.feedback_anamnesis,
          feedback_estudios: evalJson.feedback_estudios,
          feedback_diagnostico: evalJson.feedback_diagnostico,
          report: finalReport,
        });
      }
    } catch (e) {
      setEvaluation({
        puntaje: 0,
        feedback_anamnesis: 'Error al procesar la evaluación.',
        feedback_estudios: 'Error al procesar.',
        feedback_diagnostico: 'Hubo un error de conexión al evaluar el caso.',
        mejoras_msd: 'Por favor, vuelve a intentarlo más tarde.',
      });
    }
    setIsAiLoading(false);
  };

  const requestMentorAnalysis = async () => {
    setIsMentorLoading(true);
    const recentCases = casesHistory
      .slice(0, 10)
      .map(
        (c) =>
          `Caso: ${c.disease} (Dificultad: ${c.difficulty}). Puntaje: ${c.score}/100. Falla Diagnóstico: ${c.feedback_diagnostico}. Falla Estudios: ${c.feedback_estudios}.`
      )
      .join('\n\n');

    const prompt = `Eres el Director de la Residencia Médica. El alumno solicita un análisis de su desempeño histórico para mejorar.
    
    HISTORIAL RECIENTE DEL ALUMNO:
    ${recentCases || 'Aún no ha resuelto casos suficientes.'}
    
    Analiza este historial y redacta un informe 1 a 1. Identifica fortalezas y debilidades. Proporciona un plan de estudio basado en el Manual MSD. Sé alentador pero muy analítico.`;

    const res = await fetchGemini(
      prompt,
      'Eres un mentor médico. Responde en formato de texto bien estructurado y motivador, dirigiéndote al alumno en segunda persona (tú).'
    );
    setMentorFeedback(res);
    setIsMentorLoading(false);
  };

  const getDifficultyColor = (diff) => {
    if (diff === 'baja') return 'text-green-500 bg-green-100 border-green-200';
    if (diff === 'media') return 'text-amber-500 bg-amber-100 border-amber-200';
    if (diff === 'avanzada') return 'text-red-500 bg-red-100 border-red-200';
    return 'text-blue-500 bg-blue-100 border-blue-200';
  };

  const getScoreColor = (score) => {
    const s = parseInt(score);
    if (s >= 80) return 'text-green-500';
    if (s >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const calculateAverage = () => {
    if (casesHistory.length === 0) return 0;
    const sum = casesHistory.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(sum / casesHistory.length);
  };

  const SystemIcons = {
    URGENCIAS: <PlusSquare size={20} className="text-red-400" />,
    RESPIRATORIO: <LungsIcon size={20} />,
    CARDIOVASCULAR: <Heart size={20} />,
    GASTROENTEROLOGIA: <Utensils size={20} />,
    NEFROLOGIA: <Droplet size={20} />,
    NEUROLOGIA: <NeuroIcon size={20} />,
    ENDOCRINOLOGIA: <EndoIcon size={20} />,
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden font-sans text-slate-900">
      {/* SIDEBAR NAVIGATION */}
      <nav className="w-20 lg:w-[280px] bg-slate-900 text-white flex flex-col p-4 lg:p-6 z-30 shadow-2xl shrink-0">
        <div
          className="flex items-center space-x-3 mb-10 cursor-pointer"
          onClick={() => setView('dashboard')}
        >
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg">
            <FileHeart size={24} className="text-white" />
          </div>
          <h1 className="font-black tracking-tighter text-2xl hidden lg:block uppercase italic">
            MedSim <span className="text-blue-400 text-sm">PRO</span>
          </h1>
        </div>

        <div className="space-y-6 overflow-y-auto pr-2 pb-6 flex-1 custom-scrollbar">
          <div>
            <span className="hidden lg:block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">
              Hospital General
            </span>
            <button
              onClick={() => {
                setActiveSystem('URGENCIAS');
                setView('dashboard');
              }}
              className={`w-full flex items-center space-x-4 px-4 py-4 rounded-2xl text-[12px] font-black transition-all border border-transparent ${
                activeSystem === 'URGENCIAS' && view !== 'performance'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-xl'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <PlusSquare
                size={20}
                className={
                  activeSystem === 'URGENCIAS' && view !== 'performance'
                    ? 'text-red-400'
                    : ''
                }
              />
              <span className="hidden lg:block tracking-widest uppercase text-left">
                Guardia Central
              </span>
            </button>
            <button
              onClick={() => setView('performance')}
              className={`mt-2 w-full flex items-center space-x-4 px-4 py-4 rounded-2xl text-[12px] font-black transition-all border border-transparent ${
                view === 'performance'
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-xl'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart3
                size={20}
                className={view === 'performance' ? 'text-purple-400' : ''}
              />
              <span className="hidden lg:block tracking-widest uppercase text-left">
                Mi Desempeño
              </span>
            </button>
          </div>
          <div className="h-px bg-slate-800 w-full rounded-full hidden lg:block" />
          <div>
            <span className="hidden lg:block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">
              Especialidades
            </span>
            <div className="space-y-2">
              {Object.keys(MEDICAL_INDEX).map((sys) => (
                <button
                  key={sys}
                  onClick={() => {
                    setActiveSystem(sys);
                    setView('dashboard');
                  }}
                  className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl text-[11px] font-black transition-all ${
                    activeSystem === sys && view !== 'performance'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {SystemIcons[sys]}
                  <span className="hidden lg:block tracking-widest uppercase text-left">
                    {sys}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* LOADING */}
        {view === 'loading_case' && (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 animate-in fade-in">
            <div className="w-28 h-28 bg-white border-4 border-blue-100 text-blue-600 rounded-[3rem] flex items-center justify-center mb-8 shadow-2xl">
              <Loader2 size={56} className="animate-spin text-blue-600" />
            </div>
            <h2 className="text-4xl font-black mb-4 tracking-tighter text-slate-800">
              Preparando Paciente...
            </h2>
          </div>
        )}

        {/* DASHBOARD */}
        {view === 'dashboard' && (
          <div className="p-8 lg:p-16 xl:p-20 w-full max-w-7xl mx-auto animate-in fade-in duration-500 overflow-y-auto">
            <header className="mb-16">
              <span
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block ${
                  activeSystem === 'URGENCIAS'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-blue-100 text-blue-600'
                }`}
              >
                {activeSystem === 'URGENCIAS'
                  ? 'Medicina Interna Global'
                  : 'Rotación de Especialidad'}
              </span>
              <h2 className="text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tighter italic">
                {activeSystem === 'URGENCIAS'
                  ? 'Guardia Central'
                  : `Pabellón de ${activeSystem}`}
              </h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {activeSystem === 'URGENCIAS' ? (
                <div
                  onClick={() => setView('difficulty_selection')}
                  className="bg-slate-900 text-white p-12 lg:p-16 rounded-[4rem] shadow-2xl hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden group"
                >
                  <PlusSquare
                    className="text-red-500 mb-8 relative z-10"
                    size={64}
                  />
                  <h3 className="text-4xl font-black mb-6 relative z-10">
                    Configurar Turno
                  </h3>
                  <span className="bg-red-600 px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg relative z-10">
                    Elegir Dificultad
                  </span>
                </div>
              ) : (
                <>
                  <div
                    onClick={() => setView('difficulty_selection')}
                    className="bg-slate-900 text-white p-12 lg:p-16 rounded-[4rem] shadow-2xl hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden group"
                  >
                    <Activity
                      size={64}
                      className="text-blue-400 mb-8 relative z-10"
                    />
                    <h3 className="text-4xl font-black mb-4 relative z-10">
                      Guardia de {activeSystem}
                    </h3>
                    <span className="bg-blue-600 px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg relative z-10">
                      Turno Aleatorio
                    </span>
                  </div>
                  <div
                    onClick={() => setView('selection')}
                    className="bg-white p-12 lg:p-16 rounded-[4rem] border-2 border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-500 transition-all cursor-pointer group"
                  >
                    <Microscope size={64} className="text-blue-600 mb-8" />
                    <h3 className="text-4xl font-black mb-4">
                      Catálogo Clínico
                    </h3>
                    <p className="text-slate-400 font-medium text-lg leading-relaxed">
                      Selecciona una patología específica del catálogo.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* PERFORMANCE / MENTORÍA */}
        {view === 'performance' && (
          <div className="p-8 lg:p-16 max-w-6xl mx-auto w-full animate-in slide-in-from-bottom-10 overflow-y-auto">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-5xl font-black tracking-tighter italic text-slate-900">
                  Mi Desempeño Clínico
                </h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">
                  Expediente Médico de Residencia
                </p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm text-center min-w-[150px]">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Promedio General
                </span>
                <span
                  className={`text-4xl font-black tracking-tighter ${getScoreColor(
                    calculateAverage()
                  )}`}
                >
                  {calculateAverage()}
                  <span className="text-xl text-slate-300">/100</span>
                </span>
              </div>
            </div>

            <div className="bg-purple-900 text-white p-10 lg:p-12 rounded-[4rem] shadow-2xl relative overflow-hidden mb-12">
              <div className="relative z-10">
                <h3 className="text-3xl font-black mb-4 flex items-center">
                  <GraduationCap className="mr-4 text-purple-400" size={32} />{' '}
                  Análisis de Mentoría 1 a 1
                </h3>
                {!mentorFeedback ? (
                  <button
                    onClick={requestMentorAnalysis}
                    disabled={isMentorLoading || casesHistory.length === 0}
                    className="bg-purple-600 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg hover:bg-purple-500 transition-colors disabled:opacity-50"
                  >
                    {isMentorLoading
                      ? 'Analizando Historial...'
                      : casesHistory.length > 0
                      ? 'Solicitar Análisis de IA'
                      : 'Resuelve al menos 1 caso primero'}
                  </button>
                ) : (
                  <div className="bg-white/10 border border-white/20 p-8 rounded-[2.5rem] mt-6 backdrop-blur-sm">
                    <div className="prose prose-invert prose-lg font-medium leading-relaxed max-w-none">
                      {mentorFeedback}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-2xl font-black mb-6 text-slate-800 tracking-tighter">
              Historial de Casos Guardados ({casesHistory.length})
            </h3>
            <div className="space-y-4">
              {casesHistory.length === 0 ? (
                <div className="bg-white p-10 rounded-[3rem] border border-dashed border-slate-200 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  Sin historial.
                </div>
              ) : (
                casesHistory.map((c, i) => (
                  <div
                    key={i}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-6"
                  >
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-black uppercase tracking-tighter">
                          {c.disease}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${getDifficultyColor(
                            c.difficulty
                          )}`}
                        >
                          {c.difficulty}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-400">
                        {new Date(c.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div
                      className={`text-3xl font-black tracking-tighter ${getScoreColor(
                        c.score
                      )}`}
                    >
                      {c.score}
                      <span className="text-sm text-slate-300">pts</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* DIFFICULTY */}
        {view === 'difficulty_selection' && (
          <div className="p-8 lg:p-16 max-w-6xl mx-auto w-full animate-in slide-in-from-bottom-10 flex flex-col h-full overflow-y-auto">
            <button
              onClick={() => setView('dashboard')}
              className="mb-10 flex items-center text-slate-400 hover:text-slate-900 font-black text-xs uppercase tracking-[0.3em] transition shrink-0"
            >
              <ArrowLeft size={16} className="mr-3" /> Volver
            </button>
            <h2 className="text-5xl lg:text-6xl font-black mb-12 tracking-tighter italic shrink-0">
              Nivel de Dificultad
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
              <div
                onClick={() => startDynamicSimulation(null, 'baja')}
                className="bg-white p-10 rounded-[3rem] border-4 border-green-50 shadow-sm hover:border-green-300 hover:shadow-2xl transition-all cursor-pointer"
              >
                <div className="bg-green-100 text-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
                  <Gauge size={32} />
                </div>
                <h3 className="text-2xl font-black mb-2">Residente 1er Año</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-green-500 mb-6 block">
                  Dificultad Baja
                </span>
              </div>
              <div
                onClick={() => startDynamicSimulation(null, 'media')}
                className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl hover:-translate-y-2 transition-all cursor-pointer"
              >
                <div className="bg-amber-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
                  <Flame size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-black mb-2">Residente Avanzado</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-6 block">
                  Dificultad Media
                </span>
              </div>
              <div
                onClick={() => startDynamicSimulation(null, 'avanzada')}
                className="bg-white p-10 rounded-[3rem] border-4 border-red-50 shadow-sm hover:border-red-400 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="bg-red-100 text-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
                  <Skull size={32} />
                </div>
                <h3 className="text-2xl font-black mb-2">Médico de Planta</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-6 block">
                  Multimorbilidad
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SELECTION (Especialidades) */}
        {view === 'selection' && activeSystem !== 'URGENCIAS' && (
          <div className="p-10 lg:p-20 max-w-6xl mx-auto w-full animate-in slide-in-from-bottom-10 flex flex-col h-full">
            <button
              onClick={() => setView('dashboard')}
              className="mb-10 flex items-center text-slate-400 hover:text-slate-900 font-black text-xs uppercase tracking-[0.3em] transition shrink-0"
            >
              <ArrowLeft size={16} className="mr-3" /> Volver
            </button>
            <h2 className="text-5xl lg:text-6xl font-black mb-12 tracking-tighter italic shrink-0">
              Catálogo {activeSystem}
            </h2>
            <div className="bg-white p-10 lg:p-12 rounded-[4rem] border-4 border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
              <div className="space-y-3 overflow-y-auto pr-4 flex-1 pb-4 custom-scrollbar">
                {MEDICAL_INDEX[activeSystem].map((p, i) => (
                  <button
                    key={i}
                    onClick={() => startDynamicSimulation(p, 'media')}
                    className="w-full text-left p-5 rounded-2xl bg-slate-50 border-2 border-slate-50 hover:border-blue-500 hover:bg-white font-bold text-[15px] transition-all flex justify-between items-center text-slate-700"
                  >
                    {p}{' '}
                    <ChevronRight
                      className="text-blue-500 opacity-50"
                      size={20}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SIMULATION */}
        {view === 'simulation' && activeCase && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden animate-in fade-in duration-700">
            <div className="flex-1 flex flex-col bg-white min-w-0">
              <div className="p-6 bg-slate-50 border-b flex flex-wrap lg:flex-nowrap justify-between items-center z-10 shadow-sm gap-4">
                <div className="flex items-center space-x-5 shrink-0">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-blue-600">
                    <User size={28} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-black text-slate-800 text-lg uppercase tracking-tighter truncate max-w-[150px]">
                        {activeCase.patientName}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${getDifficultyColor(
                          activeCase.nivel
                        )}`}
                      >
                        Nivel: {activeCase.nivel}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {activeCase.age} años
                    </p>
                  </div>
                </div>

                <div className="flex bg-white p-1.5 rounded-[2rem] border shadow-inner overflow-x-auto w-full lg:w-auto custom-scrollbar">
                  {[
                    {
                      id: 'anamnesis',
                      label: 'Anamnesis',
                      icon: <MessageSquare size={16} />,
                    },
                    {
                      id: 'fisico',
                      label: 'E. Físico',
                      icon: <Stethoscope size={16} />,
                    },
                    {
                      id: 'estudios',
                      label: 'Estudios',
                      icon: <Microscope size={16} />,
                    },
                    {
                      id: 'diagnostico',
                      label: 'Diagnóstico',
                      icon: <ClipboardCheck size={16} />,
                    },
                  ].map((step) => (
                    <button
                      key={step.id}
                      onClick={() => setCaseStep(step.id)}
                      className={`flex items-center space-x-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                        caseStep === step.id
                          ? 'bg-slate-900 text-white shadow-lg'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {step.icon}{' '}
                      <span className="hidden sm:block tracking-tighter">
                        {step.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-slate-50/50">
                {caseStep === 'anamnesis' && (
                  <div className="max-w-4xl mx-auto h-full flex flex-col space-y-6">
                    <div className="flex-1 bg-white rounded-[3rem] border border-slate-200 p-6 lg:p-10 overflow-y-auto space-y-6 shadow-sm min-h-[400px]">
                      {chat.map((m, i) => (
                        <div
                          key={i}
                          className={`flex ${
                            m.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[85%] p-5 lg:p-6 rounded-[2rem] text-[15px] leading-relaxed shadow-sm font-medium ${
                              m.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'
                            }`}
                          >
                            {m.content}
                          </div>
                        </div>
                      ))}
                      {isAiLoading && (
                        <div className="bg-slate-100 p-4 rounded-full w-14 flex justify-center animate-pulse">
                          <Loader2
                            size={20}
                            className="animate-spin text-slate-400"
                          />
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    <form
                      onSubmit={handleChat}
                      className="flex space-x-3 bg-white p-2.5 rounded-[3rem] shadow-xl border border-slate-100 shrink-0"
                    >
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Interroga al paciente..."
                        className="flex-1 p-5 rounded-full outline-none text-base font-bold placeholder:font-medium placeholder:text-slate-400 min-w-0"
                      />
                      <button
                        disabled={isAiLoading || !userInput.trim()}
                        className="bg-blue-600 text-white p-5 rounded-full hover:bg-blue-700 transition shadow-lg disabled:opacity-50 shrink-0"
                      >
                        <Send size={24} />
                      </button>
                    </form>
                  </div>
                )}

                {caseStep === 'fisico' && (
                  <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in">
                    <div className="flex space-x-2 bg-white p-2 rounded-full w-fit mx-auto border shadow-sm overflow-x-auto max-w-full">
                      {[
                        'inspeccion',
                        'palpacion',
                        'percusion',
                        'auscultacion',
                      ].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setExamTab(tab)}
                          className={`px-6 lg:px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${
                            examTab === tab
                              ? 'bg-slate-900 text-white shadow-md'
                              : 'text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    <div className="bg-white rounded-[4rem] border border-slate-200 p-10 lg:p-20 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
                      <div className="bg-blue-50 w-28 h-28 rounded-full flex items-center justify-center mb-10 shadow-inner">
                        <Activity size={56} className="text-blue-600" />
                      </div>
                      <h3 className="text-3xl lg:text-4xl font-black uppercase mb-8 text-slate-800 tracking-tighter">
                        {examTab}
                      </h3>
                      <div className="bg-slate-50 p-8 lg:p-12 rounded-[3rem] border-2 border-dashed border-slate-200 w-full">
                        <p className="text-lg lg:text-xl text-slate-700 font-bold italic leading-relaxed">
                          "{activeCase[examTab] || 'Hallazgo normal.'}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {caseStep === 'estudios' && (
                  <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-6">
                    <div className="bg-white p-10 lg:p-12 rounded-[3.5rem] border border-slate-200 shadow-sm">
                      <h3 className="text-2xl font-black mb-8 flex items-center tracking-tighter">
                        <Microscope className="mr-3 text-blue-600" />{' '}
                        Paraclínica
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <input
                          type="text"
                          value={studyName}
                          onChange={(e) => setStudyName(e.target.value)}
                          placeholder="Estudio sugerido..."
                          className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                        />
                        <input
                          type="text"
                          value={studyJust}
                          onChange={(e) => setStudyJust(e.target.value)}
                          placeholder="Justificación fisiopatológica..."
                          className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        />
                      </div>
                      <button
                        onClick={handleRequestStudy}
                        disabled={isAiLoading || !studyName || !studyJust}
                        className="w-full py-6 bg-slate-900 text-white font-black rounded-[2rem] uppercase tracking-widest text-xs hover:bg-blue-600 transition shadow-xl disabled:opacity-30"
                      >
                        {isAiLoading ? 'Autorizando...' : 'Firmar Solicitud'}
                      </button>
                    </div>
                    <div className="space-y-6">
                      {orderedStudies.map((s, i) => (
                        <div
                          key={i}
                          className={`p-8 lg:p-10 rounded-[3.5rem] border-2 shadow-sm ${
                            s.status === 'aprobado'
                              ? 'bg-white border-green-100'
                              : 'bg-red-50 border-red-100'
                          }`}
                        >
                          <div className="flex items-center space-x-4 mb-6">
                            <div
                              className={`p-3 rounded-[1.2rem] ${
                                s.status === 'aprobado'
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-red-100 text-red-600'
                              }`}
                            >
                              {s.status === 'aprobado' ? (
                                <CheckCircle2 size={28} />
                              ) : (
                                <AlertCircle size={28} />
                              )}
                            </div>
                            <span className="font-black text-xl uppercase tracking-tighter text-slate-800">
                              {s.name}
                            </span>
                          </div>
                          <p className="text-base text-slate-600 mb-6 font-medium italic">
                            Reporte: "{s.feedback}"
                          </p>
                          {s.status === 'aprobado' && (
                            <div className="p-8 bg-slate-900 rounded-[2.5rem] font-mono text-sm text-green-400 shadow-xl border border-white/10 leading-relaxed overflow-x-auto">
                              {s.resultado}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {caseStep === 'diagnostico' && !evaluation && (
                  <div className="max-w-4xl mx-auto space-y-10 animate-in zoom-in-95">
                    <div className="bg-slate-900 text-white p-10 lg:p-16 rounded-[4rem] shadow-2xl relative overflow-hidden">
                      <h3 className="text-4xl font-black mb-10 text-center tracking-tighter">
                        Conclusión del Caso
                      </h3>
                      <div className="space-y-8 relative z-10">
                        <textarea
                          value={finalReport}
                          onChange={(e) => setFinalReport(e.target.value)}
                          className="w-full h-56 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-lg focus:ring-4 focus:ring-blue-500/20 outline-none transition font-medium placeholder:text-slate-400"
                          placeholder="Redacte el diagnóstico de certeza, diferenciales y plan de tratamiento..."
                        />
                        <button
                          onClick={submitDiagnosis}
                          disabled={isAiLoading || !finalReport.trim()}
                          className="w-full py-7 bg-blue-600 text-white font-black rounded-[2.5rem] hover:bg-blue-500 transition shadow-xl uppercase tracking-[0.2em] text-xs disabled:opacity-50"
                        >
                          {isAiLoading
                            ? 'Evaluando Desempeño...'
                            : 'Entregar Informe Final'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {caseStep === 'diagnostico' && evaluation && (
                  <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-10 space-y-8">
                    <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-xl text-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-3 bg-blue-600" />
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-4">
                        Calificación Clínica Final
                      </h3>
                      <div
                        className={`text-8xl font-black tracking-tighter ${getScoreColor(
                          evaluation.puntaje
                        )} mb-4`}
                      >
                        {evaluation.puntaje}
                        <span className="text-4xl text-slate-300">/100</span>
                      </div>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                        Evaluación Catedrática
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-blue-50 p-10 rounded-[3rem] border border-blue-100">
                        <h4 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center">
                          <MessageSquare size={18} className="mr-2" />{' '}
                          Interrogatorio
                        </h4>
                        <p className="text-blue-900 font-medium leading-relaxed">
                          {evaluation.feedback_anamnesis}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-10 rounded-[3rem] border border-purple-100">
                        <h4 className="text-sm font-black text-purple-600 uppercase tracking-widest mb-4 flex items-center">
                          <Microscope size={18} className="mr-2" /> Manejo
                          Paraclínico
                        </h4>
                        <p className="text-purple-900 font-medium leading-relaxed">
                          {evaluation.feedback_estudios}
                        </p>
                      </div>
                      <div className="bg-amber-50 p-10 rounded-[3rem] border border-amber-100 lg:col-span-2">
                        <h4 className="text-sm font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center">
                          <Brain size={18} className="mr-2" /> Diagnóstico y
                          Conducta
                        </h4>
                        <p className="text-amber-900 font-medium leading-relaxed text-lg">
                          {evaluation.feedback_diagnostico}
                        </p>
                      </div>
                      <div className="bg-slate-900 text-white p-10 rounded-[3rem] lg:col-span-2 shadow-2xl">
                        <h4 className="text-sm font-black text-green-400 uppercase tracking-widest mb-4 flex items-center">
                          <TrendingUp size={18} className="mr-2" /> Pauta de
                          Mejora MSD
                        </h4>
                        <p className="text-slate-300 font-medium leading-relaxed italic">
                          "{evaluation.mejoras_msd}"
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setView('dashboard')}
                      className="w-full py-6 bg-blue-600 text-white font-black rounded-[2rem] hover:bg-blue-700 transition uppercase tracking-widest text-xs shadow-xl"
                    >
                      Cerrar Rotación y Volver
                    </button>
                  </div>
                )}
              </div>
            </div>

            <aside className="w-full lg:w-[350px] xl:w-[400px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col shadow-2xl z-20 shrink-0">
              <div className="p-8 border-b border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">
                  <ClipboardList
                    className="inline mr-2 text-blue-500"
                    size={16}
                  />{' '}
                  Bloc Quirúrgico
                </h3>
                <input
                  type="text"
                  placeholder="Añadir diferencial..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      setDiagnostics([...diagnostics, e.target.value.trim()]);
                      e.target.value = '';
                    }
                  }}
                  className="w-full text-xs p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
                <div className="flex flex-wrap gap-3 mt-6">
                  {diagnostics.length === 0 && (
                    <p className="text-[10px] text-slate-300 font-bold italic">
                      Sin diferenciales
                    </p>
                  )}
                  {diagnostics.map((d, i) => (
                    <div
                      key={i}
                      className="bg-slate-800 text-white px-4 py-2 rounded-xl text-[10px] font-black flex items-center"
                    >
                      {d}{' '}
                      <X
                        size={14}
                        className="ml-3 cursor-pointer text-slate-400 hover:text-white"
                        onClick={() =>
                          setDiagnostics(
                            diagnostics.filter((_, idx) => idx !== i)
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

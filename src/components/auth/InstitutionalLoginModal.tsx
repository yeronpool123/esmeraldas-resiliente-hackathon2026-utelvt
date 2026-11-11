import { type FormEvent, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EntidadCoe, RolUsuario } from '../../types';
import { DEMO_COE_IDENTIFIER, DEMO_PASSWORD } from '../../lib/demoAuth';

interface InstitutionalLoginModalProps {
  role: Exclude<RolUsuario, 'CIUDADANO'> | null;
  onClose: () => void;
  onSuccess: () => void;
}

const roleDetails = {
  OPERADOR_COE: {
    title: 'Acceso de operaciones COE',
    description: 'Ingresa con la cuenta institucional autorizada para consultar y coordinar operaciones.',
  },
  ADMIN: {
    title: 'Acceso de administración',
    description: 'Ingresa con la cuenta institucional autorizada para gestionar la plataforma.',
  },
} as const;

const COE_ENTITIES = [
  { id: 'SNGR', name: 'Gestión de Riesgos', detail: 'Secretaría Nacional de Gestión de Riesgos', color: 'border-amber-200 bg-amber-50 text-amber-950', dot: 'bg-amber-500' },
  { id: 'GAD_MUNICIPAL', name: 'GAD Municipal', detail: 'Municipio de Esmeraldas', color: 'border-emerald-200 bg-emerald-50 text-emerald-950', dot: 'bg-emerald-600' },
  { id: 'GAD_PROVINCIAL', name: 'GAD Provincial', detail: 'Prefectura de Esmeraldas', color: 'border-teal-200 bg-teal-50 text-teal-950', dot: 'bg-teal-600' },
  { id: 'POLICIA_NACIONAL', name: 'Policía Nacional', detail: 'Seguridad ciudadana y control', color: 'border-blue-200 bg-blue-50 text-blue-950', dot: 'bg-blue-700' },
  { id: 'FUERZAS_ARMADAS', name: 'Fuerzas Armadas', detail: 'Apoyo operativo y logístico', color: 'border-lime-200 bg-lime-50 text-lime-950', dot: 'bg-lime-700' },
  { id: 'BOMBEROS', name: 'Cuerpo de Bomberos', detail: 'Respuesta y rescate', color: 'border-red-200 bg-red-50 text-red-950', dot: 'bg-red-600' },
  { id: 'ECU_911', name: 'ECU 911', detail: 'Coordinación de atención de emergencias', color: 'border-orange-200 bg-orange-50 text-orange-950', dot: 'bg-orange-600' },
  { id: 'MSP', name: 'Salud · MSP', detail: 'Atención prehospitalaria y salud', color: 'border-cyan-200 bg-cyan-50 text-cyan-950', dot: 'bg-cyan-700' },
  { id: 'MIES', name: 'MIES', detail: 'Protección y asistencia social', color: 'border-violet-200 bg-violet-50 text-violet-950', dot: 'bg-violet-700' },
  { id: 'MTOP', name: 'MTOP', detail: 'Infraestructura y movilidad', color: 'border-slate-200 bg-slate-100 text-slate-900', dot: 'bg-slate-600' },
] as const;

export function InstitutionalLoginModal({ role, onClose, onSuccess }: InstitutionalLoginModalProps) {
  const { iniciarSesion, demoAuthEnabled } = useApp();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const identifierRef = useRef<HTMLInputElement>(null);
  const firstEntityRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [entity, setEntity] = useState<EntidadCoe | null>(null);
  const [step, setStep] = useState<'entities' | 'credentials'>('credentials');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!role) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    setEntity(null);
    setPassword(demoAuthEnabled ? DEMO_PASSWORD : '');
    setError('');
    setIdentifier(demoAuthEnabled
      ? role === 'ADMIN' ? 'admin@esmeraldas.gob.ec' : DEMO_COE_IDENTIFIER
      : role === 'ADMIN' ? 'admin_sistema' : 'operador_coe');
    setStep(role === 'OPERADOR_COE' ? 'entities' : 'credentials');
    dialog.showModal();
    const frame = window.requestAnimationFrame(() => {
      setVisible(true);
      if (role === 'OPERADOR_COE') firstEntityRef.current?.focus();
      else identifierRef.current?.focus();
    });
    return () => {
      window.cancelAnimationFrame(frame);
      if (dialog.open) dialog.close();
    };
  }, [role, demoAuthEnabled]);

  if (!role) return null;

  const closeModal = () => {
    if (submitting) return;
    setVisible(false);
    window.setTimeout(onClose, 180);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await iniciarSesion(identifier.trim(), password, role, entity);
      setPassword('');
      setVisible(false);
      window.setTimeout(onSuccess, 180);
    } catch (reason) {
      setError(
        reason instanceof TypeError
          ? 'No se pudo conectar con FastAPI. Verifica que el backend esté iniciado.'
          : reason instanceof Error
            ? reason.message
            : 'No se pudo verificar el acceso institucional.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="institutional-login-title"
      aria-describedby="institutional-login-description"
      className="institutional-login-dialog"
      onCancel={event => {
        event.preventDefault();
        closeModal();
      }}
      onClick={event => {
        if (event.target === dialogRef.current) closeModal();
      }}
    >
      <section
        className={`institutional-login-panel mx-auto w-full max-w-[30rem] rounded-3xl border border-white/60 bg-white p-6 shadow-2xl transition duration-200 sm:p-8 ${
          visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-[0.98] opacity-0'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-900">
              <ShieldCheck aria-hidden="true" className="h-6 w-6" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-800">
                ESMERALDAS RESILIENTE
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">Identidad institucional requerida</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            disabled={submitting}
            aria-label="Cerrar ventana de acceso"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 disabled:cursor-wait disabled:opacity-50"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <h2 id="institutional-login-title" className="mt-7 text-2xl font-extrabold tracking-tight text-slate-950">
          {role === 'OPERADOR_COE' && step === 'entities' ? 'Selecciona tu entidad COE' : roleDetails[role].title}
        </h2>
        <p id="institutional-login-description" className="mt-2 text-sm leading-6 text-slate-600">
          {role === 'OPERADOR_COE' && step === 'entities'
            ? 'Elige la institución desde la que participas en la coordinación del COE.'
            : role === 'OPERADOR_COE' && entity
              ? `Acceso compartido de coordinación · ${COE_ENTITIES.find(item => item.id === entity)?.name}.`
              : roleDetails[role].description}
        </p>

        {demoAuthEnabled && (
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-950">
          Modo de demostración local: acepta cualquier usuario y contraseña no vacíos. La sesión queda guardada solo en esta pestaña; no autentica con FastAPI ni debe usarse en producción.
        </p>
        )}

        {role === 'OPERADOR_COE' && step === 'entities' ? (
          <div className="mt-6">
            <div className="grid gap-2 sm:grid-cols-2">
              {COE_ENTITIES.map((option, index) => (
                <button
                  type="button"
                  key={option.id}
                  ref={index === 0 ? firstEntityRef : undefined}
                  onClick={() => {
                    setEntity(option.id);
                    setStep('credentials');
                    setError('');
                    window.requestAnimationFrame(() => identifierRef.current?.focus());
                  }}
                  className={`flex min-h-[72px] items-center gap-3 rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${option.color}`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/80">
                    <Building2 aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block text-xs">{option.name}</strong>
                    <span className="mt-0.5 block text-[10px] leading-4 opacity-75">{option.detail}</span>
                  </span>
                  <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${option.dot}`} />
                </button>
              ))}
            </div>
            <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] leading-5 text-slate-600">
              La composición de los COE puede variar según el nivel, el evento y las disposiciones vigentes.
              Esta selección organiza el perfil de la interfaz; no verifica afiliación institucional.
            </p>
          </div>
        ) : (
        <form className="mt-6 space-y-4" onSubmit={submit}>
          {role === 'OPERADOR_COE' && entity && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
              <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-emerald-950">
                <BadgeCheck aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span className="truncate">{COE_ENTITIES.find(item => item.id === entity)?.name}</span>
              </span>
              <button
                type="button"
                onClick={() => setStep('entities')}
                className="shrink-0 rounded-md px-2 py-1 text-[10px] font-bold text-emerald-800 underline underline-offset-2 hover:text-emerald-950"
              >
                Cambiar
              </button>
            </div>
          )}
          <label className="block text-xs font-semibold text-slate-800" htmlFor="institutional-identifier">
            Correo o identificador institucional
            <span className="relative mt-1.5 block">
              <KeyRound aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={identifierRef}
                id="institutional-identifier"
                name="username"
                type="text"
                autoComplete="username"
                maxLength={254}
                required
                value={identifier}
                onChange={event => setIdentifier(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
                placeholder="Correo o alias autorizado"
              />
            </span>
          </label>

          <label className="block text-xs font-semibold text-slate-800" htmlFor="institutional-password">
            Contraseña
            <span className="relative mt-1.5 block">
              <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="institutional-password"
                name="password"
                type="password"
                autoComplete="current-password"
                maxLength={72}
                required
                value={password}
                onChange={event => setPassword(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
                placeholder="Ingresa tu contraseña"
              />
            </span>
          </label>

          {error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-800">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || (role === 'OPERADOR_COE' && !entity)}
            className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? 'Ingresando…' : demoAuthEnabled ? 'Entrar a la demostración' : 'Verificar y continuar'}
            {!submitting && <ArrowRight aria-hidden="true" className="h-4 w-4" />}
          </button>
        </form>
        )}

        <p className="mt-5 text-center text-[11px] leading-5 text-slate-500">
          {demoAuthEnabled
            ? 'La selección de entidad organiza la vista; no verifica afiliación institucional.'
            : role === 'OPERADOR_COE'
            ? 'Todas las entidades usan el acceso COE universal definido para esta instalación.'
            : 'El acceso se valida en el servidor. No compartas tus credenciales institucionales.'}
        </p>
      </section>
    </dialog>
  );
}

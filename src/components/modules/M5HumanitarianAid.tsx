/**
 * ESMERALDAS RESILIENTE 2026 - Módulo M5: Familias Afectadas y Asistencia Humanitaria
 * Protección de datos LOPDP (Ecuador), inventario y entregas transaccionales ACID
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { enmascararNombre, enmascararTelefono } from '../../lib/geo';
import {
  Package,
  Users,
  Shield,
  Plus,
  Send,
  Eye,
  EyeOff,
  History,
} from 'lucide-react';
import { TipoItemInventario } from '../../types';

export function M5HumanitarianAid() {
  const {
    familias,
    inventario,
    entregas,
    registrarNuevaFamilia,
    hacerEntregaHumanitaria,
    usuario,
  } = useApp();

  // Estado de visibilidad de datos personales (LOPDP)
  const [desenmascararLOPDP, setDesenmascararLOPDP] = useState<boolean>(false);

  // Formulario nueva familia
  const [modalFamiliaAbierto, setModalFamiliaAbierto] = useState<boolean>(false);
  const [jefeHogar, setJefeHogar] = useState<string>('');
  const [telefonoContacto, setTelefonoContacto] = useState<string>('');
  const [numIntegrantes, setNumIntegrantes] = useState<number>(4);
  const [necesidades, setNecesidades] = useState<string[]>(['AGUA', 'ALIMENTOS']);

  // Formulario de entrega
  const [familiaSeleccionadaId, setFamiliaSeleccionadaId] = useState<number>(familias[0]?.id || 1);
  const [itemSeleccionado, setItemSeleccionado] = useState<TipoItemInventario>('AGUA_POTABLE');
  const [cantidadEntrega, setCantidadEntrega] = useState<number>(2);

  // Toggle de necesidades
  const toggleNecesidad = (nec: string) => {
    setNecesidades(prev =>
      prev.includes(nec) ? prev.filter(n => n !== nec) : [...prev, nec]
    );
  };

  const handleCrearFamilia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jefeHogar.trim()) return;

    registrarNuevaFamilia({
      jefe_hogar: jefeHogar,
      telefono_contacto: telefonoContacto || '0991112229',
      numero_integrantes: numIntegrantes,
      necesidades_prioritarias: necesidades,
      estado: 'REGISTRADA',
      ubicacion: [0.9430, -79.6680],
    });

    setJefeHogar('');
    setTelefonoContacto('');
    setNumIntegrantes(4);
    setModalFamiliaAbierto(false);
  };

  const handleHacerEntrega = (e: React.FormEvent) => {
    e.preventDefault();
    hacerEntregaHumanitaria(familiaSeleccionadaId, itemSeleccionado, cantidadEntrega);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Encabezado del Módulo y Nota LOPDP con fondo blanco limpio */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
              MÓDULO M5 (SHOULD)
            </span>
            <span className="text-xs text-slate-500">Ley Orgánica de Protección de Datos Personales (LOPDP Ecuador)</span>
          </div>
          <h2 className="text-xl font-heading font-extrabold text-slate-900 mt-1">
            Censo de Familias Afectadas y Asistencia Humanitaria
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Registro con minimización de datos y despacho de kits con control transaccional ACID.
          </p>
        </div>

        {/* Toggle de Cumplimiento LOPDP */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
            <Shield className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xs">
            <div className="font-semibold text-slate-900">Protección LOPDP</div>
            <div className="text-[10px] text-slate-500">
              {desenmascararLOPDP ? 'Datos descifrados (operador)' : 'Seudonimizado activo'}
            </div>
          </div>
          {usuario.rol !== 'CIUDADANO' && (
            <button
              onClick={() => setDesenmascararLOPDP(!desenmascararLOPDP)}
              className="ml-2 p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs flex items-center gap-1 transition-colors shadow-xs"
              title="Alternar seudonimización de nombres y teléfonos"
            >
              {desenmascararLOPDP ? <EyeOff className="w-3.5 h-3.5 text-amber-700" /> : <Eye className="w-3.5 h-3.5 text-emerald-700" />}
            </button>
          )}
        </div>
      </div>

      {/* Grid: Inventario de Suministros (Kits, Agua, Medicinas) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {inventario.map(item => (
          <div key={item.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">{item.tipo_item.replace(/_/g, ' ')}</span>
              <Package className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-mono-num font-extrabold text-[#064e3b]">
              {item.stock} <span className="text-xs font-normal text-slate-500">unid.</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{item.descripcion}</p>
          </div>
        ))}
      </div>

      {/* Grid: Censo de Familias y Despacho Transaccional */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tabla Censal con Enmascaramiento LOPDP */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-700" />
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Familias Censadas en Territorio ({familias.length})
              </h3>
            </div>

            {usuario.rol !== 'CIUDADANO' && (
              <button
                onClick={() => setModalFamiliaAbierto(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#064e3b] hover:bg-[#065f46] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Censar Nueva Familia</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {familias.map(fam => {
              const nombreMostrar = desenmascararLOPDP ? fam.jefe_hogar : enmascararNombre(fam.jefe_hogar);
              const telefonoMostrar = desenmascararLOPDP ? fam.telefono_contacto : enmascararTelefono(fam.telefono_contacto);

              return (
                <div key={fam.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 text-sm">{nombreMostrar}</strong>
                      <span className="text-[11px] font-mono-num text-slate-500">({telefonoMostrar})</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        fam.estado === 'EVACUADA' ? 'bg-red-100 text-red-800 border border-red-200' :
                        fam.estado === 'ALBERGADA' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {fam.estado}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700">
                      Integrantes: <strong className="text-slate-900">{fam.numero_integrantes} personas</strong>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-500 font-medium">Necesidades:</span>
                      {fam.necesidades_prioritarias.map(nec => (
                        <span key={nec} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {nec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono-num text-right shrink-0">
                    Censada: {new Date(fam.creado_en).toLocaleTimeString('es-EC')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel Despacho de Asistencia (ACID) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Formulario de Entrega Transaccional */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Package className="w-5 h-5 text-emerald-700" />
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Despacho de Kits (ACID)
              </h3>
            </div>

            <form onSubmit={handleHacerEntrega} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Familia Beneficiaria</label>
                <select
                  value={familiaSeleccionadaId}
                  onChange={e => setFamiliaSeleccionadaId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:ring-1 focus:ring-emerald-600 focus:bg-white outline-none"
                >
                  {familias.map(f => (
                    <option key={f.id} value={f.id}>
                      {desenmascararLOPDP ? f.jefe_hogar : enmascararNombre(f.jefe_hogar)} ({f.numero_integrantes} personas)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Suministro</label>
                <select
                  value={itemSeleccionado}
                  onChange={e => setItemSeleccionado(e.target.value as TipoItemInventario)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:ring-1 focus:ring-emerald-600 focus:bg-white outline-none"
                >
                  <option value="KIT_ALIMENTOS">Kit Alimentos (Stock: {inventario.find(i=>i.tipo_item==='KIT_ALIMENTOS')?.stock})</option>
                  <option value="AGUA_POTABLE">Agua Potable 20L (Stock: {inventario.find(i=>i.tipo_item==='AGUA_POTABLE')?.stock})</option>
                  <option value="KIT_MEDICINAS">Kit Medicinas (Stock: {inventario.find(i=>i.tipo_item==='KIT_MEDICINAS')?.stock})</option>
                  <option value="KIT_ASEO">Kit Aseo (Stock: {inventario.find(i=>i.tipo_item==='KIT_ASEO')?.stock})</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cantidad a Entregar</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={cantidadEntrega}
                  onChange={e => setCantidadEntrega(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono-num text-xs focus:ring-1 focus:ring-emerald-600 focus:bg-white outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#064e3b] hover:bg-[#065f46] text-white font-heading font-bold text-xs tracking-wide shadow flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Registrar Entrega Transaccional</span>
              </button>

              <p className="text-[10px] text-slate-500 italic">
                Prueba de consistencia ACID: Si intenta despachar más del stock disponible, el sistema emitirá un error 409 y cancelará la operación.
              </p>
            </form>
          </div>

          {/* Historial de Entregas Realizadas */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <History className="w-4 h-4 text-emerald-700" />
              <h4 className="font-heading font-bold text-xs text-slate-900">
                Entregas Auditadas ({entregas.length})
              </h4>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {entregas.map(ent => (
                <div key={ent.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900">{ent.tipo_item.replace(/_/g, ' ')} ({ent.cantidad} unid.)</strong>
                    <span className="text-[10px] font-mono-num text-emerald-700 font-bold">ENTREGADA</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Para: <span className="text-slate-900 font-medium">{desenmascararLOPDP ? ent.familia_nombre : enmascararNombre(ent.familia_nombre)}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                    <span>Por: {ent.entregado_por}</span>
                    <span>{new Date(ent.creado_en).toLocaleTimeString('es-EC')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Censo Familia */}
      {modalFamiliaAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <h3 className="font-heading font-bold text-base text-slate-900">
              Censo de Familia Afectada (El Niño 2026)
            </h3>

            <form onSubmit={handleCrearFamilia} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Jefe/a de Hogar</label>
                <input
                  type="text"
                  value={jefeHogar}
                  onChange={e => setJefeHogar(e.target.value)}
                  placeholder="ej. Manuel Caicedo"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:ring-1 focus:ring-emerald-600 focus:bg-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={telefonoContacto}
                    onChange={e => setTelefonoContacto(e.target.value)}
                    placeholder="099XXXXXXX"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:ring-1 focus:ring-emerald-600 focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Integrantes</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={numIntegrantes}
                    onChange={e => setNumIntegrantes(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:ring-1 focus:ring-emerald-600 focus:bg-white outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Necesidades Inmediatas</label>
                <div className="flex flex-wrap gap-1.5">
                  {['AGUA', 'ALIMENTOS', 'MEDICINAS', 'ABRIGO', 'ASEO', 'EVACUACION'].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => toggleNecesidad(n)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        necesidades.includes(n)
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-500 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalFamiliaAbierto(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#064e3b] hover:bg-[#065f46] text-white text-xs font-bold shadow"
                >
                  Guardar en Censo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition, TransitionChild } from "@headlessui/react";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { useDashboardTheme } from "../../context/DashboardThemeContext";
import { getUser } from "../../utils/auth";

export default function SurveyModal({
  isOpen,
  onClose,
  congressId,
  courseId,
  programTitle,
  congressTitle,
  onSuccess,
}) {
  const { isDark } = useDashboardTheme();
  const user = getUser();
  const effectiveTitle = programTitle || congressTitle || "Programa Académico";

  // Calificaciones Likert (1 a 5)
  const [q1, setQ1] = useState(5); // Calidad de los contenidos académicos y docentes
  const [q2, setQ2] = useState(5); // Organización, puntualidad y logística
  const [q3, setQ3] = useState(5); // Aplicabilidad profesional de los conocimientos adquiridos
  const [comments, setComments] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQ1(5);
      setQ2(5);
      setQ3(5);
      setComments("");
      setError(null);
      setSubmitted(false);
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!congressId && !courseId) {
      setError("No se ha identificado el programa académico a evaluar.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");

      const payload = {
        q1_rating: Number(q1),
        q2_rating: Number(q2),
        q3_rating: Number(q3),
        q1_score: Number(q1),
        q2_score: Number(q2),
        q3_score: Number(q3),
        comments: comments.trim(),
        id_user_platform: user?.id || null,
      };

      const targetUrl = congressId
        ? `${API_URL}/congresses/${congressId}/survey`
        : `${API_URL}/courses/${courseId}/survey`;

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let msg = "No se pudo registrar la encuesta de evaluación.";
        try {
          const data = await response.json();
          if (data?.detail) msg = data.detail;
        } catch {
          // fallback msg
        }
        throw new Error(msg);
      }

      setSubmitted(true);
      if (onSuccess) {
        onSuccess();
      }
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Error al enviar la evaluación CACES.");
    } finally {
      setLoading(false);
    }
  };

  const questions = [
    {
      id: "q1",
      number: 1,
      title: "Calidad de ponentes y contenidos académicos",
      desc: "Claridad pedagógica, rigor científico y dominio técnico de los conferencistas.",
      value: q1,
      setValue: setQ1,
    },
    {
      id: "q2",
      number: 2,
      title: "Organización, puntualidad y logística",
      desc: "Gestión de horarios, plataforma tecnológica y soporte durante el evento.",
      value: q2,
      setValue: setQ2,
    },
    {
      id: "q3",
      number: 3,
      title: "Aplicabilidad profesional de los conocimientos",
      desc: "Relevancia directa de las competencias adquiridas para su ejercicio profesional.",
      value: q3,
      setValue: setQ3,
    },
  ];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={loading ? () => {} : onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          {/* Bottom Sheet en móviles (<640px) y centrado en sm+ */}
          <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={`w-full max-w-xl transform overflow-hidden rounded-t-2xl sm:rounded-2xl text-left align-middle shadow-2xl transition-all border max-h-[92vh] sm:max-h-[90vh] flex flex-col ${
                  isDark
                    ? "bg-[#16161a] border-white/[0.08] text-zinc-100"
                    : "bg-white border-black/[0.08] text-zinc-900"
                }`}
              >
                {/* Indicador táctil para Bottom Sheet en móvil */}
                <div className="sm:hidden w-12 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

                {/* Cabecera limpia y jerárquica (sin badges decorativos sobre el h2) */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.06] shrink-0">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      Evaluación de Calidad Académica CACES
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-xs sm:max-w-md">
                      {effectiveTitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="w-11 h-11 sm:w-8 sm:h-8 inline-flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                    aria-label="Cerrar modal"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {submitted ? (
                  <div className="p-8 text-center space-y-4 my-auto">
                    <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircleIcon className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                        ¡Evaluación Registrada con Éxito!
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                        Agradecemos su participación. Sus respuestas contribuyen a la acreditación continua y aseguramiento de la calidad académica según los estándares CACES.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="min-h-[44px] px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#00345e] hover:bg-[#002747] transition-all cursor-pointer"
                    >
                      Entendido
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
                    {error && (
                      <div className="p-3 rounded-lg text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 border border-rose-500/20">
                        {error}
                      </div>
                    )}

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      Por favor, califique cada criterio del 1 al 5 según su nivel de satisfacción (1: Insuficiente, 5: Excelente).
                    </p>

                    {/* Las 3 preguntas Likert */}
                    <div className="space-y-4">
                      {questions.map((q) => (
                        <div
                          key={q.id}
                          className={`p-3.5 sm:p-4 rounded-xl border transition-colors ${
                            isDark
                              ? "bg-zinc-900/50 border-white/[0.06]"
                              : "bg-zinc-50/70 border-black/[0.06]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {q.number}. {q.title}
                              </h3>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                {q.desc}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-[#00345e] dark:text-blue-400 shrink-0">
                              {q.value} / 5
                            </span>
                          </div>

                          {/* Estrellas con diana táctil >= 44x44px */}
                          <div className="flex items-center gap-1 sm:gap-2 pt-1" role="radiogroup" aria-label={q.title}>
                            {[1, 2, 3, 4, 5].map((star) => {
                              const isSelected = star <= q.value;
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => q.setValue(star)}
                                  className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00345e] dark:focus:ring-blue-400"
                                  aria-label={`Calificar con ${star} de 5 estrellas`}
                                  aria-checked={q.value === star}
                                  role="radio"
                                >
                                  {isSelected ? (
                                    <StarSolid className="w-6 h-6 text-amber-400 drop-shadow-xs" />
                                  ) : (
                                    <StarOutline className="w-6 h-6 text-zinc-300 dark:text-zinc-600 hover:text-amber-300" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Comentarios y sugerencias */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="caces-comments"
                        className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                      >
                        Comentarios u observaciones para mejora continua (opcional)
                      </label>
                      <textarea
                        id="caces-comments"
                        rows={3}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Escriba aquí sus comentarios respecto a la organización o sugerencias de nuevos temas..."
                        className={`w-full text-xs sm:text-sm p-3 rounded-xl border focus:ring-2 focus:ring-[#00345e] focus:outline-none transition-colors resize-none ${
                          isDark
                            ? "bg-zinc-800/80 border-white/[0.1] text-zinc-100 placeholder-zinc-500"
                            : "bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400"
                        }`}
                      />
                    </div>

                    {/* Botones de acción */}
                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
                      <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className={`w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                          isDark
                            ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-white/10"
                            : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200"
                        }`}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#00345e] hover:bg-[#002747] active:bg-[#001f38] transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Enviando Encuesta...</span>
                          </>
                        ) : (
                          <span>Enviar Evaluación CACES</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

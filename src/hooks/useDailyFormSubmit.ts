"use client";

import { useCallback, useEffect, useState } from "react";
import {
  api,
  ApiError,
  type DailyForm,
  type DailyFormShift,
  type DailyFormType,
  type Sede,
  type ValidationErrorDetail,
} from "@/lib/api";

// Estado y lógica compartida por las 10 páginas de src/app/formatos/*: todas
// postean a POST /daily-forms/:formType con el mismo body base
// ({ sedeId, formDate, shift?, observations?, payload }) y necesitan la misma
// selección de sede + manejo de éxito/error (incluyendo `details` de
// validación del payload por tipo). Cada página solo aporta su `payload`.
export function useDailyFormSubmit(formType: DailyFormType) {
  const [sedes, setSedes] = useState<Sede[] | null>(null);
  const [sedesError, setSedesError] = useState<string | null>(null);
  const [sedeId, setSedeId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationDetails, setValidationDetails] = useState<ValidationErrorDetail[] | null>(null);

  const loadSedes = useCallback(async () => {
    try {
      const data = await api.get<Sede[]>("/sedes");
      setSedes(data);
      if (data.length === 1) setSedeId(data[0].id);
      setSedesError(null);
    } catch (err) {
      setSedesError(err instanceof ApiError ? err.message : "No se pudieron cargar las sedes.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadSedes();
    })();
  }, [loadSedes]);

  const submit = useCallback(
    async (input: { formDate: string; shift?: DailyFormShift | ""; observations?: string; payload: Record<string, unknown> }) => {
      if (!sedeId) {
        setSaveState("error");
        setErrorMessage("Selecciona una sede antes de guardar.");
        setValidationDetails(null);
        return false;
      }

      setIsSubmitting(true);
      setSaveState("idle");
      setErrorMessage(null);
      setValidationDetails(null);

      try {
        await api.post<{ dailyForm: DailyForm }>(`/daily-forms/${formType}`, {
          sedeId,
          formDate: input.formDate,
          shift: input.shift || undefined,
          observations: input.observations || undefined,
          payload: input.payload,
        });
        setSaveState("success");
        return true;
      } catch (err) {
        setSaveState("error");
        if (err instanceof ApiError) {
          if (err.status === 404) {
            setErrorMessage("La sede seleccionada ya no es válida. Actualiza la página e intenta de nuevo.");
          } else {
            setErrorMessage(err.message);
          }
          setValidationDetails(err.details ?? null);
        } else {
          setErrorMessage("No se pudo guardar el registro.");
        }
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [sedeId, formType],
  );

  const showSedeSelector = (sedes?.length ?? 0) > 1;

  return {
    sedes,
    sedesError,
    sedeId,
    setSedeId,
    showSedeSelector,
    isSubmitting,
    saveState,
    errorMessage,
    validationDetails,
    submit,
  };
}

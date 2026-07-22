import { useMemo, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { formatDateBR } from "@/lib/barbershop";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

/** Date -> "YYYY-MM-DD" no fuso local (evita deslocamento de um dia). */
function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Seletor de data (Popover + Calendar, pt-BR). Bloqueia datas passadas e,
 * quando `workingDays` é informado, os dias da semana fora de funcionamento.
 *
 * @param {string} value data selecionada em "YYYY-MM-DD" ("" quando vazio)
 * @param {(iso: string) => void} onChange callback com a data em "YYYY-MM-DD"
 * @param {number[] | null} workingDays dias de funcionamento (0=Dom ... 6=Sáb)
 * @param {boolean} allowPast permite selecionar datas passadas (padrão: false)
 * @param {string} placeholder texto quando nenhuma data está selecionada
 * @param {string} className classes extras para o gatilho
 */
export function DatePicker({
  value,
  onChange,
  workingDays = null,
  allowPast = false,
  placeholder = "Selecione a data",
  className = "",
}) {
  const [open, setOpen] = useState(false);

  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const disabledMatchers = useMemo(() => {
    const matchers = [];
    if (!allowPast) matchers.push({ before: startOfToday });
    if (workingDays) {
      const closed = ALL_DAYS.filter((d) => !workingDays.includes(d));
      if (closed.length) matchers.push({ dayOfWeek: closed });
    }
    return matchers;
  }, [workingDays, allowPast, startOfToday]);

  const selectedDate = value ? new Date(value + "T00:00:00") : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`input-premium flex w-full items-center justify-between text-left ${className}`}
        >
          <span className={value ? "" : "text-muted-foreground"}>
            {value ? formatDateBR(value) : placeholder}
          </span>
          <CalendarIcon className="h-4 w-4 text-gold" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={ptBR}
          selected={selectedDate}
          onSelect={(d) => {
            if (d) {
              onChange(toISODate(d));
              setOpen(false);
            }
          }}
          disabled={disabledMatchers}
          startMonth={allowPast ? undefined : startOfToday}
          defaultMonth={selectedDate ?? startOfToday}
        />
      </PopoverContent>
    </Popover>
  );
}

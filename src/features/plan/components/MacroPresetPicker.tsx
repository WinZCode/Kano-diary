/*
 * Chọn kiểu chia macro (giống các tab của calculator.net) — radio thật, mỗi lựa chọn hiện P/C/F gram.
 */
import type { MacroPreset } from "@/constants/nutrition";
import type { MacroOption } from "@/lib/calc";
import { formatInteger } from "@/lib/utils/format";

type MacroPresetPickerProps = {
  options: readonly MacroOption[];
  selected: MacroPreset | undefined;
  error?: string;
};

export function MacroPresetPicker({ options, selected, error }: MacroPresetPickerProps) {
  return (
    <fieldset className="grid gap-2" aria-describedby={error ? "macroPreset-error" : undefined}>
      <legend className="mb-1 font-label text-label font-bold text-on-surface-variant">Kiểu chia macro</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <label key={option.preset} className="relative">
            <input
              type="radio"
              name="macroPreset"
              value={option.preset}
              defaultChecked={option.preset === selected}
              className="peer sr-only"
            />
            <span className="flex min-h-11 cursor-pointer flex-col gap-1 border-2 border-outline bg-surface-container p-3 transition-colors duration-100 hover:bg-surface-high peer-checked:bg-primary peer-checked:text-on-primary peer-checked:shadow-pixel-sm peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
              <span className="font-headline text-sm font-bold">{option.label}</span>
              <span className="font-label text-label tabular-nums">
                P {formatInteger(option.macros.proteinG)} g · C {formatInteger(option.macros.carbG)} g · F{" "}
                {formatInteger(option.macros.fatG)} g
              </span>
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id="macroPreset-error" role="alert" className="text-xs font-semibold text-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}

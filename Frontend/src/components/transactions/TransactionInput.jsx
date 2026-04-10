export function TextInput({ value, prefix, ...props }) {
  return (
    <div className="flex h-12 items-center rounded-lg border border-[#e6edf1] bg-[#f8fbfc] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition focus-within:border-[#8fd8cd] focus-within:bg-white">
      {prefix && <span className="mr-1 text-lg font-black text-[#6f7c88]">{prefix}</span>}
      <input
        value={value}
        readOnly
        className="h-12 w-full bg-transparent text-sm font-bold text-[#25313b] outline-none"
        {...props}
      />
    </div>
  );
}

export function SelectInput({ value, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={() => {}}
        className="h-12 w-full appearance-none rounded-lg border border-[#e6edf1] bg-[#f8fbfc] px-4 pr-10 text-sm font-bold text-[#25313b] outline-none transition focus:border-[#8fd8cd] focus:bg-white"
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-[#9aa6b2]">
        v
      </span>
    </div>
  );
}

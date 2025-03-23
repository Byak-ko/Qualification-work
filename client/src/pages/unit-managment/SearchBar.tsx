import Button from "../../components/ui/Button"

export default function SearchBar({
  value,
  onChange,
  onCreateUnit,
}: {
  value: string
  onChange: (value: string) => void
  onCreateUnit: () => void
}) {
  return (
    <div className="flex justify-between items-center mb-4 gap-4">
      <input
        type="text"
        placeholder="Пошук підрозділів..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full max-w-md px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      />

      <Button onClick={onCreateUnit}>+ Додати підрозділ</Button>
    </div>
  )
}

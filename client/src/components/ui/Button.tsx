type ButtonProps = {
  children: React.ReactNode
  type?: "button" | "submit"
  full?: boolean
  disabled?: boolean
  onClick?: () => void
}

const Button = ({ children, type = "button", full = false, disabled = false, onClick }: ButtonProps) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition ${
      full ? "w-full" : ""
    } disabled:opacity-50`}
  >
    {children}
  </button>
)

export default Button

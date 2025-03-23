import Input from "../../components/ui/Input";

interface UserSearchProps {
  search: string;
  onChange: (value: string) => void;
}

export default function UserSearch({ search, onChange }: UserSearchProps) {
  return (
    <Input
      type="text"
      placeholder="Пошук користувача..."
      value={search}
      onChange={(e) => onChange(e.target.value)}
      className="mb-4"
    />
  );
}

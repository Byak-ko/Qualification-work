import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Input from "../../components/ui/Input";

interface UserSearchProps {
  search: string;
  onChange: (value: string) => void;
}

export default function UserSearch({ search, onChange }: UserSearchProps) {
  return (
    <div className="relative">
      <Input
       icon={<MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />}
        type="text"
        placeholder="Пошук користувача..."
        value={search}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-4 py-2 
                   border-2 border-gray-200 
                   rounded-lg 
                   focus:border-blue-400 
                   focus:ring-2 focus:ring-blue-100 
                   transition-all duration-300 
                   w-full"
      />
    </div>
  );
}
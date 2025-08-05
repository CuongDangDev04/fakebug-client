// components/common/ui/Switch.tsx
interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export default function Switch({ checked, onCheckedChange }: SwitchProps) {
  return (
    <div
      onClick={() => onCheckedChange(!checked)}
      className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${
        checked ? 'bg-green-500' : 'bg-gray-400'
      }`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </div>
  );
}

interface EquipmentProps {
  size: number;
  label: string;
}

export default function Equipment({ size, label }: EquipmentProps) {
  return (
    <div className="flex flex-row gap-2 bg-neutral-300 text-neutral-800 rounded-md p-4">
      <p>{size}u</p>
      <p>{label}</p>
    </div>
  );
}

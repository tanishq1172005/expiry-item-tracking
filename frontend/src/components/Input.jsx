export default function Input({
    label,
    type,
    placeholder,
    onChange,
    value
}){
    return <div className="flex flex-col">
        <label className="text-lg font-medium">{label}</label>
        <input type={type} placeholder={placeholder} value={value} onChange={onChange} className="rounded-lg p-2 focus:outline-none border-2 border-black" />
    </div>
}
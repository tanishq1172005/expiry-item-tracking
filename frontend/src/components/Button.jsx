export default function Button({
    children,
    type,
    onClick,
    size="medium",
    variant="primary",
    classname,
    ...props
}){

    const baseStyle = "rounded-lg cursor-pointer p-2"

    const sizes = {
        small:"px-3 py-1 text-sm",
        medium:"px-4 py-2 text-md",
        large:"px-6 py-3 text-lg"
    }

    const variants = {
        primary:"bg-blue-600 hover:bg-blue-700 text-white",
        secondary:"bg-gray-700 hover:bg-gray-800 text-white",
        danger:"bg-red-600 hover:bg-red-700 text-white"
    }

    
    return <button type={type} onClick={onClick} className={`${variants[variant]} ${sizes[size]} ${classname} ${baseStyle}`} {...props}>{children}</button>
}
import { useRouter } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

interface BackProps {
    subtitle: string
}

export default function Back({ subtitle }: BackProps) {
    const router = useRouter()

    return (
        <div className="text-center mb-4">
            <button
                onClick={() => router.history.back()}
                className="inline-flex items-center gap-2 text-black/60 hover:text-black transition-colors cursor-pointer group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold uppercase tracking-wider">URL Shortener</span>
            </button>

            <h1 className="text-lg md:text-2xl font-bold tracking-tight mt-2">
                {subtitle}
            </h1>

            <hr className="md:w-1/4 w-1/2 border-black/40 my-6 mx-auto" />
        </div>
    )
}

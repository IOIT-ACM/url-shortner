import { Github, Instagram, Linkedin, Globe } from "lucide-react";

export default function Footer() {
    return (
        <footer className="flex items-center justify-center gap-8 text-black/30 mt-8">
            <a
                href="https://github.com/ioit-acm"
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent transition-colors p-2"
            >
                <Github size={20} />
            </a>
            <a
                href="https://instagram.com/ioit__acm"
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent transition-colors p-2"
            >
                <Instagram size={20} />
            </a>
            <a
                href="https://linkedin.com/company/ioit-acm"
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent transition-colors p-2"
            >
                <Linkedin size={20} />
            </a>
            <a
                href="https://ioit.acm.org"
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent transition-colors p-2"
            >
                <Globe size={20} />
            </a>
        </footer>
    );
}   
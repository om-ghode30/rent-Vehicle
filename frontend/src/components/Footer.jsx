import { FaFacebookF, FaInstagram, FaTwitter, FaGithub, FaYoutube } from "react-icons/fa"

function Footer({ contactRef }) {
    return (
        <footer className="bg-zinc-900 border-t border-zinc-800" ref={contactRef}>
            <div className="max-w-7xl mx-auto px-6 py-12">
                
                {/* Top Section: Branding & Socials */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-zinc-800/50">
                    
                    <div className="text-center md:text-left">
                        <h2 className="text-white text-2xl font-black tracking-tighter mb-1">RENT A CAR</h2>
                        <p className="text-zinc-500 text-sm font-medium">
                            &copy; 2026 Rent A Car. All rights reserved.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        {[
                            { icon: <FaFacebookF />, url: "https://facebook.com", label: "Facebook" },
                            { icon: <FaInstagram />, url: "https://instagram.com", label: "Instagram" },
                            { icon: <FaYoutube />, url: "https://youtube.com", label: "Youtube" },
                            { icon: <FaTwitter />, url: "https://twitter.com", label: "Twitter" },
                            { icon: <FaGithub />, url: "https://github.com", label: "GitHub" },
                        ].map((social, idx) => (
                            <a 
                                key={idx}
                                href={social.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                aria-label={social.label}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm"
                            >
                                {social.icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Bottom Section: Contact Info */}
                <div className="mt-10 flex flex-col items-center">
                    <div className="bg-zinc-800/30 p-8 rounded-3xl border border-zinc-800 w-full max-w-2xl">
                        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6 md:gap-12 text-center md:text-left">
                            
                            <h3 className="text-3xl font-black text-white uppercase tracking-tight">
                                Contact
                            </h3>

                            <div className="grid grid-cols-1 gap-y-3">
                                <div className="flex flex-col md:flex-row md:gap-2">
                                    <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Phone:</span>
                                    <span className="text-zinc-300 font-semibold">+91 90190 19010</span>
                                </div>
                                <div className="flex flex-col md:flex-row md:gap-2">
                                    <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Email:</span>
                                    <span className="text-zinc-300 font-semibold">rentinfo@gmail.com</span>
                                </div>
                            </div>

                        </div>
                    </div>
                    
                    <p className="mt-8 text-zinc-600 text-[10px] uppercase tracking-[0.2em] font-bold">
                        Fast • Reliable • Professional
                    </p>
                </div>

            </div>
        </footer>
    )
}

export default Footer;
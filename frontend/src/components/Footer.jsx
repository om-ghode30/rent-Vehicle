import { FaFacebookF, FaInstagram, FaTwitter, FaGithub, FaYoutube } from "react-icons/fa"

function Footer({ contactRef }) {
    return (
        <>
            <div ref={contactRef}>
                <div className="flex items-center justify-between max-w-6xl mx-auto p-5 sm:flex-row flex-col">


                    <p className="text-white hover:text-gray-300 transition ">&copy; 2026 Rent A Car, All rights reserved</p>

                    <div className="flex gap-10 items-center max-w-6xl sm:mt-0 mt-5">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <FaFacebookF size={24} className="text-white hover:text-gray-300 transition" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <FaInstagram size={24} className="text-white hover:text-gray-300 transition" />
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="Youtube">
                            <FaYoutube size={24} className="text-white hover:text-gray-300 transition" />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                            <FaTwitter size={24} className="text-white hover:text-gray-300 transition" />
                        </a>
                        <a href="https://guthub.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                            <FaGithub size={24} className="text-white hover:text-gray-300 transition" />
                        </a>

                    </div>
                </div>

                <div className="text-center">
                <div className="text-gray-400 inline-grid grid-cols-[auto_auto] gap-x-4">
                    <h1 className="text-4xl font-bold mb-3">Contact</h1>

                    <div className="inline-grid grid-cols-[auto_auto] gap-x-1 text-left">
                        <span>Phone no.:-</span>
                        <span>9019019010</span>

                        <span>Email Address:-</span>
                        <span>rentinfo@gmail.com</span>
                    </div>
                </div>
                </div>



            </div>
        </>
    )
}
export default Footer
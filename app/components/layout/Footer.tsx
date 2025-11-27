// app/components/layout/Footer.tsx
export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/branding/logo.png"
            alt="School Logo"
            className="h-24 w-auto object-contain"
          />
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center gap-6 mb-8 text-gray-700 text-2xl">
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-[#800000] transition">
            <i className="fab fa-facebook"></i>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#800000] transition">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-[#800000] transition">
            <i className="fab fa-x-twitter"></i>
          </a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-[#800000] transition">
            <i className="fab fa-youtube"></i>
          </a>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-700 mb-10">
          <a href="https://exams.kekirawacc.lk" className="hover:text-[#800000]">Exam Portal</a>
          <a href="/contact" className="hover:text-[#800000]">Contact Us</a>
          <a href="/rules" className="hover:text-[#800000]">Rules</a>
          <a href="/oba" className="hover:text-[#800000]">OBA</a>
          <a href="/administration" className="hover:text-[#800000]">Administration</a>
          <a href="/privacy-policy" className="hover:text-[#800000]">Privacy Policy</a>
        </div>

        {/* Divider */}
        <hr className="border-t border-gray-300 mb-6" />

        {/* Copyright */}
        <p className="text-sm text-gray-700 font-medium mb-2">
          © 2025 Kekirawa Central College — All Rights Reserved
        </p>

        {/* Credits */}
        <p className="text-sm text-gray-700">
          BUILT BY <span className="font-semibold text-[#800000]">Kekirawa Central College ICT Society</span>
        </p>
      </div>
    </footer>
  );
}

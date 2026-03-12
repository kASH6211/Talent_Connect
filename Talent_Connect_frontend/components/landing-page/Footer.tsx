import { MapPin, Mail, Clock } from "lucide-react";
const importantLinks = [
  { title: "About Department", link: "#" },
  { title: "Student Portal", link: "#" },
  { title: "Industry Connect", link: "#" },
  { title: "Placements", link: "#" },
  { title: "Contact Us", link: "/contact" },
];

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-content">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-sm mb-1">
              Dept. of Technical Education & Industrial Training
            </h3>
            <p className="text-primary-content/60 text-xs mb-2">
              Government of Punjab
            </p>
            <p className="text-primary-content/80 text-xs leading-relaxed">
              Empowering youth through technical education and creating a
              skilled workforce for the future of Punjab.
            </p>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="font-bold text-sm mb-3">Important Links</h3>

            <ul className="grid grid-cols-2 gap-y-2 gap-x-6">
              {importantLinks?.map((link) => (
                <li key={link.title}>
                  <a
                    href={link.link}
                    className="text-primary-content/80 text-xs hover:text-primary-content transition-colors flex items-center gap-2"
                  >
                    <span className="text-secondary text-[10px]">▶</span>
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-sm mb-3">Contact Information</h3>

            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs">
                <MapPin className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span className="text-primary-content/80">
                  Department of Technical Education & Industrial Training
                  <br />
                  Sector 36-A, Chandigarh, Punjab
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Mail className="w-4 h-4 text-secondary shrink-0" />
                <span className="text-primary-content/80">
                  dtepunjab@punjab.gov.in
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-4 h-4 text-secondary shrink-0" />
                <span className="text-primary-content/80">
                  Monday – Friday <br />
                  9:00 AM to 5:00 PM
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-content/10 py-3">
        <p className="text-center text-primary-content/50 text-xs">
          © 2026 Government of Punjab | All Rights Reserved | Department of
          Technical Education & Industrial Training
        </p>
      </div>
    </footer>
  );
};

export default Footer;

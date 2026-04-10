const footerLinks = [
  "Terms of Service",
  "Privacy Policy",
  "Your Privacy Choices",
];

export default function AuthFooter({ align = "center" }) {
  const alignmentClass =
    align === "left" ? "items-start text-left" : "items-center text-center";

  return (
    <div className={`flex flex-col gap-3 text-xs text-[#9ca3af] ${alignmentClass}`}>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {footerLinks.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <p>© 2026 SYM. All rights reserved.</p>
    </div>
  );
}

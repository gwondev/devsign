import { motion } from "framer-motion";
import { Phone, MapPin, Mail, ChevronRight } from "lucide-react";

// ✨ 여기에 디스코드 서버 아이콘 링크를 넣어주세요!
const DISCORD_SERVER_ICON = "https://cdn.discordapp.com/icons/462157565229268993/70266f261f01165295208967e73f0555.webp?size=160&quality=lossless";

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer = ({ onNavigate }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  // 운영진 연락처 데이터 [cite: 1438]
  const admins = [
    { role: "회장", year: "22", name: "김형민", phone: "010-9171-8162" },
    { role: "부회장", year: "22", name: "이수혁", phone: "010-6545-1948" },
    { role: "총무", year: "23", name: "이수빈", phone: "010-8639-5557" },
  ];

  return (
    <footer className="bg-slate-950 text-slate-400 py-20 px-6 border-t border-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* 1. 브랜드 정보 영역 */}
          <div className="col-span-1 md:col-span-1">
            <div 
              className="flex items-center gap-3 mb-6 cursor-pointer"
              onClick={() => onNavigate("home")}
            >
              {/* ✨ 'D' 텍스트 박스를 실제 이미지 로고로 교체 */}
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 bg-white flex items-center justify-center">
                <img 
                  src={DISCORD_SERVER_ICON} 
                  alt="DEVSIGN" 
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.target.style.display = 'none'; // 이미지 로드 실패 시 숨김 처리
                  }}
                />
              </div>
              <span className="font-bold text-2xl text-white tracking-tight">DEVSIGN</span>
            </div>
            <p className="text-sm leading-relaxed font-medium">
              조선대학교 IT융합대학<br />
              컴퓨터공학 전공 학술 동아리<br />
              Since 2010.
            </p>
          </div>

          {/* 2. 빠른 링크 영역 */}
          <div>
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
              <ChevronRight size={16} className="text-indigo-500" /> 바로가기
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              {["홈", "동아리소개", "공지사항", "자주 묻는 질문"].map((item) => (
                <li key={item}>
                  <button 
                    onClick={() => onNavigate(item === "홈" ? "home" : item === "동아리소개" ? "about" : item === "공지사항" ? "notice" : "faq")} 
                    className="hover:text-indigo-400 transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. 운영진 연락처 영역 (소셜 아이콘 대체) [cite: 1446] */}
          <div>
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
              <Phone size={16} className="text-indigo-500" /> 운영진 연락처
            </h4>
            <ul className="space-y-4">
              {admins.map((admin) => (
                <li key={admin.phone} className="group">
                  <a href={`tel:${admin.phone}`} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-indigo-400 font-bold">{admin.role}</span>
                      <span className="text-slate-200 font-bold">{admin.year} {admin.name}</span>
                    </div>
                    <span className="text-xs font-medium group-hover:text-indigo-400 transition-colors">
                      {admin.phone}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. 오시는 길 영역 [cite: 1450] */}
          <div>
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
              <MapPin size={16} className="text-indigo-500" /> 오시는 길
            </h4>
            <div className="space-y-4 text-sm font-medium leading-relaxed">
              <div className="flex gap-3">
                <span className="text-slate-200">
                  광주광역시 동구 필문대로 309<br />
                  조선대학교 IT융합대학 4층 4122
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 저작권 영역 [cite: 1453] */}
        <div className="pt-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[13px] font-medium">
            © {currentYear} <span className="text-indigo-500 font-bold tracking-tight">DEVSIGN</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
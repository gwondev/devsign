import { api } from "../../api/axios";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Lock, MessageSquare, GraduationCap, 
  Heart, ArrowRight, ArrowLeft, ShieldCheck, Timer, CheckCircle2
} from "lucide-react";
import { Button } from "../../components/ui/button";

const DEPARTMENTS = [
  "AI소프트웨어학부(컴퓨터공학전공)",
  "전자공학과",
  "AI소프트웨어학부(정보통신전공)",
  "AI소프트웨어학부(인공지능공학전공)",
  "AI소프트웨어학부(모빌리티SW전공)"
];
const INTERESTS = ["인공지능", "웹 개발", "게임 개발", "임베디드 / 시스템", "기타"];

export const Signup = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    dept: "",
    interest: "",
    otherInterest: "",
    discord: ""
  });

  const [idChecked, setIdChecked] = useState(false);
  const [discordVerified, setDiscordVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);

  const [verifiedInfo, setVerifiedInfo] = useState<{
    name: string;
    studentId: string;
    userStatus: string;
    role: string;
  } | null>(null);

  const [timeLeft, setTimeLeft] = useState(0); 
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const idRegex = /^(?=.{6,}$)[\p{L}\p{N}]+$/u;
  const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

  const handleCheckId = async () => {
    if (!idRegex.test(formData.userId)) {
      return alert("아이디는 문자(한글/영문) 또는 문자+숫자 조합으로 6자 이상이어야 합니다.");
    }
    try {
      const response = await api.get(`/members/check/${formData.userId}`);
      if (response.data === true) {
        alert("이미 사용 중인 아이디입니다. ❌");
        setIdChecked(false);
      } else {
        alert("사용 가능한 아이디입니다! ✅");
        setIdChecked(true);
      }
    } catch (error) {
      alert("서버 통신 오류가 발생했습니다.");
    }
  };

  const handleSendDiscordCode = async () => {
    if (formData.discord.length < 2 || formData.discord.includes(" ")) {
      return alert("올바른 디스코드 사용자명을 입력해주세요. (공백 제외)");
    }
    setIsSendingCode(true);
    try {
      const discordTag = formData.discord.replace("@", "");
      const response = await api.post("/members/discord-send", {
        discordTag: discordTag
      });
      
      if (response.data.status === "success") {
        setTimeLeft(300);
        setIsTimerActive(true);
        alert(`@${discordTag}님의 디스코드 DM으로 인증번호가 발송되었습니다. 📩`);
      } else if (response.data.status === "bot_error") {
        alert("디스코드 봇 서버에 문제가 발생했습니다. 관리자에게 문의하세요.");
      } else {
        alert("인증번호 발송에 실패했습니다. 동아리 서버에 계정이 있는지 확인해주세요.");
      }
    } catch (e) {
      console.error("인증번호 발송 에러:", e);
      alert("서버 통신 중 오류가 발생했습니다.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (timeLeft === 0 && !discordVerified) {
      return alert("인증 시간이 만료되었습니다. 번호를 다시 전송해주세요.");
    }
    if (verificationCode.length !== 6) return alert("인증번호 6자리를 입력해주세요.");
    
    try {
      const discordTag = formData.discord.replace("@", "");
      const response = await api.post("/members/verify-code", {
        discordTag: discordTag,
        code: verificationCode
      });

      if (response.data.status === "success") {
        setVerifiedInfo({
          name: response.data.name,
          studentId: response.data.studentId, 
          userStatus: response.data.userStatus,
          role: response.data.role
        });
        setDiscordVerified(true);
        setIsTimerActive(false);
        alert(`인증 성공! 🎉 [${response.data.studentId}학번 ${response.data.name}]님 확인되었습니다.`);
      } else {
        alert("인증번호가 일치하지 않거나 만료되었습니다. ❌");
      }
    } catch (error) {
      console.error("인증 에러:", error);
      alert("인증 확인 중 서버 오류가 발생했습니다.");
    }
  };

  const handleSignup = async () => {
    if (!idChecked) return alert("아이디 중복 확인을 완료해주세요.");
    if (!idRegex.test(formData.userId)) return alert("아이디 형식을 확인해주세요.");
    if (!passwordRegex.test(formData.password)) return alert("비밀번호 형식을 확인해주세요.");
    if (!formData.dept) return alert("학과를 선택해주세요.");
    if (!discordVerified || !verifiedInfo) return alert("디스코드 인증을 완료해주세요.");

    try {
      const response = await api.post("/members/signup", {
        loginId: formData.userId,
        password: formData.password,
        dept: formData.dept,
        interests: formData.interest === "기타" ? formData.otherInterest : formData.interest,
        discordTag: formData.discord.replace("@", ""),
        authCode: verificationCode 
      });

      if (response.status === 200 || response.status === 201) {
        alert("회원가입을 축하합니다! 🎉");
        onNavigate("signup-success");
      }
    } catch (error) {
      alert("회원가입에 실패했습니다. 이미 가입된 계정인지 확인해주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faff] to-white px-4 md:px-6 py-10 md:py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <button onClick={() => onNavigate("home")} className="flex items-center text-slate-400 font-bold text-xs md:text-sm mb-6 md:mb-8 hover:text-slate-600 transition-colors">
          <ArrowLeft className="mr-2 w-4 h-4 md:w-[18px] md:h-[18px]" /> 메인으로 돌아가기
        </button>

        <div className="bg-white rounded-[2rem] md:rounded-[40px] shadow-2xl shadow-indigo-100/50 border border-slate-100 p-6 md:p-12">
          <div className="mb-8 md:mb-12">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-1.5 md:mb-2 tracking-tighter">회원가입</h1>
            <p className="text-slate-500 font-medium text-xs md:text-base">디스코드 인증만으로 간편하게 가입하세요! ✨</p>
          </div>

          <form className="space-y-8 md:space-y-10" onSubmit={(e) => e.preventDefault()}>
            <section className="space-y-4 md:space-y-6">
              <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-1 md:w-1.5 h-5 md:h-6 bg-indigo-600 rounded-full" /> 계정 설정
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[10px] md:text-xs font-black text-slate-400 ml-1 uppercase">아이디</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <User className={`absolute left-4 md:left-5 top-1/2 -translate-y-1/2 ${idChecked ? "text-green-500" : "text-slate-300"} w-4 h-4 md:w-[18px] md:h-[18px]`} />
                      <input 
                        type="text" 
                        value={formData.userId} 
                        onChange={(e) => setFormData({...formData, userId: e.target.value.replace(/\s/g, "")})} 
                        disabled={idChecked} 
                        placeholder="6자 이상" 
                        className={`w-full pl-11 md:pl-12 pr-2 py-3.5 md:py-4 rounded-xl md:rounded-2xl outline-none transition-all font-medium text-sm ${idChecked ? "bg-green-50 text-green-700" : "bg-slate-50 text-slate-900"}`} 
                      />
                    </div>
                    <Button onClick={handleCheckId} disabled={idChecked} className="h-auto px-4 md:px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold bg-indigo-600 text-white shadow-lg text-xs md:text-sm shrink-0">중복 확인</Button>
                  </div>
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[10px] md:text-xs font-black text-slate-400 ml-1 uppercase">비밀번호</label>
                  <div className="relative">
                    <Lock className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 md:w-[18px] md:h-[18px]" />
                    <input type="password" placeholder="특수문자 포함 8자 이상" className="w-full pl-11 md:pl-14 pr-4 py-3.5 md:py-4 bg-slate-50 rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm" onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4 md:space-y-6">
              <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-1 md:w-1.5 h-5 md:h-6 bg-indigo-400 rounded-full" /> 디스코드 인증
              </h3>
              <div className="space-y-4">
                <p className="text-[9px] md:text-xs text-slate-400 font-bold leading-relaxed bg-slate-50 p-4 rounded-xl md:rounded-2xl border border-slate-100">
                  💡 디스코드 사용자명: 디스코드 프로필 확인 | 예)gimhyeongmin5693
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MessageSquare className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 md:w-[18px] md:h-[18px]" />
                    <input 
                      type="text" 
                      value={formData.discord} 
                      onChange={(e) => setFormData({...formData, discord: e.target.value})} 
                      disabled={discordVerified} 
                      placeholder="디스코드 사용자명" 
                      className="w-full pl-11 md:pl-14 pr-4 py-3.5 md:py-4 bg-slate-50 rounded-xl md:rounded-2xl outline-none font-medium text-sm" 
                    />
                  </div>
                  <Button onClick={handleSendDiscordCode} disabled={discordVerified || isSendingCode} className="h-auto px-4 md:px-5 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold border border-indigo-100 text-indigo-600 bg-white hover:bg-indigo-50 text-xs md:text-sm shrink-0">번호 전송</Button>
                </div>
                
                <div className="flex gap-2 items-stretch">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={verificationCode} 
                      onChange={(e) => setVerificationCode(e.target.value)} 
                      disabled={discordVerified} 
                      placeholder="인증번호 6자리" 
                      className="w-full px-4 md:px-6 py-3.5 md:py-4 bg-slate-50 rounded-xl md:rounded-2xl outline-none text-center tracking-widest font-bold h-full text-sm" 
                    />
                    {isTimerActive && !discordVerified && (
                      <div className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-indigo-600 font-bold text-[10px] md:text-sm bg-indigo-50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl border border-indigo-100">
                        <Timer className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        {formatTime(timeLeft)}
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={handleVerifyCode} 
                    disabled={discordVerified || (isTimerActive && timeLeft === 0)} 
                    className="h-auto px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold bg-indigo-600 text-white shadow-lg text-xs md:text-sm shrink-0"
                  >
                    인증 확인
                  </Button>
                </div>

                <AnimatePresence>
                  {discordVerified && verifiedInfo && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: "auto" }} 
                      className="bg-indigo-50 border border-indigo-100 p-4 md:p-6 rounded-2xl md:rounded-3xl flex items-center justify-between shadow-inner"
                    >
                      <div className="flex items-center gap-3 md:gap-4 min-w-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 shrink-0">
                          <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-tighter">Verified Information</p>
                          <p className="text-base md:text-lg font-black text-slate-900 truncate">
                            {verifiedInfo.studentId}학번 {verifiedInfo.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                        <span className="px-2 py-0.5 md:px-3 md:py-1 bg-indigo-600 text-white text-[8px] md:text-[9px] font-black rounded md:rounded-lg uppercase tracking-widest whitespace-nowrap">
                          {verifiedInfo.userStatus}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            <section className="space-y-3 md:space-y-4">
              <label className="text-xs md:text-sm font-black text-slate-700 ml-1 flex items-center gap-2"><GraduationCap className="text-indigo-600 w-4 h-4 md:w-[18px] md:h-[18px]" /> 소속 학과</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEPARTMENTS.map((d) => (
                  <button key={d} type="button" onClick={() => setFormData({ ...formData, dept: d })} className={`py-2.5 md:py-3 px-4 rounded-xl md:rounded-2xl text-[11px] md:text-xs font-bold transition-all text-left ${formData.dept === d ? "bg-indigo-600 text-white shadow-md" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>{d}</button>
                ))}
              </div>
            </section>

            <section className="space-y-3 md:space-y-4 pt-2 md:pt-4">
              <label className="text-xs md:text-sm font-black text-slate-700 ml-1 flex items-center gap-2"><Heart className="text-pink-500 w-4 h-4 md:w-[18px] md:h-[18px]" /> 관심 분야</label>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => setFormData({ ...formData, interest })}
                    className={`px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-2xl text-[11px] md:text-xs font-bold transition-all ${
                      formData.interest === interest
                        ? "bg-pink-500 text-white shadow-md shadow-pink-100"
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              {formData.interest === "기타" && (
                <motion.input
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  type="text"
                  placeholder="관심 분야 직접 입력"
                  className="w-full px-5 py-3.5 md:py-4 bg-slate-50 rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-pink-500 transition-all font-medium mt-2 text-sm"
                  onChange={(e) => setFormData({ ...formData, otherInterest: e.target.value })}
                />
              )}
            </section>

            <Button
              onClick={handleSignup}
              disabled={!idChecked || !discordVerified}
              className={`w-full py-4 md:py-6 rounded-xl md:rounded-[2rem] font-bold text-lg md:text-xl mt-8 md:mt-12 transition-all h-auto ${(!idChecked || !discordVerified) ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-indigo-600 text-white shadow-2xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95"}`}
            >
              회원가입 완료 <ArrowRight className="ml-2 w-5 h-5 md:w-6 md:h-6" />
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
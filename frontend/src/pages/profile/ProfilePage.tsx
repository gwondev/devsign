import { api } from "../../api/axios";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Hash, GraduationCap, 
  MessageSquare, Settings, Lock,
  ArrowLeft, Check, X, ShieldCheck, Key
} from "lucide-react";
import { Button } from "../../components/ui/button";

const DEPARTMENTS = [
  "AI소프트웨어학부(컴퓨터공학전공)",
  "전자공학과",
  "AI소프트웨어학부(정보통신전공)",
  "AI소프트웨어학부(인공지능공학전공)",
  "AI소프트웨어학부(모빌리티SW전공)"
];

export const ProfilePage = ({ onNavigate, user, setUser, posts = [] }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPwModalOpen, setIsPwModalOpen] = useState(false); 
  
  // ✨ 디스코드 인증을 위한 추가 상태값
  const [authCode, setAuthCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  
  const userPostsCount = useMemo(() => {
    if (!user || !posts) return 0;
    return posts.filter((p: any) => p.loginId === user.loginId).length;
  }, [posts, user]);

  const [userInfo, setUserInfo] = useState({
    name: user?.name || "사용자",
    role: user?.role === "ADMIN" ? "관리자" : "일반 회원",
    userStatus: user?.userStatus || "상태 정보 없음",
    major: user?.dept || "AI소프트웨어학부(컴퓨터공학전공)",
    studentId: user?.studentId || "",
    discord: user?.discordTag || "디스코드 미연동",
    avatar: user?.avatarUrl || "https://cdn.discordapp.com/embed/avatars/0.png",
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (user) {
      setUserInfo({
        name: user.name || "사용자",
        role: user.role === "ADMIN" ? "관리자" : "일반 회원",
        userStatus: user.userStatus || "상태 정보 없음",
        major: user.dept || "AI소프트웨어학부(컴퓨터공학전공)",
        studentId: user.studentId || "",
        discord: user.discordTag || "디스코드 미연동",
        avatar: user.avatarUrl || "https://cdn.discordapp.com/embed/avatars/0.png",
      });
    }
  }, [user]);

  // ✨ 디스코드 변경 취소 처리 (초기화)
  const handleCancel = () => {
    setIsEditing(false);
    setAuthCode("");
    setIsCodeSent(false);
    setUserInfo({
      ...userInfo,
      major: user?.dept || "AI소프트웨어학부(컴퓨터공학전공)",
      discord: user?.discordTag || "디스코드 미연동"
    });
  };

  // ✨ 디스코드 봇으로 인증번호 전송 요청
  const handleSendDiscordCode = async () => {
    if (!userInfo.discord || userInfo.discord.trim() === "") {
      return alert("변경할 디스코드 태그를 입력해주세요.");
    }
    
    try {
      const response = await api.post("/members/discord-send", { discordTag: userInfo.discord });
      if (response.data.status === "success") {
        alert("인증번호가 새로운 디스코드 계정 DM으로 전송되었습니다! 📩");
        setIsCodeSent(true);
      } else {
        alert(response.data.message || "해당 디스코드 사용자를 찾을 수 없거나 메시지를 보낼 수 없습니다. 태그가 올바른지 확인해주세요.");
      }
    } catch (error) {
      console.error("인증번호 전송 실패:", error);
      alert("서버 오류로 인해 인증번호를 전송할 수 없습니다.");
    }
  };

  const handleSave = async () => {
    // 디스코드 태그가 기존과 다른지 체크
    const originalDiscord = user?.discordTag || "디스코드 미연동";
    const isDiscordChanged = userInfo.discord !== originalDiscord;

    // 태그가 바뀌었는데 인증번호를 입력하지 않았다면 차단!
    if (isDiscordChanged) {
      if (!authCode || authCode.length !== 6) {
        alert("디스코드 계정이 변경되었습니다. '인증번호 받기'를 눌러 DM으로 받은 6자리 코드를 입력해주세요. ⚠️");
        return;
      }
    }

    try {
      // ✨ 변경된 파라미터(authCode)를 백엔드 쿼리로 안전하게 넘겨줍니다
      const response = await api.put(`/members/update/${user.loginId}`, {
        dept: userInfo.major,
        discordTag: userInfo.discord
      }, {
        params: isDiscordChanged ? { authCode: authCode.trim() } : {}
      });

      if (response.data.status === "success") {
        const updatedUser = { 
          ...user, 
          dept: userInfo.major, 
          discordTag: userInfo.discord 
        };
        
        if (setUser) setUser(updatedUser);
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));

        alert("모든 정보가 안전하게 저장되었습니다! ✅");
        setIsEditing(false);
        setAuthCode("");
        setIsCodeSent(false);
      } else {
        alert(response.data.message || "저장에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("저장 실패:", error);
      // 서버에서 보낸 에러 메시지(예: 잘못된 인증번호)가 있다면 그대로 표출
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("서버 저장 중 오류가 발생했습니다.");
      }
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = pwForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    if (newPassword.length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    try {
      const response = await api.put(`/members/change-password/${user.loginId}`, {
        currentPassword,
        newPassword
      });

      if (response.data.status === "success") {
        alert("비밀번호가 성공적으로 변경되었습니다. 🔐");
        setIsPwModalOpen(false);
        setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        alert(response.data.message || "현재 비밀번호가 일치하지 않습니다.");
      }
    } catch (error) {
      console.error("비밀번호 변경 실패:", error);
      alert("비밀번호 변경 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 md:pt-32 pb-16 md:pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8 md:mb-12">
          <div>
            <button 
              onClick={() => onNavigate("home")}
              className="flex items-center gap-1.5 md:gap-2 text-slate-400 font-black mb-4 md:mb-6 hover:text-indigo-600 transition-colors group text-xs md:text-sm"
            >
              <ArrowLeft className="w-4 h-4 md:w-[18px] md:h-[18px] group-hover:-translate-x-1 transition-transform" /> 
              메인으로 돌아가기
            </button>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 shrink-0">
                <Settings className="w-5 h-5 md:w-7 md:h-7" />
              </div>
              <h1 className="text-2xl md:text-4xl font-[900] text-slate-900 tracking-tighter uppercase truncate">프로필 설정</h1>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-slate-100 flex flex-col items-center text-center h-full justify-center">
            <div className="mb-6 md:mb-8 relative">
              <div className="w-24 h-24 md:w-40 md:h-40 bg-slate-100 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center overflow-hidden border-4 border-white shadow-xl shrink-0">
                <img 
                  src={userInfo.avatar} 
                  alt="Discord Profile" 
                  className="w-full h-full object-cover"
                  onError={(e: any) => e.target.src = "https://cdn.discordapp.com/embed/avatars/0.png"}
                />
              </div>
            </div>
            
            <h2 className="text-xl md:text-3xl font-black text-slate-900 mb-1.5 md:mb-2">{userInfo.name}</h2>
            
            <div className="flex flex-col gap-1.5 md:gap-2 mb-6 md:mb-8 w-full max-w-[200px]">
              <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] md:text-xs font-black">
                <ShieldCheck className="w-3.5 h-3.5 md:w-[14px] md:h-[14px]" /> {userInfo.role}
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="px-3 py-1 bg-slate-50 text-slate-400 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-slate-100">
                  {userInfo.userStatus}
                </div>
                <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                  {userInfo.studentId}학번
                </div>
              </div>
            </div>

            <div className="w-full pt-6 md:pt-8 border-t border-slate-50">
              <div className="text-center">
                <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase mb-1 tracking-widest">활동 지수</p>
                <div className="flex items-center justify-center gap-1.5 md:gap-2 text-indigo-600">
                  <MessageSquare className="w-4 h-4 md:w-4 md:h-4" />
                  <p className="text-lg md:text-2xl font-black text-slate-900">작성글 {userPostsCount}개</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-14 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between mb-8 md:mb-12">
              <h3 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">상세 정보</h3>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="bg-slate-900 text-white rounded-xl md:rounded-2xl px-4 md:px-8 font-black py-3 md:py-6 shadow-lg text-xs md:text-sm h-auto">정보 수정</Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancel} variant="outline" className="rounded-xl md:rounded-2xl px-3 md:px-6 py-3 md:py-6 font-black border-slate-200 text-slate-400 text-xs md:text-sm h-auto">취소</Button>
                  <Button onClick={handleSave} className="bg-indigo-600 text-white rounded-xl md:rounded-2xl px-4 md:px-8 py-3 md:py-6 font-black shadow-lg text-xs md:text-sm h-auto">저장 완료</Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 md:gap-y-8 mb-8 md:mb-12 flex-grow">
              <ProfileItem 
                label="소속 학과" 
                value={userInfo.major} 
                icon={<GraduationCap className="w-4 h-4 md:w-[18px] md:h-[18px]" />} 
                isEditing={isEditing} 
                type="select" 
                options={DEPARTMENTS} 
                onChange={(val: string) => setUserInfo({...userInfo, major: val})} 
              />
              <ProfileItem 
                label="디스코드 태그" 
                value={userInfo.discord} 
                icon={<MessageSquare className="w-4 h-4 md:w-[18px] md:h-[18px]" />} 
                isEditing={isEditing} 
                onChange={(val: string) => {
                  setUserInfo({...userInfo, discord: val});
                  setIsCodeSent(false); // 태그가 한 글자라도 바뀌면 재인증 필요
                }} 
              />
              
              {/* ✨ 디스코드 태그가 변경되었을 때만 나타나는 인증 블록 */}
              <AnimatePresence>
                {isEditing && userInfo.discord !== (user?.discordTag || "디스코드 미연동") && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="col-span-1 md:col-span-2 overflow-hidden"
                  >
                    <div className="bg-indigo-50/50 p-4 md:p-6 rounded-2xl md:rounded-[1.5rem] border border-indigo-100 flex flex-col md:flex-row gap-3 md:gap-4 items-end">
                      <div className="flex-1 w-full space-y-2 md:space-y-3">
                        <label className="text-[10px] md:text-xs font-black text-indigo-600 uppercase ml-1 tracking-widest flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4" /> 새로운 계정 본인 인증
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                          <input 
                            type="text" 
                            placeholder={isCodeSent ? "DM으로 받은 6자리 인증번호" : "먼저 우측 버튼을 눌러주세요"}
                            value={authCode}
                            onChange={e => setAuthCode(e.target.value)}
                            disabled={!isCodeSent}
                            maxLength={6}
                            className="w-full sm:flex-1 p-3.5 md:p-4 bg-white rounded-xl md:rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm disabled:bg-slate-50 disabled:text-slate-400 transition-all shadow-sm"
                          />
                          <Button 
                            onClick={handleSendDiscordCode}
                            type="button"
                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl md:rounded-2xl px-6 py-3.5 md:py-4 shadow-md transition-all h-auto shrink-0"
                          >
                            {isCodeSent ? "재전송 요청" : "인증번호 받기"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-5 md:p-8 bg-slate-50 rounded-2xl md:rounded-[2rem] border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6 mt-auto">
              <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-50 shrink-0">
                  <Key className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-black text-slate-900">계정 보안</p>
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 truncate">비밀번호를 정기적으로 변경해 주세요.</p>
                </div>
              </div>
              <Button onClick={() => setIsPwModalOpen(true)} className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 rounded-lg md:rounded-xl px-4 md:px-6 font-bold hover:bg-slate-100 shadow-sm transition-all text-xs md:text-sm py-2.5 md:py-3 h-auto shrink-0">비밀번호 변경</Button>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isPwModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 md:px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsPwModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 text-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center shrink-0"><Lock size={18} /></div>
                <h3 className="text-xl md:text-2xl font-[900] text-slate-900 tracking-tighter uppercase truncate">비밀번호 변경</h3>
              </div>
              <div className="space-y-3 md:space-y-5">
                <input 
                  type="password" 
                  placeholder="현재 비밀번호" 
                  className="w-full p-3.5 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" 
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({...pwForm, currentPassword: e.target.value})}
                />
                <input 
                  type="password" 
                  placeholder="새 비밀번호" 
                  className="w-full p-3.5 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" 
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({...pwForm, newPassword: e.target.value})}
                />
                <input 
                  type="password" 
                  placeholder="새 비밀번호 확인" 
                  className="w-full p-3.5 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" 
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({...pwForm, confirmPassword: e.target.value})}
                />
              </div>
              <div className="flex gap-2 md:gap-3 mt-8 md:mt-10">
                <Button onClick={() => setIsPwModalOpen(false)} variant="ghost" className="flex-1 py-4 md:py-7 rounded-xl md:rounded-2xl font-black text-slate-400 text-sm h-auto">취소</Button>
                <Button onClick={handleChangePassword} className="flex-1 py-4 md:py-7 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black shadow-lg text-sm h-auto">변경 완료</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProfileItem = ({ label, value, icon, isEditing, onChange, type = "text", options = [], placeholder = "" }: any) => (
  <div className="space-y-2 md:space-y-3">
    <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">{label}</label>
    <div className={`flex items-center gap-3 md:gap-4 p-3.5 md:p-4 rounded-xl md:rounded-2xl transition-all ${isEditing ? "bg-slate-50 ring-2 ring-indigo-100" : "bg-white border border-slate-50 shadow-sm"}`}>
      <div className="text-indigo-400 shrink-0">{icon}</div>
      {isEditing ? (
        type === "select" ? (
          <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent outline-none w-full font-bold cursor-pointer text-sm md:text-base">
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="bg-transparent outline-none w-full font-bold text-sm md:text-base" />
        )
      ) : (
        <span className={`font-bold text-sm md:text-base truncate ${value ? "text-slate-700" : "text-slate-300"}`}>{value || "정보 없음"}</span>
      )}
    </div>
  </div>
);
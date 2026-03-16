import { motion } from "framer-motion";
import { MessageSquare, Heart, User, ArrowRight, Wallet } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface BoardProps {
  onNavigate: (path: string, id?: any) => void;
  posts: any[];
}

export const Board = ({ onNavigate, posts }: BoardProps) => {
  return (
    <section id="board" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-8 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter">
              게시판 <span className="text-indigo-600">미리보기</span>
            </h2>
            <p className="text-slate-500 font-bold text-lg">
              동아리원들이 자유롭게 소통하는 공간입니다. ✨
            </p>
          </div>
          <Button
            onClick={() => onNavigate("board-page")}
            className="group bg-slate-900 text-white font-black px-8 py-6 rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
          >
            전체 게시글 보기 <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => onNavigate("board-detail", post)}
              className="group bg-slate-50 rounded-[2.5rem] p-8 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 transition-all border border-slate-100 cursor-pointer flex flex-col"
            >
              <div className="flex items-center gap-2 mb-6">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                  post.category === "회비"
                  ? "bg-amber-50 text-amber-600 border-amber-100"
                  : "bg-white text-indigo-600 border-slate-100"
                }`}>
                  {post.category === "회비" && <Wallet size={10} className="inline mr-1 mb-0.5" />}
                  {post.category}
                </span>
                <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">{post.date}</span>
              </div>

              <h3 className="text-xl font-[900] text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug h-[3.5rem]">
                {post.title}
              </h3>

              <p className="text-slate-500 font-medium text-sm line-clamp-2 mb-8 flex-1">
                {post.content}
              </p>

              <div className="pt-6 border-t border-slate-200/50 flex items-center justify-between">
                {/* ✨ 작성자 정보 영역: 디스코드 프로필 이미지 추가 */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm shrink-0 flex items-center justify-center">
                    {post.profileImage ? (
                      <img 
                        src={post.profileImage} 
                        alt={post.author} 
                        className="w-full h-full object-cover" 
                        onError={(e: any) => {
                          // 이미지 로드 실패 시 디스코드 기본 아바타로 대체
                          e.target.src = "https://cdn.discordapp.com/embed/avatars/0.png";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-black text-slate-700">{post.author}</span>
                </div>

                <div className="flex items-center gap-4 text-slate-300">
                  <span className="flex items-center gap-1 text-[10px] font-bold">
                    <MessageSquare size={14} /> {post.commentsList?.length || 0}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold">
                    <Heart size={14} /> {post.likes || 0}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
import { Hero } from "./components/Hero";
import { Events } from "./components/Events";
import { Notice } from "./components/Notice";
import { Board } from "./components/Board";
import { About } from "./components/About";
import { FAQ } from "./components/FAQ";
import { useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";

interface HomeProps {
    isAdmin: boolean;
    isLoggedIn: boolean;
    events: any[];
    notices: any[];
    posts: any[];
    onNavigate: (path: string, id?: any) => void;
}

export function Home({ isAdmin, isLoggedIn, events, notices, posts, onNavigate }: HomeProps) {
    const location = useLocation();

    // 해시(#) 값을 감지해서 해당 섹션으로 부드럽게 스크롤
    useEffect(() => {
        if (location.hash) {
            const targetId = location.hash.replace("#", "");
            const element = document.getElementById(targetId);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        }
    }, [location]);

    const homeDisplayPosts = useMemo(() => {
        const feePost = posts.find((p) => p.category === "회비");
        const otherPosts = posts.filter((p) => p.category !== "회비").slice(0, 2);
        const result = [];
        if (feePost) result.push(feePost);
        result.push(...otherPosts);
        return result;
    }, [posts]);

    return (
        <>
            <div id="home">
                <Hero isAdmin={isAdmin} />
            </div>
            <div id="events" className="scroll-mt-20">
                <Events onNavigate={onNavigate} events={events.slice(0, 3)} />
            </div>
            <div id="notice" className="scroll-mt-20">
                <Notice onNavigate={onNavigate} notices={notices} />
            </div>
            {/* 게시판에도 id와 scroll-mt-20 속성을 추가했습니다 */}
            <div id="board" className="scroll-mt-20">
                <Board onNavigate={onNavigate} posts={homeDisplayPosts} />
            </div>
            <div id="about" className="scroll-mt-20">
                <About />
            </div>
            <div id="faq" className="scroll-mt-20">
                <FAQ />
            </div>
        </>
    );
}
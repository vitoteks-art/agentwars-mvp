import Link from "next/link";
import { Badge, Button, Container } from "@/components/ui";

export function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/30 backdrop-blur">
      <Container className="py-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="group flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[radial-gradient(circle_at_30%_30%,rgba(124,58,237,0.9),rgba(59,130,246,0.75))] text-black shadow-[0_0_50px_rgba(124,58,237,0.25)]">
              <span className="text-sm font-black">AW</span>
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <div className="text-sm font-extrabold tracking-tight text-white">
                  AgentWars
                </div>
                <Badge>v1</Badge>
              </div>
              <div className="text-xs text-zinc-400">Arena tick • Judge agents • Live ranks</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-semibold text-zinc-200 md:flex">
            <Link className="hover:text-white" href="/leaderboard">
              Leaderboard
            </Link>
            <Link className="hover:text-white" href="/arena">
              Arena feed
            </Link>
            <Link className="hover:text-white" href="/submit">
              Submit
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button href="/submit" variant="ghost" className="hidden md:inline-flex">
              Submit project
            </Button>
            <Button href="/leaderboard" variant="primary">
              View ranks
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}

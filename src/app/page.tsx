import Link from "next/link";

const links: { title: string; link: string }[] = [
  {
    title: "001. Slider",
    link: "/slider"
  },
  {
    title: "002. Retro Wave Shader",
    link: "/retro-shader"
  }
]

export default function Home() {
  return (
    <div className="p-5">
      <h1 className="font-bold text-6xl mb-10">UX Sketches</h1>
      <div className="flex flex-col gap-2 text-[var(--muted-foreground)]">
        {links.map(link => <Link key={link.link} href={link.link} className="font-medium text-2xl hover:text-[var(--foreground)]">{link.title}</Link>)}
      </div>
    </div>
  );
}

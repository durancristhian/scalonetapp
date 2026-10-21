import { type Team } from "@/types/team";
import { type ImageExportBackgroundId } from "@/utils/image-export-backgrounds";
import { Cloth, Terrace, GroundSign } from "./artwork";

export function HeaderA({ name, id }: { name: string; id: string }) {
  return <header className="relative h-52 overflow-clip bg-[var(--export-frame-color)]" data-prototype-header>
    <Terrace />
    <div className="absolute inset-x-16 [inset-block-start:theme(spacing.4)] h-40" data-prototype-cloth>
      <Cloth id={`${id}-a`} />
      <h1 className="absolute inset-x-20 [inset-block-start:theme(spacing.12)] truncate text-center text-4xl font-bold leading-10 text-white" title={name}>{name}</h1>
    </div>
  </header>;
}

export function SignA({ team, id, background, shortLegs = false, irregular = false }: { team: Team; id: string; background: ImageExportBackgroundId; shortLegs?: boolean; irregular?: boolean }) {
  return <div className={`relative mx-6 min-w-0 ${shortLegs ? "h-28" : "h-36"}`} data-prototype-sign>
    <GroundSign background={background} shortLegs={shortLegs} irregular={irregular} />
    <h2 id={`${id}-${team.id}`} className="absolute inset-x-12 [inset-block-start:theme(spacing.6)] truncate text-center text-3xl font-bold leading-9 text-white" title={team.name}>{team.name}</h2>
  </div>;
}

export function HeaderB({ name, teams, id, background }: { name: string; teams: Team[]; id: string; background: ImageExportBackgroundId }) {
  return <header className="relative h-80 overflow-clip" data-prototype-header>
    <Terrace integrated />
    <svg className="absolute inset-0 size-full" viewBox="0 0 1280 320" aria-hidden="true">
      <path d="M72 32Q640 46 1208 32" fill="none" stroke="var(--export-frame-color)" strokeWidth="6" />
      <path d="M72 30Q640 44 1208 30" fill="none" stroke="color-mix(in oklch, var(--export-divider-color) 60%, white)" strokeWidth="3" />
    </svg>
    <div className="absolute inset-x-36 [inset-block-start:theme(spacing.2)] h-40" data-prototype-cloth>
      <Cloth id={`${id}-b`} integrated />
      <h1 className="absolute inset-x-16 [inset-block-start:theme(spacing.12)] truncate text-center text-4xl font-bold leading-10 text-white" title={name}>{name}</h1>
    </div>
    <div className="absolute inset-x-8 [inset-block-start:theme(spacing.44)] grid grid-cols-2 gap-8">
      {teams.map(team => <div className="relative mx-6 h-24 min-w-0" key={team.id} data-prototype-sign>
        <GroundSign background={background} mounted />
        <h2 id={`${id}-${team.id}`} className="absolute inset-x-12 [inset-block-start:theme(spacing.6)] truncate text-center text-3xl font-bold leading-9 text-white" title={team.name}>{team.name}</h2>
      </div>)}
    </div>
  </header>;
}

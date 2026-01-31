import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Index,
});

function ActionLink({
	to,
	label,
}: {
	to: string;
	label: string;
}) {
	return (
		<div className="relative w-full max-w-xs mx-auto group">
			<span className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-accent group-hover:w-full group-hover:h-full transition-all duration-300" />
			<span className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-accent group-hover:w-full group-hover:h-full transition-all duration-300" />
			<Link
				to={to}
				className="block w-full text-center px-10 py-5 text-sm font-bold tracking-[0.2em] uppercase text-black group-hover:text-accent transition-colors relative z-10"
			>
				{label}
			</Link>
		</div>
	);
}

function Index() {
	return (
		<div className="w-full flex items-center justify-center px-6 pb-10">
			<div className="w-full max-w-xl text-center">
				<div className="mb-16">
					<h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-6 text-black">
						URL Shortener
					</h1>
					<p className="text-black/50 md:text-lg text-base leading-relaxed max-w-md mx-auto font-medium">
						Create clean, shareable links and manage them effortlessly.
					</p>
				</div>

				<div className="flex flex-col gap-8">
					<ActionLink to="/create" label="Create Link" />
					<ActionLink to="/links" label="View All Links" />
				</div>
			</div>
		</div>
	);
}

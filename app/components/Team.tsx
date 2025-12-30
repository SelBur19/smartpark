import { Card } from "../components/ui/card";
import { Linkedin, Mail } from "lucide-react";

const team = [
	{
		name: "Ditma Zekja",
		role: "Teamleiter",
		image: "/ditmar.jpeg",
	},
	{
		name: "Redian Bilali",
		role: "Stellvertreter",
		image: "/redi.jpeg",
	},
	{
		name: "Enes Haxhaja",
		role: "Teammitglied",
		image: "/enes.jpeg",
	},
	
	{
		name: "Selma Burrja",
		role: "Teammitglied",
		image: "/selma.jpeg",
	},
	
];

const Team = () => {
	return (
		<section className="py-20 px-4">
			<div className="container mx-auto">
				<h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
					Meet Our <span className="text-yellow-500">Team</span>
				</h2>
				<p className="text-center text-foreground mb-12 max-w-2xl mx-auto">
					The brilliant minds behind ParkMaster's innovative parking solutions
				</p>
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
					{team.map((member, index) => (
						<Card
							key={index}
							className="overflow-hidden bg-card border-border transition-all duration-300 hover:scale-105 hover:shadow-xl"
						>
							<div className="aspect-square overflow-hidden">
								<img
									src={member.image}
									alt={member.name}
									className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
								/>
							</div>
							<div className="p-6">
								<h3 className="text-xl font-semibold mb-1 text-primary">
									{member.name}
								</h3>
								<p className="text-foreground mb-4">{member.role}</p>
								<div className="flex gap-3">
									<button className="p-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 transition-colors">
										<Linkedin className="h-5 w-5 text-white" />
									</button>
									<button className="p-2 rounded-lg bg-secondary hover:bg-card-hover transition-colors">
										<Mail className="h-5 w-5 text-primary" />
									</button>
								</div>
							</div>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
};

export default Team;
							
import { Car, Shield, Zap, Clock } from "lucide-react";
import { Card } from "../components/ui/card";

const features = [
	{
		icon: Car,
		title: "Real-Time Availability",
		description:
			"See available parking spots in real-time and reserve your space instantly",
	},
	{
		icon: Shield,
		title: "Secure & Safe",
		description:
			"Advanced security systems and 24/7 monitoring for your peace of mind",
	},
	{
		icon: Zap,
		title: "Quick Access",
		description:
			"Automated entry and exit with license plate recognition technology",
	},
	{
		icon: Clock,
		title: "Flexible Pricing",
		description: "Hourly, daily, and monthly plans to fit your parking needs",
	},
];

const Features = () => {
	return (
		<section className="py-20 px-4 bg-secondary/50">
			<div className="container mx-auto">
				<h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
					Why Choose <span className="text-yellow-500">Us</span>
				</h2>
				<p className="text-center text-foreground mb-12 max-w-2xl mx-auto">
					Experience the future of parking with our innovative features designed
					for your convenience
				</p>
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
					{features.map((feature, index) => (
						<Card
							key={index}
							className="p-6 bg-card border-border hover:bg-card-hover transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/20 group"
						>
							<div className="w-14 h-14 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4 group-hover:bg-yellow-500 transition-colors duration-300">
								<feature.icon className="h-7 w-7 text-yellow-600 dark:text-yellow-400 group-hover:text-white transition-colors duration-300" />
							</div>

							<h3 className="text-xl font-semibold mb-2 text-primary">
								{feature.title}
							</h3>
							<p className="text-foreground">{feature.description}</p>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
};

export default Features;
						
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const user = localStorage.getItem("user");
		setIsLoggedIn(!!user && user !== "undefined" && user !== "null");
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("user");
		setIsLoggedIn(false);
		router.push("/login");
	};

	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					<Link href="/" className="flex items-center gap-2 group">
						<img
							src="/logo_web_final.png"
							alt="Smart Park Logo"
							className="h-12 w-16 transition-transform group-hover:scale-110"
						/>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center gap-8">
						<Link
							href="/"
							className="text-foreground hover:text-primary transition-colors"
						>
							Home
						</Link>
						<Link
							href="/contact"
							className="text-foreground hover:text-primary transition-colors"
						>
							Contact
						</Link>
						<div className="flex gap-3">
							{isLoggedIn ? (
								<>
									<Link href="/dashboard">
										<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
											Dashboard
										</Button>
									</Link>
									<Button
										className="border-border hover:bg-card-hover"
										onClick={handleLogout}
									>
										Logout
									</Button>
								</>
							) : (
								<>
									<Link href="/login">
										<Button
											className="border-border hover:bg-card-hover"
										>
											Login
										</Button>
									</Link>
									<Link href="/signup">
										<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
											Sign Up
										</Button>
									</Link>
								</>
							)}
						</div>
					</div>

					{/* Mobile Menu Button */}
					<button
						className="md:hidden text-foreground"
						onClick={() => setIsOpen(!isOpen)}
					>
						{isOpen ? (
							<X className="h-6 w-6" />
						) : (
							<Menu className="h-6 w-6" />
						)}
					</button>
				</div>

				{/* Mobile Navigation */}
				{isOpen && (
					<div className="md:hidden py-4 space-y-4">
						<Link
							href="/"
							className="block text-foreground hover:text-primary transition-colors"
							onClick={() => setIsOpen(false)}
						>
							Home
						</Link>
						<Link
							href="/contact"
							className="block text-foreground hover:text-primary transition-colors"
							onClick={() => setIsOpen(false)}
						>
							Contact
						</Link>
						<div className="flex flex-col gap-2 pt-2">
							{isLoggedIn ? (
								<>
									<Link href="/dashboard" onClick={() => setIsOpen(false)}>
										<Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
											Dashboard
										</Button>
									</Link>
									<Button
										className="w-full border-border hover:bg-card-hover"
										onClick={() => {
											handleLogout();
											setIsOpen(false);
										}}
									>
										Logout
									</Button>
								</>
							) : (
								<>
									<Link href="/login" onClick={() => setIsOpen(false)}>
										<Button
											className="w-full border-border hover:bg-card-hover"
										>
											Login
										</Button>
									</Link>
									<Link href="/signup" onClick={() => setIsOpen(false)}>
										<Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
											Sign Up
										</Button>
									</Link>
								</>
							)}
						</div>
					</div>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
